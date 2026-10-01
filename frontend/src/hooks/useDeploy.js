import { useState } from 'react'
import { triggerDeployment, getDeploymentStatus } from '../services/deployService.js'

export const useDeploy = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deployment, setDeployment] = useState(null)

  const deploy = async (repoUrl, appName, environment) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await triggerDeployment(repoUrl, appName, environment)
      setDeployment(data)
      return data
    } catch (err) {
      setError(err.message || 'Deployment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const checkStatus = async (id) => {
    try {
      const data = await getDeploymentStatus(id)
      setDeployment(data)
      return data
    } catch (err) {
      setError(err.message || 'Failed to fetch status')
    }
  }

  return { deploy, checkStatus, isLoading, error, deployment }
}
