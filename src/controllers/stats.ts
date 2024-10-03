import { myCache } from "../app.js";
import { TryCatch } from "../middlewares/error.js";
import { orderModel } from "../models/order.js";
import { productModel } from "../models/product.js";
import { userModel } from "../models/user.js";
import { calculatePercentage, getChartData, getInventories } from "../utils/features.js";

export const getDashboardStats = TryCatch(
    async (req, res, next) => {
        let stats = {};
        const key = "admin-stats";
        if(myCache.has(key)) {
            stats = JSON.parse(myCache.get(key) as string);
        } else {
            const today = new Date();
            const sixthMonthAgo = new Date();
            sixthMonthAgo.setMonth(sixthMonthAgo.getMonth() - 6);
            const thisMonth = {
                start: new Date(today.getFullYear(), today.getMonth(), 1),
                end: today,
            };
            const lastMonth = {
                start: new Date(today.getFullYear(), today.getMonth() - 1, 1),
                end: new Date(today.getFullYear(), today.getMonth(), 0)
            };
            const thisMonthProductsPromise = productModel.find({
                createdAt:{
                    $gte: thisMonth.start,
                    $lte: thisMonth.end,
                }
            });
            const lastMonthProductsPromise = productModel.find({
                createdAt:{
                    $gte: lastMonth.start,
                    $lte: lastMonth.end,
                }
            });
            const thisMonthUserPromise = userModel.find({
                createdAt:{
                    $gte: thisMonth.start,
                    $lte: thisMonth.end,
                }
            });
            const lastMonthUserPromise = userModel.find({
                createdAt:{
                    $gte: lastMonth.start,
                    $lte: lastMonth.end,
                }
            });
            const thisMonthOrderPromise = orderModel.find({
                createdAt:{
                    $gte: thisMonth.start,
                    $lte: thisMonth.end,
                }
            });
            const lastMonthOrderPromise = orderModel.find({
                createdAt:{
                    $gte: lastMonth.start,
                    $lte: lastMonth.end,
                }
            });

           // -------------------------------// 

            const lastSixMonthOrderPromise = orderModel.find({
                createdAt:{
                    $gte: sixthMonthAgo,
                    $lte: today,
                }
            });
            const latestTransactionPromise = orderModel.find({}).select([
                "orderItems","discount","status","total"
            ]).limit(4)

            const [
                thisMonthProducts,
                thisMonthUser,
                thisMonthOrder,
                lastMonthProducts,
                lastMonthUser,
                lastMonthOrder,
                productCount,
                userCount,
                allOrders,
                lastSixMonthOrder,
                categories,
                femaleUsersCount,
                latestTransaction
            ] = await Promise.all([
                thisMonthProductsPromise,
                thisMonthUserPromise,
                thisMonthOrderPromise,
                lastMonthProductsPromise,
                lastMonthUserPromise,
                lastMonthOrderPromise,
                productModel.countDocuments(),
                userModel.countDocuments(),
                orderModel.find({}).select("total"),
                lastSixMonthOrderPromise,
                productModel.distinct("category"),
                userModel.countDocuments({gender:"female"}),
                latestTransactionPromise
            ])

            const thisMonthRevenue = thisMonthOrder.reduce((total, order) => total + (order.total || 0),0);
            const lastMonthRevenue = lastMonthOrder.reduce((total, order) => total + (order.total || 0),0);
            const changePercent = {
                // revenue:calculatePercentage(354, 534),
                product: calculatePercentage(thisMonthProducts.length, lastMonthProducts.length),
                user:calculatePercentage(thisMonthUser.length, lastMonthUser.length),
                order: calculatePercentage(thisMonthOrder.length, lastMonthOrder.length)
            }
            const productChangePercent = calculatePercentage(thisMonthProducts.length, lastMonthProducts.length);
            const userChangePercent = calculatePercentage(thisMonthUser.length, lastMonthUser.length);
            const orderChangePercent = calculatePercentage(thisMonthOrder.length, lastMonthOrder.length);

            const revenue = allOrders.reduce((total, order) => total + (order.total || 0),0);
            const counts = {
                revenue:revenue,
                user:userCount,
                product:productCount,
                order: allOrders.length,
            }

            const orderMonthcounts = new Array(6).fill(0);
            const orderMonthlyRevenue = new Array(6).fill(0);

            lastSixMonthOrder.forEach((order) => {
                const creationDate = order.createdAt;
                const monthDiff = ( today.getMonth() - creationDate.getMonth() + 12 ) % 12;
                if(monthDiff < 6) {
                    orderMonthcounts[6 - monthDiff - 1] += 1;
                    orderMonthlyRevenue[6 - monthDiff - 1] += order.total;
                } 
            });

            //finding category percentage
            const categoryCount = await getInventories({
                categories,
                productCount
            })

            //gender ratio
            const UserRatio = {
                male:userCount - femaleUsersCount,
                female: femaleUsersCount
            }

            const modifiedTransaction = latestTransaction.map((i)=>({
                _id:i._id,
                discout:i.discount,
                amount:i.total,
                quantity:i.orderItems.length,
                status:i.status
            }))

            stats = {
                categoryCount,
                changePercent,
                counts,
                chart:{
                    order:orderMonthcounts,
                    revenue:orderMonthlyRevenue
                },
                UserRatio,
                latestTransaction: modifiedTransaction
            }

            myCache.set(key, JSON.stringify(stats))

        }
console.log(stats)
        return res.status(200).json({
            success:true,
            stats
        })
    }
);


