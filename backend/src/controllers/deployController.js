import { createProject } from '../db/projectsService.js'
import { createDeployment, updateDeploymentStatus, getDeploymentById } from '../db/deploymentsService.js'
import { updateDeploymentStatus as updateDeploymentStatusService, DEPLOYMENT_STATUS } from '../services/deploymentStatusService.js'

/**
 * @async
 * @function triggerDeploy
 * @description Orchestrates the full LaunchFlow deployment pipeline in sequence:
 * 1. Validates the incoming request payload
 * 2. Creates a deployment record in Supabase
 * 3. Builds a Docker image locally from the generated Dockerfile
 * 4. Pushes the built image to AWS ECR
 * 5. Pulls and runs the container on the AWS EC2 instance
 * 6. Configures Nginx reverse proxy on EC2
 * 7. Updates the deployment record status to "live" or "failed"
 * 8. Streams real-time status updates via SSE throughout the process
 *
 * @route POST /api/deploy/trigger
 *
 * @param {import('express').Request} req - Express request object
 * @param {object} req.body - Request body
 * @param {string} req.body.repoUrl - GitHub repository URL to deploy
 * @param {string} req.body.dockerfile - Generated Dockerfile content
 * @param {string} req.body.workflow - Generated GitHub Actions workflow YAML content
 * @param {string} req.body.stack - Detected or specified stack (e.g. "nodejs", "python")
 * @param {string} [req.body.projectId] - Optional project ID to associate this deployment with
 *
 * @param {import('express').Response} res - Express response object
 *
 * @returns {Promise<void>} JSON response containing deploymentId and final deployment status
 *
 * @example
 * // POST /api/deploy/trigger
 * // Body: {
 * //   repoUrl: "https://github.com/owner/repo",
 * //   dockerfile: "FROM node:20-alpine\n...",
 * //   workflow: "name: CI/CD\n...",
 * //   stack: "nodejs",
 * //   projectId: "uuid-here"
 * // }
 * // Response: { deploymentId: "uuid", status: "live" }
 */
export const triggerDeploy = async (req, res) => {
  let deploymentId = null
  try {
    const { repoUrl, appName, environment, deploymentId: requestedDeploymentId } = req.body ?? {}

    if (requestedDeploymentId !== undefined && requestedDeploymentId !== null) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (typeof requestedDeploymentId !== 'string' || !uuidRegex.test(requestedDeploymentId)) {
        return res.status(400).json({ error: 'deploymentId must be a valid UUID if provided' })
      }
    }

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

    deploymentId = deployment.id

    if (deploymentId) {
      try {
        await updateDeploymentStatusService(deploymentId, DEPLOYMENT_STATUS.QUEUED, {});
      } catch (_) { /* status update failure must not break deploy */ }
    }

    res.status(201).json({
      success: true,
      data: { project, deployment },
      message: 'Deployment triggered successfully'
    })
  } catch (error) {
    if (deploymentId) {
      try {
        await updateDeploymentStatusService(deploymentId, DEPLOYMENT_STATUS.FAILED, {
          error: error?.message || 'Deployment failed.',
        });
      } catch (_) { /* status update failure must not break error handling */ }
    }
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
