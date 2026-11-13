import { getUserRepos, getRepoDetails, getRateLimit } from '../services/githubService.js'

/**
 * @async
 * @function fetchUserRepos
 * @description Fetches all public repositories for a given GitHub username using the
 * GitHub REST API. Returns repository name, description, language, stars, and URL.
 *
 * @route GET /api/github/repos/:username
 *
 * @param {import('express').Request} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.username - GitHub username to fetch repositories for
 *
 * @param {import('express').Response} res - Express response object
 *
 * @returns {Promise<void>} JSON response containing an array of repository objects
 *
 * @example
 * // GET /api/github/repos/faisal-imran81
 * // Response: { repos: [{ name: "launchflow", language: "JavaScript", stars: 12, ... }] }
 */
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

/**
 * @async
 * @function fetchRepoDetails
 * @description Fetches detailed metadata and the full file tree for a specific GitHub
 * repository. Used by the AI engine to analyze the codebase and detect the stack.
 *
 * @route GET /api/github/repo/:owner/:repo
 *
 * @param {import('express').Request} req - Express request object
 * @param {object} req.params - Route parameters
 * @param {string} req.params.owner - GitHub repository owner (username or organization)
 * @param {string} req.params.repo - GitHub repository name
 *
 * @param {import('express').Response} res - Express response object
 *
 * @returns {Promise<void>} JSON response containing repository metadata and file tree array
 *
 * @example
 * // GET /api/github/repo/faisal-imran81/launchflow
 * // Response: {
 * //   repo: { name: "launchflow", description: "...", language: "JavaScript" },
 * //   files: ["package.json", "src/index.js", "Dockerfile", ...]
 * // }
 */
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
