const mongoose = require("mongoose");
const {Schema} = mongoose;

const userSchema = new Schema({
  email:{type:String,required:true},
  password: {type:Buffer,required:true},
  role:{type:String,required:true,default:"user"},
  addresses:{type:[Schema.Types.Mixed]},
  name:{type:String,required:true,default:"user"},
  salt:Buffer


    
})

const virtual = userSchema.virtual('id');
virtual.get(function(){
  return this._id;
})

userSchema.set('toJSON',{
  virtuals:true,
  versionKey:true,
  transform:function(doc,ret){delete ret._id}
})

exports.User= mongoose.model('User',userSchema)