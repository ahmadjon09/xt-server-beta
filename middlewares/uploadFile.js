import multer from 'multer'
import crypto from 'crypto'
import path from 'path'
import fs from 'fs'

const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const hash = crypto.randomBytes(16).toString('hex')
    const ext = path.extname(file.originalname)
    cb(null, `${hash}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false)
    }
    cb(null, true)
  }
})

export default function uploadHandler (req, res) {
  upload.array('images')(req, res, err => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res
          .status(400)
          .json({ message: 'File size is too large. Max limit is 5MB.' })
      }
    } else if (err) {
      return res.status(400).json({ message: err.message })
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' })
    }

    const uploadedImages = req.files.map(
      file =>
        `${req.secure ? 'https' : 'https'}://${req.get('host')}/uploads/${
          file.filename
        }`
    )

    res.status(200).json({
      message: 'Images successfully uploaded!',
      images: uploadedImages
    })
  })
}
