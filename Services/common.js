const passport = require("passport");


exports.isAuth=(req,res,done)=>{
    return passport.authenticate("jwt")
}

exports.sanitizerUser=(user)=>{
    return {id:user.id,role:user.role}
}
exports.cookieExtractor = function(req) {
    var token = null;
    if (req && req.cookies) {
        token = req.cookies['jwt'];
    }
    //token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0ZmFkNzM5YjBlMDViOTcyNzk4YWQ3NiIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjk0NjE3NTk0fQ.N3zvvPmoQoC0_IvdteHLyYxC9d-zhLWV_21svhWUteM";
    return token;
  };
  