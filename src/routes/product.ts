import express from 'express';
import { adminOnly } from '../middlewares/auth.js';
import { deleteProduct, getAllProducts, newProduct, updateProduct } from '../controllers/product.js';
import { singleUpload } from '../middlewares/multer.js';
import { getLatestProduct } from '../controllers/product.js'
import { getCategories } from '../controllers/product.js'
import { getAdminProducts } from '../controllers/product.js'
import { getSingleProduct } from '../controllers/product.js'
const router = express.Router()

router.post('/new',adminOnly, singleUpload, newProduct) //ceate new product

router.get('/all',getAllProducts) //get all products by filter and search

router.get('/latest', getLatestProduct) //get latest products

router.get('/admin-products',adminOnly, getAdminProducts) // get all  products

router.get('/categories', getCategories) // get unique categories

// to get, Update, Delete Product
router.route('/:id').get(getSingleProduct).put(singleUpload,adminOnly, updateProduct).delete(adminOnly, deleteProduct)


export default router;

