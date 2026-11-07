import { buildImage, listImages, removeImage, runContainer, stopContainer, removeContainer, getContainerLogs } from '../services/dockerService.js'

function isDockerUnreachable(err) {
  return (
    err?.code === 'ECONNREFUSED' ||
    err?.code === 'ENOENT' ||
    err?.code === 'docker/daemon-unavailable' ||
    err?.message?.includes('connect ECONNREFUSED') ||
    err?.message?.includes('socket hang up') ||
    err?.message?.includes('Could not reach the Docker daemon')
  )
}

/**
 * POST /api/docker/build
 * Body: { dockerfileContent: string, tag: string }
 */
export async function handleBuildImage(req, res, next) {
  const { dockerfileContent, tag } = req.body ?? {}

  if (!dockerfileContent || typeof dockerfileContent !== 'string' || dockerfileContent.trim() === '') {
    return res.status(400).json({ error: 'dockerfileContent is required and must be a non-empty string' })
  }

  if (!tag || typeof tag !== 'string' || tag.trim() === '') {
    return res.status(400).json({ error: 'tag is required and must be a non-empty string' })
  }

  try {
    const imageTag = await buildImage({ dockerfileContent, tag })
    return res.status(200).json({ ok: true, tag: imageTag })
  } catch (err) {
    if (isDockerUnreachable(err)) {
      return res.status(503).json({
        error: 'Docker daemon is unreachable. Make sure Docker is running.',
      })
    }
    return next(err)
  }
}

/**
 * GET /api/docker/images
 */
export async function handleListImages(req, res, next) {
  try {
    const images = await listImages()
    return res.status(200).json({ ok: true, images })
  } catch (err) {
    if (isDockerUnreachable(err)) {
      return res.status(503).json({
        error: 'Docker daemon is unreachable. Make sure Docker is running.',
      })
    }
    return next(err)
  }
}

/**
 * DELETE /api/docker/images/:tag
 */
export async function handleRemoveImage(req, res, next) {
  const { tag } = req.params

  if (!tag || typeof tag !== 'string') {
    return res.status(400).json({ error: 'tag param is required' })
  }

  try {
    await removeImage(tag)
    return res.status(200).json({ ok: true, removed: tag })
  } catch (err) {
    if (isDockerUnreachable(err)) {
      return res.status(503).json({
        error: 'Docker daemon is unreachable. Make sure Docker is running.',
      })
    }
    return next(err)
  }
}

/**
 * POST /api/docker/containers/run
 * Body: { imageTag: string, hostPort: number, containerPort: number, name?: string }
 */
export async function handleRunContainer(req, res, next) {
  const { imageTag, hostPort, containerPort, name } = req.body ?? {}

  if (!imageTag || typeof imageTag !== 'string' || imageTag.trim() === '') {
    return res.status(400).json({ error: 'imageTag is required and must be a non-empty string' })
  }

  if (!hostPort || !containerPort) {
    return res.status(400).json({ error: 'hostPort and containerPort are required' })
  }

  try {
    const result = await runContainer({ imageTag, hostPort, containerPort, name })
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    if (isDockerUnreachable(err)) {
      return res.status(503).json({
        error: 'Docker daemon is unreachable. Make sure Docker is running.',
      })
    }
    return next(err)
  }
}

/**
 * POST /api/docker/containers/:id/stop
 */
export async function handleStopContainer(req, res, next) {
  const { id } = req.params

  if (!id || typeof id !== 'string' || id.trim() === '') {
    return res.status(400).json({ error: 'Container id is required and must be a non-empty string' })
  }

  try {
    await stopContainer(id.trim())
    return res.status(200).json({ ok: true, stopped: id.trim() })
  } catch (err) {
    if (isDockerUnreachable(err)) {
      return res.status(503).json({
        error: 'Docker daemon is unreachable. Make sure Docker is running.',
      })
    }
    return next(err)
  }
}

/**
 * DELETE /api/docker/containers/:id
 */
export async function handleRemoveContainer(req, res, next) {
  const { id } = req.params

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Container id param is required' })
  }

  try {
    await removeContainer(id)
    return res.status(200).json({ ok: true, removed: id })
  } catch (err) {
    if (isDockerUnreachable(err)) {
      return res.status(503).json({
        error: 'Docker daemon is unreachable. Make sure Docker is running.',
      })
    }
    return next(err)
  }
}

/**
 * GET /api/docker/containers/:id/logs
 * Query: tail (optional, default 100)
 */
export async function handleGetContainerLogs(req, res, next) {
  const { id } = req.params
  const tail = req.query.tail ? parseInt(req.query.tail, 10) : 100

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Container id param is required' })
  }

  if (isNaN(tail) || tail < 1) {
    return res.status(400).json({ error: 'tail must be a positive integer' })
  }

  try {
    const logs = await getContainerLogs(id, { tail })
    return res.status(200).json({ ok: true, logs })
  } catch (err) {
    if (isDockerUnreachable(err)) {
      return res.status(503).json({
        error: 'Docker daemon is unreachable. Make sure Docker is running.',
      })
    }
    return next(err)
  }
}
