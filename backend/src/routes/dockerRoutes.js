import { Router } from 'express'
import {
  handleBuildImage,
  handleListImages,
  handleRemoveImage,
  handleRunContainer,
  handleStopContainer,
  handleRemoveContainer,
  handleGetContainerLogs,
} from '../controllers/dockerController.js'

const router = Router()

// Image routes
router.post('/build', handleBuildImage)
router.get('/images', handleListImages)
router.delete('/images/:tag', handleRemoveImage)

// Container routes
router.post('/containers/run', handleRunContainer)
router.post('/containers/:id/stop', handleStopContainer)
router.delete('/containers/:id', handleRemoveContainer)
router.get('/containers/:id/logs', handleGetContainerLogs)

export default router
