import docker from '../config/docker.js'
import { toDockerError } from '../utils/dockerErrors.js'
import tar from 'tar-stream'

/**
 * Builds a Docker image from a Dockerfile string.
 * Returns a promise that resolves with the final image tag when the build stream ends.
 *
 * @param {object} options
 * @param {string} options.dockerfileContent - Raw Dockerfile text
 * @param {string} options.tag - Image tag e.g. "myapp:latest"
 * @returns {Promise<string>} Resolves with the image tag on success
 */
export async function buildImage({ dockerfileContent, tag }) {
  if (!dockerfileContent || typeof dockerfileContent !== 'string') {
    const err = new Error('dockerfileContent is required and must be a string')
    err.status = 400
    err.code = 'docker/invalid-input'
    throw err
  }

  if (!tag || typeof tag !== 'string') {
    const err = new Error('tag is required and must be a string')
    err.status = 400
    err.code = 'docker/invalid-input'
    throw err
  }

  const pack = tar.pack()
  pack.entry({ name: 'Dockerfile' }, dockerfileContent)
  pack.finalize()

  let stream
  try {
    stream = await docker.buildImage(pack, { t: tag })
  } catch (error) {
    throw toDockerError(error)
  }

  return new Promise((resolve, reject) => {
    docker.modem.followProgress(stream, (err, output) => {
      if (err) return reject(toDockerError(err))

      const lastMessage = output?.[output.length - 1]
      if (lastMessage?.error) {
        const buildErr = new Error(lastMessage.error.trim())
        buildErr.status = 422
        buildErr.code = 'docker/build-failed'
        buildErr.isDockerError = true
        return reject(buildErr)
      }

      resolve(tag)
    })
  })
}
