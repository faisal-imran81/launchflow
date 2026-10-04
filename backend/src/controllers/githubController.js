import { getUserRepos, getRepoDetails } from '../services/githubService.js'

export const fetchUserRepos = async (req, res) => {
  try {
    const { username } = req.params

    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'GitHub username is required'
      })
    }

    const repos = await getUserRepos(username)

    res.status(200).json({
      success: true,
      data: repos,
      message: `Fetched ${repos.length} repositories for ${username}`
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const fetchRepoDetails = async (req, res) => {
  try {
    const { owner, repo } = req.params

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        error: 'Owner and repo name are required'
      })
    }

    const repoDetails = await getRepoDetails(owner, repo)

    res.status(200).json({
      success: true,
      data: repoDetails,
      message: 'Repository details fetched successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
