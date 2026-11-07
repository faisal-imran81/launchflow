import { useState } from 'react'
import { triggerDeployment, getDeploymentStatus } from '../services/deployService.js'

export const useDeploy = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [deploymentId, setDeploymentId] = useState(null)
  const [containerId, setContainerId] = useState(null)
  const [status, setStatus] = useState(null)
  const [deployment, setDeployment] = useState(null)
  const [project, setProject] = useState(null)

  const deploy = async (payload, appName, environment) => {
    // Support both deploy(payload) and the legacy deploy(repoUrl, appName, environment)
    const isObjectPayload = payload && typeof payload === 'object'
    const repoUrl = isObjectPayload ? payload.repoUrl : payload
    const appNameArg = isObjectPayload ? payload.appName : appName
    const environmentArg = isObjectPayload ? payload.environment : environment

    if (!repoUrl || typeof repoUrl !== 'string' || repoUrl.trim() === '') {
      setError('repoUrl is required to start a deployment')
      return
    }

    setLoading(true)
    setError(null)
    setDeploymentId(null)
    setContainerId(null)
    setStatus(null)

    try {
      const data = await triggerDeployment(repoUrl.trim(), appNameArg, environmentArg)

      const body = data?.data ?? data
      const deploymentData = body?.deployment ?? data?.deployment ?? null
      const projectData = body?.project ?? data?.project ?? null

      // extract deploymentId — handle both response shapes
      const extractedDeploymentId =
        data?.deploymentId ??
        deploymentData?.id ??
        body?.id ??
        data?.id ??
        null

      // extract containerId — used to wire log stream
      const extractedContainerId =
        data?.containerId ??
        data?.container?.id ??
        deploymentData?.containerId ??
        deploymentData?.container_id ??
        body?.containerId ??
        null

      if (!extractedDeploymentId) {
        console.warn('[useDeploy] deploymentId missing from response:', data)
      }

      setDeploymentId(extractedDeploymentId)
      setContainerId(extractedContainerId)
      setStatus(data?.status ?? deploymentData?.status ?? 'pending')
      setDeployment(deploymentData)
      setProject(projectData)

      return data
    } catch (err) {
      const statusCode = err?.response?.status

      if (statusCode === 400) {
        setError(err?.response?.data?.error ?? 'Invalid deployment request. Check your inputs.')
      } else if (statusCode === 503) {
        setError('Docker daemon is unreachable. Make sure Docker is running.')
      } else if (statusCode === 502) {
        setError('AI service failed to generate config. Please try again.')
      } else {
        setError(err?.response?.data?.error ?? err?.message ?? 'Deployment failed. Please try again.')
      }

      setStatus('failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  const checkStatus = async (id) => {
    try {
      setLoading(true)
      setError(null)
      const data = await getDeploymentStatus(id)
      setDeployment(data.data || null)
      return data
    } catch (err) {
      setError(err?.response?.data?.error ?? err.message ?? 'Failed to fetch status')
    } finally {
      setLoading(false)
    }
  }

  const clearError = () => setError(null)

  const reset = () => {
    setDeploymentId(null)
    setContainerId(null)
    setStatus(null)
    setError(null)
    setLoading(false)
  }

  return {
    deploy,
    loading,
    error,
    deploymentId,
    containerId,
    status,
    clearError,
    reset,
    // Backwards-compatible aliases for existing consumers
    isLoading: loading,
    deployment,
    project,
    checkStatus,
  }
}
