import express from 'express'
import {
  fetchUserRepos,
  fetchRepoDetails
} from '../controllers/githubController.js'

const router = express.Router()

router.get('/repos/:username', fetchUserRepos)
router.get('/repo/:owner/:repo', fetchRepoDetails)

export default router
