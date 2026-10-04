import api from './api.js'

export const fetchUserRepos = async (username) => {
  const response = await api.get(`/github/repos/${username}`)
  return response.data
}

export const fetchRepoDetails = async (owner, repo) => {
  const response = await api.get(`/github/repo/${owner}/${repo}`)
  return response.data
}
