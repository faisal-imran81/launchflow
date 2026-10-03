import { useState, useEffect } from 'react'
import {
  fetchAllProjects,
  fetchProjectById,
  createNewProject,
  removeProject,
} from '../services/projectsService.js'

export const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchAllProjects()
      setProjects(data || [])
    } catch (err) {
      setError(err.message || 'Failed to fetch projects')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchProject = async (id) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await fetchProjectById(id)
      return data
    } catch (err) {
      setError(err.message || 'Failed to fetch project')
    } finally {
      setIsLoading(false)
    }
  }

  const addProject = async ({ name, repoUrl, environment }) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await createNewProject({ name, repoUrl, environment })
      setProjects((prev) => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message || 'Failed to create project')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteProject = async (id) => {
    try {
      setIsLoading(true)
      setError(null)
      await removeProject(id)
      setProjects((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      setError(err.message || 'Failed to delete project')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  return { projects, fetchProjects, fetchProject, addProject, deleteProject, isLoading, error }
}
