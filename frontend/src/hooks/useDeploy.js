import { useState } from 'react'
import { triggerDeployment, getDeploymentStatus } from '../services/deployService.js'
import { createNewProject } from '../services/projectsService.js'

export const useDeploy = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deployment, setDeployment] = useState(null)
  const [project, setProject] = useState(null)

  const deploy = async (repoUrl, appName, environment) => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await triggerDeployment(repoUrl, appName, environment)
      setDeployment(data.data?.deployment || null)
      setProject(data.data?.project || null)
      return data
    } catch (err) {
      setError(err.message || 'Deployment failed')
    } finally {
      setIsLoading(false)
    }
  }

  const checkStatus = async (id) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await getDeploymentStatus(id)
      setDeployment(data.data || null)
      return data
    } catch (err) {
      setError(err.message || 'Failed to fetch status')
    } finally {
      setIsLoading(false)
    }
  }

  const clearError = () => setError(null)

  return { deploy, checkStatus, clearError, isLoading, error, deployment, project }
}
