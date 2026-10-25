import {
  createRepository,
  describeRepositories,
  deleteRepository,
} from '../services/ecrService.js'

/**
 * POST /api/ecr/repositories
 * Body: { repositoryName: string }
 */
export async function handleCreateRepo(req, res, next) {
  const { repositoryName } = req.body ?? {}

  if (!repositoryName || typeof repositoryName !== 'string') {
    return res.status(400).json({ error: 'repositoryName is required and must be a string' })
  }

  try {
    const result = await createRepository({ repositoryName })
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
}

/**
 * GET /api/ecr/repositories
 */
export async function handleListRepos(req, res, next) {
  try {
    const repositories = await describeRepositories()
    return res.status(200).json({ ok: true, repositories })
  } catch (err) {
    return next(err)
  }
}

/**
 * DELETE /api/ecr/repositories/:name
 */
export async function handleDeleteRepo(req, res, next) {
  const { name } = req.params

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Repository name param is required' })
  }

  try {
    const result = await deleteRepository(name)
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
}
