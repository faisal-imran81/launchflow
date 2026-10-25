import {
  createRepository,
  describeRepositories,
  deleteRepository,
  pushImageToEcr,
  listImages,
  deleteImage,
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

/**
 * POST /api/ecr/push
 * Body: { localTag: string, repositoryUri: string, imageTag?: string }
 */
export async function handlePushImage(req, res, next) {
  const { localTag, repositoryUri, imageTag } = req.body ?? {}

  if (!localTag || typeof localTag !== 'string') {
    return res.status(400).json({ error: 'localTag is required and must be a string' })
  }

  if (!repositoryUri || typeof repositoryUri !== 'string') {
    return res.status(400).json({ error: 'repositoryUri is required and must be a string' })
  }

  try {
    const result = await pushImageToEcr({ localTag, repositoryUri, imageTag })
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
}

/**
 * GET /api/ecr/repositories/:name/images
 */
export async function handleListImages(req, res, next) {
  const { name } = req.params

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Repository name param is required' })
  }

  try {
    const images = await listImages(name)
    return res.status(200).json({ ok: true, images })
  } catch (err) {
    return next(err)
  }
}

/**
 * DELETE /api/ecr/repositories/:name/images
 * Body: { imageTag?: string, imageDigest?: string }
 */
export async function handleDeleteImage(req, res, next) {
  const { name } = req.params
  const { imageTag, imageDigest } = req.body ?? {}

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Repository name param is required' })
  }

  if (!imageTag && !imageDigest) {
    return res.status(400).json({ error: 'Either imageTag or imageDigest is required' })
  }

  try {
    const result = await deleteImage({ repositoryName: name, imageTag, imageDigest })
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
}