export const getPieChart = TryCatch(
    async (req, res, next) => {
        let charts;
        const key = "admin-pie-chart";
        if(myCache.has(key)) {
            charts = JSON.parse(myCache.get(key) as string)
        } else {
            const [
                processingOrder,shippedOrder, deliveredOrder,categories,productCount,outOfStock,allOrders,
                allUsers,adminUsers,customerUsers
            ] = await Promise.all([
                orderModel.countDocuments({ status:"Processing" }),
                orderModel.countDocuments({ status:"Shipped" }),
                orderModel.countDocuments({ status:"Delivered" }),
                productModel.distinct("category"),
                productModel.countDocuments(),
                productModel.countDocuments({stock:0}),
                orderModel.find({}).select(["total", "discount","subtotal","tax","shippingCharges"]),
                userModel.find({}).select(["dob"]),
                userModel.countDocuments({ role:"admin" }),
                userModel.countDocuments({ role:"user" }),
            ]);
            
            const orderFullfillment = {
                processing: processingOrder,
                shipped:shippedOrder,
                delivered:deliveredOrder,

            };
            const productCategories = await getInventories({
                categories,
                productCount
            });
            const stockAvailibility = {
                inStock:productCount - outOfStock,
                outOfStock
            };
            const grossIncome = allOrders.reduce(
                (prev, order) => prev + ( order.total ||0 ),0
            );
            const discountCost = allOrders.reduce(
                (prev, order) => prev + ( order.discount ||0 ),0
            );
            const shippingCost = allOrders.reduce(
                (prev, order) => prev + ( order.shippingCharges ||0 ),0
            );
            const burnt = allOrders.reduce(
                (prev, order) => prev + ( order.tax ||0 ),0
            );
            const marketingCost = Math.round(grossIncome * (20 / 100));
            const netMargin = grossIncome - shippingCost - burnt - marketingCost - discountCost ;
            const revenueDistribution = {
                netMargin,
                discountCost,
                shippingCost,
                burnt,
                marketingCost
            };
            const usersAgeGroup = {
                teen:allUsers.filter((i)=> i.age < 20).length,
                adult:allUsers.filter((i)=> i.age >= 20 && i.age < 40).length,
                old:allUsers.filter((i)=> i.age >= 40).length
            }
            const adminCustomer = {
                admin:adminUsers,
                customes:customerUsers
            };
            charts = {
                orderFullfillment,
                productCategories,
                stockAvailibility,
                revenueDistribution,
                adminCustomer,
                usersAgeGroup 
            };

            myCache.set(key, JSON.stringify(charts));
        }
        return res.status(200).json({
            sucess:true,
            charts
        })
    }
);

export const getBarChart = TryCatch(
    async (req, res, next) => {
        let charts;
        const key = "admin-bar-chart";
        if(myCache.has(key)) {
            charts = JSON.parse(myCache.get(key) as string)
        } else {
            const today = new Date();
            const sixthMonthAgo = new Date();
            sixthMonthAgo.setMonth(sixthMonthAgo.getMonth() - 6);

            const twelthMonthAgo = new Date();
            twelthMonthAgo.setMonth(twelthMonthAgo.getMonth() - 12);

            const sixMonthProductPromise = productModel.find({
                createdAt:{
                    $gte: sixthMonthAgo,
                    $lte: today,
                }
            }).select("createdAt")

            const sixMonthUserPromise = userModel.find({
                createdAt:{
                    $gte: sixthMonthAgo,
                    $lte: today,
                }
            }).select("createdAt")

            const twelthMonthOrderPromise = orderModel.find({
                createdAt:{
                    $gte: twelthMonthAgo,
                    $lte: today,
                }
            }).select("createdAt")

            const [products, users, orders] = await Promise.all([
                sixMonthProductPromise,
                sixMonthUserPromise,
                twelthMonthOrderPromise
            ]);
            
            const productCount = getChartData({length:6,today,docArr:products}) ;
            const userCount = getChartData({length:6,today,docArr:users}) ;
            const orderCount = getChartData({length:12,today,docArr:orders}) ;

            charts = {
                users:userCount,
                products:productCount,
                orders:orderCount
            };

            myCache.set(key,JSON.stringify(charts));
        }
        return res.status(200).json({
            sucess:true,
            charts
        })
    }
);


export const getLineChart = TryCatch(
    async (req, res, next) => {
        let charts;
        const key = "admin-line-chart";
        if(myCache.has(key)) {
            charts = JSON.parse(myCache.get(key) as string)
        } else {
            const today = new Date();

            const twelthMonthAgo = new Date();
            twelthMonthAgo.setMonth(twelthMonthAgo.getMonth() - 12);
            const baseQuery = {
                createdAt:{
                    $gte: twelthMonthAgo,
                    $lte: today,
                }
            };

            const [products, users, orders] = await Promise.all([
                productModel.find({baseQuery}).select("createdAt"),
                userModel.find({baseQuery}).select("createdAt"),
                orderModel.find({baseQuery}).select(["createdAt", "discount", "total"])
            ]);
            
            const productCount = getChartData({length:12,today,docArr:products});
            const userCount = getChartData({length:12,today,docArr:users});

            const discount = getChartData({length:12,today,docArr:orders,property:"discount"});
            const revenue = getChartData({length:12,today,docArr:orders,property:"total"});

            charts = {
                users:userCount,
                products:productCount,
                discount,
                revenue
            };

            myCache.set(key,JSON.stringify(charts));
        }
        return res.status(200).json({
            sucess:true,
            charts
        })
    }
);