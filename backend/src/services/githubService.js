import dotenv from 'dotenv'
dotenv.config()

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_API = 'https://api.github.com'

const githubHeaders = {
  Authorization: `Bearer ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

export const getUserRepos = async (username) => {
  const response = await fetch(
    `${GITHUB_API}/users/${username}/repos?sort=updated&per_page=30&type=public`,
    { headers: githubHeaders }
  )

  if (!response.ok) {
    const error = await response.json()
    if (response.status === 404) throw new Error(`GitHub user "${username}" not found`)
    if (response.status === 403) throw new Error('GitHub API rate limit exceeded — try again later')
    throw new Error(error.message || 'Failed to fetch repositories')
  }

  const repos = await response.json()

  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    url: repo.html_url,
    cloneUrl: repo.clone_url,
    description: repo.description,
    language: repo.language,
    stars: repo.stargazers_count,
    updatedAt: repo.updated_at,
    defaultBranch: repo.default_branch,
  }))
}

export const getRepoDetails = async (owner, repo) => {
  const response = await fetch(
    `${GITHUB_API}/repos/${owner}/${repo}`,
    { headers: githubHeaders }
  )

  if (!response.ok) {
    const error = await response.json()
    if (response.status === 404) throw new Error(`Repository "${owner}/${repo}" not found`)
    if (response.status === 403) throw new Error('GitHub API rate limit exceeded — try again later')
    throw new Error(error.message || 'Failed to fetch repository details')
  }

  const data = await response.json()

  return {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    url: data.html_url,
    cloneUrl: data.clone_url,
    description: data.description,
    language: data.language,
    stars: data.stargazers_count,
    defaultBranch: data.default_branch,
  }
}

export const getRateLimit = async () => {
  const response = await fetch(
    `${GITHUB_API}/rate_limit`,
    { headers: githubHeaders }
  )

  if (!response.ok) throw new Error('Failed to fetch rate limit')

  const data = await response.json()
  return {
    limit: data.rate.limit,
    remaining: data.rate.remaining,
    reset: new Date(data.rate.reset * 1000).toLocaleTimeString(),
  }
}
