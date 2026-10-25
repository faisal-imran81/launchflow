import { Router } from 'express'
import {
  handleCreateRepo,
  handleListRepos,
  handleDeleteRepo,
  handlePushImage,
  handleListImages,
  handleDeleteImage,
} from '../controllers/ecrController.js'

const router = Router()

// Repository routes
router.post('/repositories', handleCreateRepo)
router.get('/repositories', handleListRepos)
router.delete('/repositories/:name', handleDeleteRepo)

// Image routes
router.post('/push', handlePushImage)
router.get('/repositories/:name/images', handleListImages)
router.delete('/repositories/:name/images', handleDeleteImage)

export default router
