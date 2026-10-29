import { Router } from 'express'
import {
  handleGenerateConfig,
  handleGenerateConfigFromStack,
  handleGenerateSslConfig,
  handleValidateConfig,
} from '../controllers/nginxController.js'

const router = Router()

// Config generation routes
router.post('/generate', handleGenerateConfig)
router.post('/generate/stack', handleGenerateConfigFromStack)
router.post('/generate/ssl', handleGenerateSslConfig)

// Config validation route
router.post('/validate', handleValidateConfig)

export default router
