import generateShortID from '../middlewares/generateShortID.js'
import Product from '../models/product.js'
import stringSimilarity from 'string-similarity'
const sendErrorResponse = (res, statusCode, message, error = null) => {
  return res.status(statusCode).json({ message, error: error?.message })
}

export const CreateNewProduct = async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body,
      ID: generateShortID()
    })
    await newProduct.save()
    return res
      .status(201)
      .json({ message: 'Product created successfully', product: newProduct })
  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error.', error)
  }
}

export const GetAllProducts = async (_, res) => {
  try {
    const products = await Product.find()
    if (products.length === 0) {
      return res.status(404).json({ message: 'No products found.' })
    }
    return res.status(200).json({ data: products })
  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error.', error)
  }
}

export const GetOneProduct = async (req, res) => {
  const { id } = req.params
  try {
    const product = await Product.findById(id).populate('reviews.user', 'title')
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }
    return res.status(200).json({ data: product })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error.', error: error.message })
  }
}

export const UpdateProduct = async (req, res) => {
  const { id } = req.params
  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true
    })
    if (!updatedProduct) {
      return sendErrorResponse(res, 404, 'Product not found.')
    }
    return res
      .status(200)
      .json({ message: 'Product updated successfully', data: updatedProduct })
  } catch (error) {
    if (error.title === 'CastError') {
      return sendErrorResponse(res, 400, 'Invalid product ID.', error)
    }
    return sendErrorResponse(res, 500, 'Internal server error.', error)
  }
}

export const DeleteProduct = async (req, res) => {
  const { id } = req.params
  try {
    const deletedProduct = await Product.findByIdAndDelete(id)
    if (!deletedProduct) {
      return sendErrorResponse(res, 404, 'Product not found.')
    }
    return res
      .status(200)
      .json({ message: 'Product has been deleted successfully.' })
  } catch (error) {
    if (error.title === 'CastError') {
      return sendErrorResponse(res, 400, 'Invalid product ID.', error)
    }
    return sendErrorResponse(res, 500, 'Internal server error.', error)
  }
}

export const AddReview = async (req, res) => {
  const { id } = req.params
  const { userId, rating, comment } = req.body

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' })
  }

  try {
    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' })
    }

    product.reviews.push({ user: userId, rating, comment })

    const totalRatings = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    )
    product.rating = totalRatings / product.reviews.length

    await product.save()

    return res
      .status(201)
      .json({ message: 'Review added successfully', product })
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Internal server error.', error: error.message })
  }
}

export const GetRecentProducts = async (_, res) => {
  try {
    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    let products = await Product.find({ createdAt: { $gte: oneWeekAgo } }).sort(
      { createdAt: -1 }
    )

    if (products.length === 0) {
      products = await Product.find({ createdAt: { $gte: oneMonthAgo } }).sort({
        createdAt: -1
      })
    }

    if (products.length === 0) {
      return res.status(404).json({ message: 'No recent products found.' })
    }

    return res.status(200).json({ data: products })
  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error.', error)
  }
}

export const getAllBrands = async (_, res) => {
  try {
    const brands = await Product.distinct('brand')

    if (brands.length === 0) {
      return res.status(404).json({ message: 'No brands found.' })
    }

    return res.status(200).json({ data: brands })
  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error.', error)
  }
}

export const getAllColors = async (_, res) => {
  try {
    const colors = await Product.distinct('colors')

    if (colors.length === 0) {
      return res.status(404).json({ message: 'No colors found.' })
    }

    return res.status(200).json({ data: colors })
  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error.', error)
  }
}

export const searchProducts = async (req, res) => {
  try {
    const { search } = req.query

    if (!search || search.trim() === '') {
      const randomProducts = await Product.aggregate([{ $sample: { size: 5 } }])
      return res.status(200).json({
        message: 'Random products',
        data: randomProducts,
        suggestions: []
      })
    }

    const allProducts = await Product.find()
    const searchText = search.toLowerCase()

    // Faqat title emas, boshqa maydonlarni ham qo‘shamiz
    const preparedProducts = allProducts.map(product => {
      const combinedText = [
        product.title,
        product.brand,
        product.colors,
        product.description
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return { product, combinedText }
    })

    const allTexts = preparedProducts.map(p => p.combinedText)

    const matches = stringSimilarity.findBestMatch(searchText, allTexts)

    const similarIndexes = matches.ratings
      .filter(r => r.rating >= 0.3)
      .sort((a, b) => b.rating - a.rating)
      .map(r => allTexts.indexOf(r.target))

    const matchedProducts = similarIndexes.map(i => preparedProducts[i].product)

    if (matchedProducts.length === 0) {
      return res.status(404).json({
        message: 'No matching products found.',
        data: [],
        suggestions: allProducts.slice(0, 5).map(p => p.title)
      })
    }

    const suggestions = matchedProducts.map(p => p.title)

    return res.status(200).json({
      message: 'Search results',
      data: matchedProducts,
      suggestions: suggestions
        .map(p => p.title)
        .filter(title => !!title)
        .slice(0, 5)
    })
  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error.', error)
  }
}

export const getSaleProducts = async (_, res) => {
  try {
    const saleProducts = await Product.find({ sale: { $gt: 0 } })

    if (saleProducts.length === 0) {
      return res.status(404).json({
        message: 'Hozircha aksiya mahsulotlari mavjud emas.',
        data: []
      })
    }

    return res.status(200).json({
      message: 'Aksiya mahsulotlari ro‘yxati',
      data: saleProducts
    })
  } catch (error) {
    return sendErrorResponse(res, 500, 'Serverda xatolik yuz berdi.', error)
  }
}

export const getAllCategories = async (_, res) => {
  try {
    const categories = await Product.distinct('category')
    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: 'No categories found.' })
    }

    return res.status(200).json({ data: categories })
  } catch (error) {
    return sendErrorResponse(
      res,
      501,
      'Internal server error. Get category',
      error
    )
  }
}
