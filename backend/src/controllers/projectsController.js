import {
  createProject,
  getAllProjects,
  getProjectById,
  deleteProject
} from '../db/projectsService.js'

export const addProject = async (req, res) => {
  try {
    const { name, repoUrl, environment } = req.body

    if (!name || !repoUrl || !environment) {
      return res.status(400).json({
        success: false,
        error: 'name, repoUrl and environment are required'
      })
    }

    const project = await createProject({ name, repoUrl, environment })

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const listProjects = async (req, res) => {
  try {
    const projects = await getAllProjects()

    res.status(200).json({
      success: true,
      data: projects,
      message: 'Projects fetched successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getProject = async (req, res) => {
  try {
    const { id } = req.params

    const project = await getProjectById(id)

    res.status(200).json({
      success: true,
      data: project,
      message: 'Project fetched successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const removeProject = async (req, res) => {
  try {
    const { id } = req.params

    await deleteProject(id)

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
