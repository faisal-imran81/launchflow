import express from 'express'
import {
  triggerDeploy,
  getDeployStatus,
  updateDeployStatus
} from '../controllers/deployController.js'

const router = express.Router()

router.post('/trigger', triggerDeploy)
router.get('/status/:id', getDeployStatus)
router.patch('/status/:id', updateDeployStatus)

export default router
