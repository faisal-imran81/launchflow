import { useState, useEffect } from 'react'
import { getAllDeployments, getDeploymentById } from '../services/historyService.js'

export const useHistory = () => {
  const [deployments, setDeployments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchDeployments = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getAllDeployments()
      setDeployments(data.data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch deployments')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDeploymentById = async (id) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getDeploymentById(id)
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

  return { deployments, fetchDeployments, fetchDeploymentById, isLoading, error }
}
