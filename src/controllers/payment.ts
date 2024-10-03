import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { couponModel } from "../models/coupon.js";
import ErrorHandler from "../utils/utility-class.js";


export const createPaymentIntent = TryCatch(
    async (req, res, next) => {
        const {amount} = req.body;
        if(!amount) {
            return next(new ErrorHandler("Please enter amount ", 400));
        }
        const paymentIntent = await stripe.paymentIntents.create({
            amount:Number(amount) * 100, 
            currency:"inr"
        })
        return res.status(201).json({
            sucess:true,
            clientSecret:paymentIntent.client_secret
        })
    }
)


export const newCoupon = TryCatch(
    async (req, res, next) => {
        const {coupon, amount} = req.body;
        if(!coupon || !amount) {
            return next(new ErrorHandler("Please enter both coupon and amount ", 400));
        }
        await couponModel.create({coupon, amount})
        return res.status(201).json({
            success:true,
            message:`Coupon ${coupon} created sucessfully.`
        })
    }
)


export const applyDiscount = TryCatch(
    async (req, res, next) => {
        const { coupon } = req.query;

        const discount = await couponModel.findOne({coupon})
        if(!discount) return next (new ErrorHandler("Invalid coupon code.", 400));
        return res.status(201).json({
            success:true,
            discount:discount.amount
        })
    }
)

export const getAllCoupon = TryCatch(
    async (req, res, next) => {

        const coupons = await couponModel.find({})
        return res.status(201).json({
            success:true,
            totalCoupons:coupons.length,
            coupons,
        })
    }
)

export const deleteCoupon = TryCatch(
    async (req, res, next) => {
        const { id } = req.params;
        const coupon = await couponModel.findByIdAndDelete(id)
        if(!coupon) return next(new ErrorHandler("Invalid Id", 400));
        return res.status(201).json({
            success:true,
            message:`Coupon ${coupon.coupon.toUpperCase()} deleted sucessfully.`
        })
    }
)