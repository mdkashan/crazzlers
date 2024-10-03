import  mongoose  from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter name"]
    },
    photo:{
        type:String,
        required:[true,"Please add photo"],
    },
    price:{
        type:Number,
        required:[true,"Please add price"],
    },
    stock:{
        type:Number,
        required:[true,"Please enter stock"],
    },
    category:{
        type:String,
        required:[true,"Please enter category"],
        trim:true
    },
},{
    timestamps:true,
})

export const productModel = mongoose.model('Products', productSchema)
