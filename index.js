import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

import uploadFile from './middlewares/uploadFile.js'
import ClientRoutes from './routes/client.js'
import AdminRoutes from './routes/admin.js'
import ProductRoutes from './routes/product.js'
import OrderRoutes from './routes/order.js'
import BotUserRoutes from './routes/botUser.js'
import MapRoutes from './routes/map.js'
import NewsRoutes from './routes/carousel.js'
import PostsRoutes from './routes/post.js'

import axios from 'axios'
import BotUser from './models/botUser.js'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get('/', (_, res) => res.send('Hello Developers!'))
app.use('/uploads', express.static('uploads'))
app.post('/upload', (req, res) => uploadFile(req, res))
app.use('/admin', AdminRoutes)
app.use('/client', ClientRoutes)
app.use('/product', ProductRoutes)
app.use('/order', OrderRoutes)
app.use('/botuser', BotUserRoutes)
app.use('/map', MapRoutes)
app.use('/news', NewsRoutes)
app.use('/posts', PostsRoutes)

const keepServerAlive = () => {
  setInterval(() => {
    Axios.get(process.env.RENDER_URL)
      .then(() => console.log('🔄 Server active'))
      .catch(() => console.log('⚠️ Ping failed'))
  }, 10 * 60 * 1000)
}

 keepServerAlive()

const startApp = async () => {
  const PORT = process.env.PORT || 3000
  try {
    await mongoose.connect(process.env.MONGODB_URL)
    console.log('✔️  MongoDB connected')
    const result = await BotUser.updateMany(
      { phoneNumber: null },
      { $unset: { phoneNumber: '' } }
    )
    console.log(`🛠️  Cleared ${result.modifiedCount} "null" phone numbers`)
    app.listen(PORT, () =>
      console.log(`✔️  Server is running on port: ${PORT} `)
    )
  } catch (error) {
    console.log(error)
  }
}

startApp()
