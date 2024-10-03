import express from 'express';
import { adminOnly } from '../middlewares/auth.js';
import { newCoupon, applyDiscount, getAllCoupon, deleteCoupon, createPaymentIntent } from '../controllers/payment.js';

const router = express.Router()

router.post("/create", createPaymentIntent)  //  http://localhost:4000/api/v1/payment/create

router.get("/discount", applyDiscount)  //  http://localhost:4000/api/v1/payment/discount
router.post("/coupon/new", adminOnly, newCoupon)  //  http://localhost:4000/api/v1/payment/coupon/new
router.get("/coupon/all", adminOnly, getAllCoupon)  //  http://localhost:4000/api/v1/payment/coupon/all
router.delete("/coupon/:id",adminOnly, deleteCoupon)  //  http://localhost:4000/api/v1/payment/coupon/:id


export default router;

