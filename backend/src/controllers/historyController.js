import { getAllDeployments as fetchAllDeployments, getDeploymentById as fetchDeploymentById } from '../db/deploymentsService.js'

export const getAllDeployments = async (req, res) => {
  try {
    const deployments = await fetchAllDeployments()

    res.status(200).json({
      success: true,
      data: deployments,
      message: 'Deployments fetched successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getDeploymentById = async (req, res) => {
  try {
    const { id } = req.params

    const deployment = await fetchDeploymentById(id)

    res.status(200).json({
      success: true,
      data: deployment,
      message: 'Deployment fetched successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
