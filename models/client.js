import mongoose from 'mongoose'

const ClientSchema = new mongoose.Schema(
  {
    phoneNumber: { type: Number, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    avatar: [{ type: String }],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    liked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    disliked: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
  },
  { timestamps: true }
)

export default mongoose.model('Client', ClientSchema)
