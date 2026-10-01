import api from './api.js'

export const triggerDeployment = async (repoUrl, appName, environment) => {
  const response = await api.post('/deploy/trigger', {
    repoUrl,
    appName,
    environment,
  })
  return response.data
}

export const getDeploymentStatus = async (id) => {
  const response = await api.get(`/deploy/status/${id}`)
  return response.data
}
