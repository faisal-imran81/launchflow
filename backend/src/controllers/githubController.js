import { getUserRepos, getRepoDetails, getRateLimit } from '../services/githubService.js'

export const fetchUserRepos = async (req, res) => {
  try {
    const { username } = req.params

    if (!username || typeof username !== 'string' || username.trim() === '') {
      return res.status(400).json({ error: 'username parameter is required' })
    }

    if (username.trim().length > 100) {
      return res.status(400).json({ error: 'username is too long' })
    }

    const cleanUsername = username.trim()

    const repos = await getUserRepos(cleanUsername)

    res.status(200).json({
      success: true,
      data: repos,
      message: `Fetched ${repos.length} repositories for ${cleanUsername}`
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const fetchRepoDetails = async (req, res) => {
  try {
    const { owner, repo } = req.params

    if (!owner || typeof owner !== 'string' || owner.trim() === '') {
      return res.status(400).json({ error: 'owner parameter is required' })
    }

    if (!repo || typeof repo !== 'string' || repo.trim() === '') {
      return res.status(400).json({ error: 'repo parameter is required' })
    }

    const cleanOwner = owner.trim()
    const cleanRepo = repo.trim()

    const repoDetails = await getRepoDetails(cleanOwner, cleanRepo)

    res.status(200).json({
      success: true,
      data: repoDetails,
      message: 'Repository details fetched successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const fetchRateLimit = async (req, res) => {
  try {
    const data = await getRateLimit()
    res.status(200).json({
      success: true,
      data,
      message: 'Rate limit fetched successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
