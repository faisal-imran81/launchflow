import { Router } from 'express'
import {
  handleLaunchInstance,
  handleDescribeInstance,
  handleListInstances,
  handleStopInstance,
  handleStartInstance,
  handleTerminateInstance,
} from '../controllers/ec2Controller.js'

const router = Router()

// Instance routes
router.post('/launch', handleLaunchInstance)
router.get('/instances', handleListInstances)
router.get('/instances/:id', handleDescribeInstance)
router.post('/instances/:id/stop', handleStopInstance)
router.post('/instances/:id/start', handleStartInstance)
router.delete('/instances/:id', handleTerminateInstance)

export default router
