import { buildImage, listImages, removeImage } from '../services/dockerService.js'

/**
 * POST /api/docker/build
 * Body: { dockerfileContent: string, tag: string }
 */
export async function handleBuildImage(req, res, next) {
  const { dockerfileContent, tag } = req.body ?? {}

  if (!dockerfileContent || typeof dockerfileContent !== 'string') {
    return res.status(400).json({ error: 'dockerfileContent is required and must be a string' })
  }

  if (!tag || typeof tag !== 'string') {
    return res.status(400).json({ error: 'tag is required and must be a string' })
  }

  try {
    const imageTag = await buildImage({ dockerfileContent, tag })
    return res.status(200).json({ ok: true, tag: imageTag })
  } catch (err) {
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
    return next(err)
  }
}
