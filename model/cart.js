const mongoose = require("mongoose");
const {Schema} = mongoose;

const cartSchema = new Schema({
    quantity:{type:Number,required:true},
    product:{type:Schema.Types.ObjectId, ref:'Product',required:true},
    user:{type:Schema.Types.ObjectId,required:true,ref:'User'},

    
})

const virtual = cartSchema.virtual('id');
virtual.get(function(){
  return this._id;
})

cartSchema.set('toJSON',{
  virtuals:true,
  versionKey:true,
  transform:function(doc,ret){delete ret._id}
})

exports.Cart= mongoose.model('Cart',cartSchema)