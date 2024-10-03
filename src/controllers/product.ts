import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery }  from '../types/type.js'
import { productModel } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";


export const newProduct = TryCatch(
    async(req: Request<{},{},NewProductRequestBody,{}>, res, next)=>{
        const {name, price, category, stock } = req.body 
        const photo = req.file;
        if(!photo){
            return next(new ErrorHandler("Please add Photo.", 400))  
        }
        if(!name || !price || !category || !stock){
            rm(photo.path,()=> console.log("Cached Photo Deleted"));
            return next(new ErrorHandler("Please add all fields.", 400));  
        }
        const product = await productModel.create({name, price, category: category.toLowerCase(),stock,photo:photo?.path})

        invalidateCache({ product : true, admin: true})

            return res.status(201).json({
            success:true,
            message:"Product created sucessfully",
            product
         })
    }
)
//Revalidate on New, Update, Delete Product and on New Order 
export const getLatestProduct = TryCatch(
    async (req, res, next)=>{
        let products;
        if(myCache.has("latest-product")) {
            products = JSON.parse(myCache.get("latest-product") as string)
        }else{
            products = await productModel.find({}).sort({createdAt: -1}).limit(8)
            myCache.set("latest-product", JSON.stringify(products))
        }
        res.status(201).json({
            success:true,
            message:"all latest 8 products fetched sucessfully.",
            products
        })
    }
)

//Revalidate on New, Update, Delete Product and on New Order 
export const getAdminProducts = TryCatch(
    async (req, res, next)=>{
        let products;
        if(myCache.has("all-products")) {
            products = JSON.parse(myCache.get("all-products") as string)
        } else {
            products = await productModel.find({})
            myCache.set("all-products", JSON.stringify(products))
        }
        res.status(201).json({
            success:true,
            message:"admin products fetched sucessfully.",
            products
        })
    }
)

//Revalidate on New, Update, Delete Product and on New Order 
export const getCategories = TryCatch(
    async (req, res, next)=>{
        let categories;
        if(myCache.has("categories")){
            categories = JSON.parse(myCache.get("categories" ) as string)
        } else {
            categories = await productModel.distinct("category");
            myCache.set("categories", JSON.stringify(categories))
        }
        return res.status(200).json({
            success:true,
            categories
        })
    }
)

export const getSingleProduct = TryCatch(
    async (req, res, next)=>{
        let product;
        const id = req.params.id;
        if(myCache.has(`product-${id}`)){
            product = JSON.parse(myCache.get(`product-${id}`) as string);
        } else{
            product = await productModel.findById(id)
            if(!product) return next(new ErrorHandler("Invalid product ID.", 404));
            myCache.set(`product-${id}`, JSON.stringify(product))            
        }
        
        res.status(201).json({
            success:true,
            message:"Single producst fetched sucessfully.",
            product
        })
    }
)

export const updateProduct = TryCatch(
    async(req, res, next)=>{
        const { id } = req.params;
        const {name, price, category, stock } = req.body 
        const photo = req.file;
        const product = await productModel.findById(id);
        if(!product) {
            return next(new ErrorHandler("Invalid Product Id.", 404))
        }

        if(photo){
            rm(product.photo!, ()=>{
                console.log("Old photo deleted")
            })
            product.photo = photo.path;
        }
        if(name) product.name = name;
        if(price) product.price = price;
        if(stock) product.stock = stock;
        if(category) product.category = category;
        await product.save()

        invalidateCache({ product : true, admin:true,productId: String(product._id)})

        return res.status(201).json({
            success:true,
            message:"Product Updated sucessfully."
        })
    }
)

export const deleteProduct = TryCatch(
    async (req, res, next)=>{
        const id = req.params.id;
        const product = await productModel.findById(id)
        if(!product) {
            return next(new ErrorHandler("Invalid Product Id.", 404))
        }
        rm(product.photo,()=>{
            console.log("Product photo deleted sucessfully.")
        });
        await product.deleteOne()
        
        invalidateCache({ product : true, admin:true, productId: String(product._id)})

        return res.status(201).json({
            success:true,
            message:"Product deleted sucessfully.",
        })
    }
)

export const getAllProducts = TryCatch(
    async (req:Request<{},{},{},SearchRequestQuery>, res, next)=>{
        const { search, sort , price, category } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
        const skip = (page - 1) * limit;
        const baseQuery: BaseQuery = {}
        if(search) {
            baseQuery.name = {
              $regex: search,
              $options:"i",
            }   
        };
        if(price) {
            baseQuery.price = {
                $lte: Number(price)
            };
        };
        if(category) baseQuery.category = category;
        const products = await productModel.find(baseQuery).sort(
            sort && { price:sort === "asc" ? 1 : -1}
        ).limit(limit).skip(skip)
        const fliteredProducts = await productModel.find(baseQuery);
        const totalPage = Math.ceil(fliteredProducts.length / limit); 
        res.status(201).json({
            success:true,
            message:"filtered products.",
            products,
            totalPage
        })
    }
)