import express from 'express';
import { deleteUser, getAllUser, getOneUser, newUser } from '../controllers/user.js';
import { adminOnly } from '../middlewares/auth.js';
import { getMyOrders, newOrder, getAllOrders, getSingleOrder, processOrder, deleteOrder } from '../controllers/order.js';

const router = express.Router()

router.post("/new", newOrder)  //  http://localhost:4000/api/v1/order/new

router.get("/my-orders", getMyOrders) //   http://localhost:4000/api/v1/order/my-orders

router.get("/all-orders", adminOnly, getAllOrders) //  http://localhost:4000/api/v1/order/all-orders

router.route('/:id').get(getSingleOrder).put(adminOnly, processOrder).delete(adminOnly, deleteOrder);

export default router;

