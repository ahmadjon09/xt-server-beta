import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String }
  },
  { timestamps: true }
)

const ProductSchema = new mongoose.Schema(  
  {
    title: { type: String, required: true },
    description: { type: String, default: 'N/A' },
    in_price: { type: Number, required: true },
    out_price: { type: Number, required: true },
    ID: { type: String, required: true },
    selled_count: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    sale: { type: Number, default: 0 },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    photos: [{ type: String, required: true }],
    colors: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true }
      }
    ],
    sizes: [
      {
        size: { type: String, required: true }
      }
    ],
    reviews: [ReviewSchema],
    rating: { type: Number, default: 5 }
  },
  { timestamps: true }
)

export default mongoose.model('Product', ProductSchema)
