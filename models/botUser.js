import mongoose from 'mongoose'

const botUserSchema = new mongoose.Schema({
  phoneNumber: { type: String, unique: true, sparse: true },
  telegramId: { type: String, required: true },
  diamonds: { type: Number, default: 0 },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'botUser' }]
})

export default mongoose.model('botUser', botUserSchema)
