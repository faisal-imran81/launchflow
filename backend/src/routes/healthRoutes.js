import express from 'express'

const router = express.Router()

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  })
})

export default router
