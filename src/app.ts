import express from 'express';
import userRoute from './routes/user.js'
import productRoute from './routes/product.js'
import orderRoute from './routes/order.js'
import paymentRoute from './routes/payment.js'
import dashboardRoute from './routes/stats.js'
import { connectDB } from './utils/features.js';
import { errorMiddleware } from './middlewares/error.js';
import  NodeCache  from "node-cache";
import dotenv from 'dotenv'
import morgan from 'morgan'
import Stripe from 'stripe';
import cors from 'cors';
dotenv.config();
const app = express();

app.use(express.json())
app.use(morgan("dev"))
app.use(cors());
const PORT = process.env.PORT || 6000;
const stripeKey = process.env.STRIPE_KEY || "" ;
// const mongoURI = process.env.DB_URL || "" ;
// data base connection
connectDB();

export const stripe = new Stripe(stripeKey); 

export const myCache = new NodeCache()

// User Route
app.use("/api/v1/user", userRoute); 
app.use("/api/v1/product", productRoute); 
app.use("/api/v1/order", orderRoute); 
app.use("/api/v1/payment", paymentRoute); 
app.use("/api/v1/dashboard", dashboardRoute); 

app.use("/uploads", express.static("uploads"))
app.use(errorMiddleware)

app.listen(PORT, ()=>{
    console.log(`App is up and listening on ${PORT}`)
})