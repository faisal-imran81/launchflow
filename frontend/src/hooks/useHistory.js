import { useState, useEffect } from 'react'
import { fetchAllDeployments, fetchDeploymentById } from '../services/deploymentsService.js'

export const useHistory = () => {
  const [deployments, setDeployments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDeployments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchAllDeployments()
      setDeployments(data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch deployments')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchById = async (id) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchDeploymentById(id)
      return data
    } catch (err) {
      setError(err.message || 'Failed to fetch deployment')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDeployments()
  }, [])

  return { deployments, fetchDeployments, fetchById, isLoading, error }
}
