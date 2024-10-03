import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
    coupon:{
        type:String,
        required:[true, "Please enter the Coupon code."],
        unique:true,
    },
    amount:{
        type:Number,
        required:[true, "Please enter the discount amount."],
    },
})

export const couponModel = mongoose.model("Coupons", couponSchema);