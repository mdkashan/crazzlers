import { NextFunction, Request, Response } from "express";
import { TryCatch } from "./error.js";
import ErrorHandler from "../utils/utility-class.js";
import { userModel } from "../models/user.js";

export const adminOnly = TryCatch(
    async (req: Request, res: Response, next: NextFunction)=>{
        const {id} = req.query;
        if(!id) {
            return next(new ErrorHandler("Please Login first.", 401))
        }
        const user = await userModel.findById(id)

        if(!user) {
            return next(new ErrorHandler("Invalid ID.", 403))
        }
        if(user.role !== "admin") {
            return next(new ErrorHandler("Unauthorized login...", 403))
        }
        next()
    }
)