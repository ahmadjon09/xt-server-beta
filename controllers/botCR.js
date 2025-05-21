import BotUser from '../models/botUser.js'

const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ message })
}

export const GetAllBotUsers = async (_, res) => {
  try {
    const users = await BotUser.find()
    return res.json(users)
  } catch (error) {
    return sendErrorResponse(res, 500, 'Internal server error.')
  }
}

export const GetOneBotUser = async (req, res) => {
  const { id } = req.params
  try {
    const user = await BotUser.findOne({ telegramId: id }).populate('referrals')
    if (!user) {
      return res.status(404).json({ message: 'user not found.' })
    }
    return res.status(200).json({ data: user })
  } catch (error) {
    return res.status(500).json({
      message: 'Internal server error. get one user',
      error: error.message
    })
  }
}
