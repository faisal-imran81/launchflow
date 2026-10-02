import { createProject, getProjectById } from '../db/projectsService.js'
import { createDeployment, updateDeploymentStatus, getDeploymentById } from '../db/deploymentsService.js'

export const triggerDeploy = async (req, res) => {
  try {
    const { repoUrl, appName, environment } = req.body

    if (!repoUrl || !appName || !environment) {
      return res.status(400).json({
        success: false,
        error: 'repoUrl, appName and environment are required'
      })
    }

    const project = await createProject({
      name: appName,
      repoUrl,
      environment
    })

    const deployment = await createDeployment({
      projectId: project.id,
      status: 'queued'
    })

    res.status(201).json({
      success: true,
      data: { project, deployment },
      message: 'Deployment triggered successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getDeployStatus = async (req, res) => {
  try {
    const { id } = req.params

    const deployment = await getDeploymentById(id)

    res.status(200).json({
      success: true,
      data: deployment,
      message: 'Deployment status fetched successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const updateDeployStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status, logs } = req.body

    const deployment = await updateDeploymentStatus(id, status, logs)

    res.status(200).json({
      success: true,
      data: deployment,
      message: 'Deployment status updated successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
