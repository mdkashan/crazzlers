import mongoose, { Document } from "mongoose"
import { InvalidateCacheProps, OrderItemType } from "../types/type.js";
import { myCache } from "../app.js";
import { productModel } from "../models/product.js";
import { orderModel } from "../models/order.js";
export const connectDB = ()=>{
    mongoose.connect(process.env.DB_URL || "", {dbName:"Crazzler"})
    .then((res)=> {
        console.log("Db connection succesfull");
    }).catch((err)=> {
        console.log(err);
    })
} 

export const invalidateCache = ({product, order, admin, userId, orderId, productId}:InvalidateCacheProps) => {
    if(product){
        const productKeys:string[] = ["latest-product","categories","all-products",`product-${productId}`];
        if(typeof productId === "string") productKeys.push(`product-${productId}`)
        if(typeof productId === "object") {
            productId.forEach((i)=>{
                productKeys.push(`product-${i}`)
            })
        }
        
        myCache.del(productKeys)
    }
    if(order){
        const orderKeys: string[] = ["all-orders", `my-order-${userId}, order-${orderId}`];
        myCache.del(orderKeys)
    }
    if(admin){
        myCache.del(["admin-stats", "admin-pie-chart", "admin-line-chart", "admin-bar-chart"])
    }
}

export const reduceStock = async (orderItems: OrderItemType[]) => {
    for (let i = 0; i < orderItems.length; i++) {
        const order = orderItems[i];
        const product = await productModel.findById(order.productId)
        if(!product) throw new Error("Product not Found")
        product.stock -= order.quantity;
        await product.save()
    }
}

export const calculatePercentage = (thisMonth: number, lastMonth:number)=> {
    if(lastMonth===0) return thisMonth*100;
    const percent = (thisMonth / lastMonth) * 100;
    return Number(percent.toFixed(0));
}

export const getInventories = async ({categories, productCount}:{categories:string[], productCount:number})=>{
    const categoriesCountPromise = categories.map((category)=> productModel.countDocuments({category}));
    const categoriesCount = await Promise.all(categoriesCountPromise);
    const categoryCount: Record<string,number>[] = []
    categories.forEach((category, i)=> {
        categoryCount.push({
            [category]:Math.round(categoriesCount[i] / productCount * 100),
        })
    })
    return categoryCount
}

interface MyDocument extends Document {
    createdAt:Date;
    discount?:number;
    total?:number;
} 

type FuncProps = {
    length:number;
    docArr:MyDocument[];
    today:Date;
    property?:"discount" | "total";
}

export const getChartData = ({length, docArr, today, property}:FuncProps) => {
    const data = new Array(length).fill(0);
    docArr.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = ( today.getMonth() - creationDate.getMonth() + 12 ) % 12;
        if(monthDiff < length) {
            if(property){
                data[length - monthDiff - 1] += i[property]!;
            }else{
                data[length - monthDiff - 1] += 1;
            }
        } 
    });
    return data;
}