import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import deployRoutes from './routes/deployRoutes.js'
import historyRoutes from './routes/historyRoutes.js'
import projectsRoutes from './routes/projectsRoutes.js'
import githubRoutes from './routes/githubRoutes.js'
import aiRoutes from './routes/aiRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFound } from './middleware/notFound.js'
import healthRoutes from './routes/healthRoutes.js'
import { validateJson } from './middleware/validateJson.js'
import { requestLogger } from './middleware/requestLogger.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(requestLogger)
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'LaunchFlow API running ✅' })
})

app.use('/api/deploy', deployRoutes)
app.use('/api/history', historyRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/health', healthRoutes)
app.use(notFound)
app.use(validateJson)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
