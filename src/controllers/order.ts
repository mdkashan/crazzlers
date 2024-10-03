import { Response, Request, NextFunction } from "express";
import { TryCatch } from "../middlewares/error.js";
import { NewOrderRequestBody } from '../types/type.js'
import { orderModel } from "../models/order.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import ErrorHandler from "../utils/utility-class.js";
import { myCache } from "../app.js";

export const newOrder = TryCatch(
    async (req: Request<{},{}, NewOrderRequestBody, {} >,res: Response, next:NextFunction) => {

        const {shippingInfo, orderItems, user, subtotal, tax, shippingCharges, total, discount} = req.body; 
        if(!shippingInfo || !orderItems || !user || !subtotal || !total ) {
            return next(new ErrorHandler("Please enter all fields.", 400))
        }
        const order = await orderModel.create({shippingInfo, orderItems, user, subtotal, tax, shippingCharges, discount, total})
        await reduceStock(orderItems);
        invalidateCache({ product : true, order:true, admin: true, userId: user, productId: order.orderItems.map(i=> String(i.productId)) })

        return res.status(201).json({
            success:true,
            message:"Order placed sucessfully"
        });
    }

)

export const getMyOrders = TryCatch(
    async (req: Request,res: Response, next:NextFunction) => {
        const { id: user } = req.query;
        const key = `my-order-${user}`
        let orders = [];
        if(myCache.has(key)) {
            orders = JSON.parse(myCache.get(key) as string)
        } else{
            orders = await  orderModel.find({user})
            myCache.set("key", JSON.stringify(orders))
        }
        return res.status(201).json({
            success:true,
            orders
        })
    }
)

export const getAllOrders = TryCatch(
    async (req: Request,res: Response, next:NextFunction) => {
        const key = "all-orders";
        let orders = [];
        if(myCache.has(key)) {
            orders = JSON.parse(myCache.get(key) as string)
        } else{
            orders = await  orderModel.find().populate("user");
            myCache.set("key", JSON.stringify(orders))
        }
        return res.status(200).json({
            success:true,
            totalOrders:orders.length,
            orders
        })
    }
)

export const getSingleOrder = TryCatch(
    async (req, res, next) =>{
        const { id } = req.params;
        const key = `order-${id}`;

        let order ;
        if(myCache.has(key)) {
            order = JSON.parse(myCache.get(key) as string)
        } else{
            order = await  orderModel.findById(id).populate("user","name");
            if(!order) return next(new ErrorHandler("Order not found", 404))
            myCache.set("key", JSON.stringify(order))
        }
        return res.status(200).json({
            success:true,
            order
        })

    }
)

export const processOrder = TryCatch(
    async (req, res, next) =>{
        const { id } = req.params;
        const key = `order-${id}`;
        const order = await  orderModel.findById(id).populate("user","name");
        if(!order) return next(new ErrorHandler("Order not found", 404))
         
        switch (order.status) {
            case "Processing":
                order.status = "Shipped";
                break;
            case "Shipped":
                order.status = "Delivered";
                break;
            default:
                order.status = "Delivered";
                break;
        }
        await order.save()
        invalidateCache({ product : false, order:true, admin: true, userId: String(order.user),  orderId: String(order._id)})
        return res.status(200).json({
            success:true,
            message:"Order Processed sucessfully"
        });
    }
)

export const deleteOrder = TryCatch(
    async (req, res, next) =>{
        const { id } = req.params;
        const key = `order-${id}`;
        const order = await  orderModel.findById(id).populate("user","name");
        if(!order) return next(new ErrorHandler("Order not found", 404))
        await order.deleteOne()

        invalidateCache({ product : false, order:true, admin: true, userId: String(order.user),  orderId: String(order._id)})
        return res.status(200).json({
            success:true,
            message:"Order Deleted sucessfully"
        });
    }
)