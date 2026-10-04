import express from 'express'
import {
  fetchUserRepos,
  fetchRepoDetails,
  fetchRateLimit
} from '../controllers/githubController.js'

const router = express.Router()

router.get('/repos/:username', fetchUserRepos)
router.get('/repo/:owner/:repo', fetchRepoDetails)
router.get('/rate-limit', fetchRateLimit)

export default router
