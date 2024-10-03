import { NextFunction, Response, Request } from "express";

export interface NewUserRequestBody {
    _id:string;
    name:string;
    email:string;
    photo:string;
    gender: string;
    dob:Date;
}

export type ControllerType = (req: Request, res: Response, next: NextFunction)=>Promise<void | Response<any, Record<string, any>>>;

export interface NewProductRequestBody
{
    name:string;
    photo:string;
    price:number;
    stock:number;
    category:string;
}

export type SearchRequestQuery = {
    search?:string;
    price?:string;
    category?:string;
    sort?:string;
    page?:string;
}

export interface BaseQuery {
    name?: {
        $regex:string;
        $options:"i"
    };
    price?: {
        $lte : number;
    },
    category?: string;
}

export type InvalidateCacheProps = {
    product?: boolean;
    order?: boolean;
    admin?: boolean;
    userId?:string;
    orderId?:string;
    productId?:string | string[];
}
export type OrderItemType = {
    name:string;
    photo:string;
    price:number;
    quantity:number;
    productId:string;
}
export type ShippingInfoType = {
    address:string;
    city:string;
    country:string;
    state:string;
    pincode:number;
}
export interface NewOrderRequestBody {

    shippingInfo:ShippingInfoType,
    user:string,
    subtotal:number,
    shippingCharges:number,
    discsount:number,
    tax:number,
    total:number,
    discount:number,
    orderItems: OrderItemType[]
}