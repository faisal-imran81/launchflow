import express from 'express'
import { getAllDeployments, getDeploymentById } from '../controllers/historyController.js'

const router = express.Router()

router.get('/', getAllDeployments)
router.get('/:id', getDeploymentById)

export default router
