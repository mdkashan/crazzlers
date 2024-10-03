import { Request, Response, NextFunction } from "express";
import { userModel } from "../models/user.js";
import { NewUserRequestBody }  from '../types/type.js'
import ErrorHandler from "../utils/utility-class.js";
import { TryCatch } from "../middlewares/error.js";
export const newUser =  TryCatch(
    async(req:Request<{},{},NewUserRequestBody,{}>, res:Response, next:NextFunction) => {
            const {name, email, gender, photo, _id, dob} = req.body;
            let user = await userModel.findById(_id);
            if(user) {
                return res.status(200).json({
                success:true,
                message: `Welcome, ${user.name}`
                })
            }

            if(!name || !email || !gender || !photo || !_id || !dob) {
                next(new ErrorHandler("Please fill all fields.", 400))
            }

            user = await userModel.create({name, email, gender, photo, _id, dob:new Date(dob)})
            res.status(201).json({
                success:true,
                message: `Welcome, ${user.name}`
            }) 
        
            res.status(400).json({
                success:false,
                message: `Some error while creating new user.`
            }) 
        }
);

export const getAllUser = TryCatch(
    async (req, res,next) => {
        const users = await userModel.find({})
        return res.status(201).json({
            success:true,
            totalUsers:users.length,
            users
        })
    }
)

export const getOneUser = TryCatch(
    async (req, res,next) => {
        const id = req.params.id
        const user = await userModel.findById(id)
        if(!user){
            return next( new ErrorHandler("Invalid ID", 400))
        }
        return res.status(201).json({
            success:true,
            user
        })
    }
)

export const deleteUser = TryCatch(
    async (req, res,next) => {
        const id = req.params.id
        const user = await userModel.findById(id)

        if(!user){
            return next( new ErrorHandler("Invalid ID", 400))
        }
        await user.deleteOne();
        return res.status(201).json({
            success:true,
            message:`User with email ${user.email} deleted sucessfully.`
        })
    }
)