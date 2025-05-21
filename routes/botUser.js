import express from 'express'
import { GetAllBotUsers, GetOneBotUser } from '../controllers/botCR.js'
const router = express.Router()

router.get('/', GetAllBotUsers)
router.get('/:id', GetOneBotUser)

export default router
