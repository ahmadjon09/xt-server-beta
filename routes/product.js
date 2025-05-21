import express from 'express'
import {
  AddReview,
  CreateNewProduct,
  DeleteProduct,
  getAllBrands,
  getAllCategories,
  getAllColors,
  GetAllProducts,
  GetOneProduct,
  GetRecentProducts,
  searchProducts,
  UpdateProduct
} from '../controllers/product.js'
import isExisted from '../middlewares/isExisted.js'
import IsAdmin from '../middlewares/IsAdmin.js'

const router = express.Router()

router.get('/', GetAllProducts)
router.get('/one/:id', GetOneProduct)
router.get('/newproducts', GetRecentProducts)
router.get('/allbrands', getAllBrands)
router.get('/allcolors', getAllColors)
router.get('/allcategory', getAllCategories)
router.get('/search', searchProducts)

router.post('/create', isExisted, IsAdmin, CreateNewProduct)
router.put('/:id', isExisted, IsAdmin, UpdateProduct)
router.delete('/:id', isExisted, IsAdmin, DeleteProduct)

router.post('/:id/review', AddReview)

export default router
