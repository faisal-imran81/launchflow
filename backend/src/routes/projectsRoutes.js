import express from 'express'
import {
  addProject,
  listProjects,
  getProject,
  removeProject
} from '../controllers/projectsController.js'

const router = express.Router()

router.post('/', addProject)
router.get('/', listProjects)
router.get('/:id', getProject)
router.delete('/:id', removeProject)

export default router
