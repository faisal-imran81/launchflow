import { useState } from 'react'
import { fetchUserRepos, fetchRepoDetails } from '../services/githubService.js'

export const useGitHub = () => {
  const [repos, setRepos] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const getRepos = async (username) => {
    try {
      setIsLoading(true)
      setError(null)
      setRepos([])
      const data = await fetchUserRepos(username)
      setRepos(data.data || [])
      return data.data
    } catch (err) {
      setError(err.message || 'Failed to fetch repositories')
    } finally {
      setIsLoading(false)
    }
  }

  const getRepoDetails = async (owner, repo) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchRepoDetails(owner, repo)
      return data.data
    } catch (err) {
      setError(err.message || 'Failed to fetch repo details')
    } finally {
      setIsLoading(false)
    }
  }

  const clearRepos = () => {
    setRepos([])
    setError(null)
  }

  return { repos, getRepos, getRepoDetails, clearRepos, isLoading, error }
}
