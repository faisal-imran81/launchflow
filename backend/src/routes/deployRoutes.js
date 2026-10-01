import express from 'express'
import { triggerDeploy, getDeployStatus } from '../controllers/deployController.js'

const router = express.Router()

router.post('/trigger', triggerDeploy)
router.get('/status/:id', getDeployStatus)

export default router
