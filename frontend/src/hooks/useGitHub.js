import { useState } from 'react'
import { fetchUserRepos, fetchRepoDetails } from '../services/githubService.js'

export const useGitHub = () => {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchRepos = async (username) => {
    if (!username || username.trim() === '') {
      setError('Username is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchUserRepos(username.trim())
      setRepos(data.data || [])
    } catch (err) {
      const status = err?.response?.status

      if (status === 404) {
        setError('GitHub user not found. Check the username and try again.')
      } else if (status === 403) {
        setError('GitHub rate limit reached. Please wait a moment and try again.')
      } else if (status === 400) {
        setError(err?.response?.data?.error ?? 'Invalid request. Check the username.')
      } else if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setError('No internet connection. Please check your network.')
      } else {
        setError(err?.response?.data?.error ?? err?.message ?? 'Failed to fetch repositories. Please try again.')
      }

      setRepos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchFiles = async (owner, repo) => {
    if (!owner || owner.trim() === '') {
      setError('Repository owner is required')
      return
    }

    if (!repo || repo.trim() === '') {
      setError('Repository name is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await fetchRepoDetails(owner.trim(), repo.trim())
      return data.data
    } catch (err) {
      const status = err?.response?.status

      if (status === 404) {
        setError('Repository not found. It may be private or deleted.')
      } else if (status === 403) {
        setError('GitHub rate limit reached. Please wait a moment and try again.')
      } else if (status === 400) {
        setError(err?.response?.data?.error ?? 'Invalid request.')
      } else {
        setError(err?.response?.data?.error ?? err?.message ?? 'Failed to fetch repository files. Please try again.')
      }

      return null
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  const clearRepos = () => {
    setRepos([])
    setError(null)
  }

  return {
    repos,
    loading,
    error,
    fetchRepos,
    fetchFiles,
    clearError,
    // Backwards-compatible aliases for existing consumers
    getRepos: fetchRepos,
    getRepoDetails: fetchFiles,
    clearRepos,
    isLoading: loading,
  }
}
