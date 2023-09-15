const mongoose = require("mongoose");
const {Schema} = mongoose;

const productSchema = new Schema({
    title:{type:String,required:true,unique:true},
    description: {type:String,required:true},
    price :{type:Number,required:true,min:[0,' wrong min price']},
    discountPercentage: {type:Number,required:true},
    rating: {type:Number,required:true},
    stock: {type:Number,required:true},
    brand :{type:String,required:true},
    category: {type:String,required:true},
    thumbnail: {type:String,required:true},
    images: {type:[String],required:true},
    deleted: {type:Boolean}
    
})

const virtual = productSchema.virtual('id');
virtual.get(function(){
  return this._id;
})

productSchema.set('toJSON',{
  virtuals:true,
  versionKey:true,
  transform:function(doc,ret){delete ret._id}
})

exports.Product= mongoose.model('Product',productSchema)