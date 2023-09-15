const express = require("express");
dotenv = require("dotenv").config()
const server = express();
const mongoose = require("mongoose");
const { createProduct } = require("./controller/Product");
const productRouter = require("./routes/product");
const brandsRouter = require("./routes/brands");
const categoryRouter = require("./routes/category");
const cors = require("cors");
const userRouter = require("./routes/User");
const authRouter = require("./routes/Auth");
const cartRouter = require("./routes/Cart");
const orderRouter = require("./routes/Order");
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const jwt = require('jsonwebtoken');

var passport = require("passport");
const { User } = require("./model/user");
const crypto = require("crypto");
const { isAuth, sanitizerUser, cookieExtractor } = require("./Services/common");
const cookieParser = require("cookie-parser");
const path = require("path");





const endpointSecret = process.env.ENDPOINT_SECRET;

server.post('/webhook', express.raw({type: 'application/json'}), async (request, response) => {
  const sig = request.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      const order = await Order.findById(paymentIntentSucceeded.metadata.orderId)
      order.paymentStatus = 'recieved';
      await order.save();
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
});


const opts = {};
opts.jwtFromRequest = cookieExtractor;
opts.secretOrKey = process.env.JWT_SECRET_KEY;
server.use(express.static(path.resolve(__dirname,'build')))
server.use(cookieParser())
server.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
  })
);


server.use(passport.authenticate("session"));

server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);


server.use(express.json());
main().catch((err) => {
  console.log(err);
});
server.use("/products", isAuth(), productRouter.router);
server.use("/brands",isAuth(), brandsRouter.router);
server.use("/category",isAuth(), categoryRouter.router);
server.use("/users",isAuth(), userRouter.router);

server.use("/auth", authRouter.router);
server.use("/cart",isAuth(), cartRouter.router);
server.use("/orders",isAuth(), orderRouter.router);
server.get('*', (req, res) =>
  res.sendFile(path.resolve('build', 'index.html'))
);


passport.use('local',
  new LocalStrategy
  ({usernameField:'email'},
    async function (email, password, done) {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        done(null, false, { message: "invalid credentials" });
      }
      crypto.pbkdf2(
        password,
        user.salt,
        310000,
        32,
        "sha256",
        async function (err, hashedPassword) {
          if (!crypto.timingSafeEqual(user.password, hashedPassword)) {
            done(null, false, { message: "invalid credentials" });
          }
          const token = jwt.sign(sanitizerUser(user),process.env.JWT_SECRET_KEY );
          done(null, {id:user.id,role:user.role,token});
        }
      );
    } catch (err) {
      done(err);
    }
  })
);

passport.use('jwt',new JwtStrategy(opts, async function(jwt_payload, done) {

    try{    
        const user = await User.findById( jwt_payload.id)
        if (user) {
            return done(null, sanitizerUser(user));
        } else {
            return done(null, false);
            // or you could create a new account
        }
    } catch(err) {
        return done(err, false);
            
        }
       
}));

passport.serializeUser(function (user, cb) {
  console.log("serialize", user);
  process.nextTick(function () {
    return cb(null, { id: user.id, role: user.role });
  });
});

passport.deserializeUser(function (user, cb) {
  console.log("de-serialize", user);
  process.nextTick(function () {
    return cb(null, user);
  });
});


// This is your test secret API key.
const stripe = require("stripe")(process.env.SERVER_KEY);




server.post("/create-payment-intent", async (req, res) => {
  const { totalAmount ,orderId} = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: totalAmount*100,
    currency: "inr",
    // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
    automatic_payment_methods: {
      enabled: true,
    },
    metadata:{
      orderId
    }
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});
 

// Webhook







main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGODB_URL);
  console.log("connection sucessfull");
}

server.get("/", (req, res) => {
  res.json({ status: "success" });
});

server.listen(process.env.Port, () => {
  console.log("server started");
});
