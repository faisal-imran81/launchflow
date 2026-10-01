import api from './api.js'

export const getAllDeployments = async () => {
  const response = await api.get('/history')
  return response.data
}

export const getDeploymentById = async (id) => {
  const response = await api.get(`/history/${id}`)
  return response.data
}
