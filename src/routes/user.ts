import express from 'express';
import { deleteUser, getAllUser, getOneUser, newUser } from '../controllers/user.js';
import { adminOnly } from '../middlewares/auth.js';

const router = express.Router()

router.post("/new", newUser)  //  http://localhost:300/api/v1/user/new
router.get("/all", adminOnly, getAllUser)  //  http://localhost:300/api/v1/user/all
router.get("/:id", getOneUser)  //  http://localhost:300/api/v1/user/:id
router.delete("/:id", adminOnly, deleteUser)  //  http://localhost:300/api/v1/user/:id

export default router;

