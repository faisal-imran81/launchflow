/**
 * @module dockerService
 *
 * High-level Docker operations built on top of Dockerode.
 * All functions connect to the local Docker daemon via the shared
 * client in src/config/docker.js and throw standardised errors
 * from src/utils/dockerErrors.js.
 *
 * Exported functions:
 *  - buildImage        — build an image from a Dockerfile string
 *  - listImages        — list all local images
 *  - removeImage       — remove an image by tag or ID
 *  - runContainer      — create and start a container with port binding
 *  - stopContainer     — gracefully stop a running container
 *  - removeContainer   — force-remove a container
 *  - getContainerLogs  — fetch stdout/stderr logs as plain text
 *
 * @requires dockerode
 * @requires tar-stream
 */
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

/**
 * Lists all Docker images on the local daemon.
 *
 * @returns {Promise<Array>} Array of image summary objects
 */
export async function listImages() {
  try {
    const images = await docker.listImages({ all: false })
    return images.map((img) => ({
      id: img.Id,
      tags: img.RepoTags ?? [],
      size: img.Size,
      created: img.Created,
    }))
  } catch (error) {
    throw toDockerError(error)
  }
}

/**
 * Removes a Docker image by tag or ID.
 * Passes force: true so the image is removed even if tagged multiple times.
 *
 * @param {string} imageTag - Image tag or ID to remove
 * @returns {Promise<void>}
 */
export async function removeImage(imageTag) {
  if (!imageTag || typeof imageTag !== 'string') {
    const err = new Error('imageTag is required and must be a string')
    err.status = 400
    err.code = 'docker/invalid-input'
    throw err
  }

  try {
    const image = docker.getImage(imageTag)
    await image.remove({ force: true })
  } catch (error) {
    throw toDockerError(error)
  }
}

/**
 * Creates and starts a container from a given image.
 * Binds the container's internal port to a host port.
 *
 * @param {object} options
 * @param {string} options.imageTag - Image to run e.g. "myapp:latest"
 * @param {number|string} options.hostPort - Host port to bind e.g. 3000
 * @param {number|string} options.containerPort - Container port to expose e.g. 3000
 * @param {string} [options.name] - Optional container name
 * @returns {Promise<{ containerId: string, name: string }>}
 */
export async function runContainer({ imageTag, hostPort, containerPort, name }) {
  if (!imageTag || typeof imageTag !== 'string') {
    const err = new Error('imageTag is required and must be a string')
    err.status = 400
    err.code = 'docker/invalid-input'
    throw err
  }

  if (!hostPort || !containerPort) {
    const err = new Error('hostPort and containerPort are required')
    err.status = 400
    err.code = 'docker/invalid-input'
    throw err
  }

  const portBinding = `${containerPort}/tcp`

  try {
    const container = await docker.createContainer({
      Image: imageTag,
      ...(name ? { name } : {}),
      ExposedPorts: { [portBinding]: {} },
      HostConfig: {
        PortBindings: {
          [portBinding]: [{ HostPort: String(hostPort) }],
        },
      },
    })

    await container.start()

    const info = await container.inspect()
    return {
      containerId: info.Id,
      name: info.Name.replace(/^\//, ''),
    }
  } catch (error) {
    throw toDockerError(error)
  }
}

/**
 * Stops a running container by ID.
 * Waits up to 10 seconds for graceful shutdown before forcing it.
 *
 * @param {string} containerId - Container ID or name
 * @returns {Promise<void>}
 */
export async function stopContainer(containerId) {
  if (!containerId || typeof containerId !== 'string') {
    const err = new Error('containerId is required and must be a string')
    err.status = 400
    err.code = 'docker/invalid-input'
    throw err
  }

  try {
    const container = docker.getContainer(containerId)
    await container.stop({ t: 10 })
  } catch (error) {
    // 304 means container is already stopped — not an error
    if (error?.statusCode === 304) return
    throw toDockerError(error)
  }
}

/**
 * Removes a container by ID.
 * Passes force: true so it removes even if still running.
 *
 * @param {string} containerId - Container ID or name
 * @returns {Promise<void>}
 */
export async function removeContainer(containerId) {
  if (!containerId || typeof containerId !== 'string') {
    const err = new Error('containerId is required and must be a string')
    err.status = 400
    err.code = 'docker/invalid-input'
    throw err
  }

  try {
    const container = docker.getContainer(containerId)
    await container.remove({ force: true })
  } catch (error) {
    // 404 means container already gone — not an error
    if (error?.statusCode === 404) return
    throw toDockerError(error)
  }
}

/**
 * Fetches stdout and stderr logs from a container.
 * Returns the last 100 lines by default.
 *
 * @param {string} containerId - Container ID or name
 * @param {object} [options]
 * @param {number} [options.tail=100] - Number of lines to fetch from the end
 * @returns {Promise<string>} Plain text log output
 */
export async function getContainerLogs(containerId, { tail = 100 } = {}) {
  if (!containerId || typeof containerId !== 'string') {
    const err = new Error('containerId is required and must be a string')
    err.status = 400
    err.code = 'docker/invalid-input'
    throw err
  }

  try {
    const container = docker.getContainer(containerId)
    const stream = await container.logs({
      stdout: true,
      stderr: true,
      tail,
      follow: false,
    })

    // Docker multiplexes stdout/stderr — demux to plain string
    return stream
      .toString('utf8')
      .split('\n')
      .map((line) => {
        // Each log line has an 8-byte header — strip it
        if (line.length > 8) return line.slice(8)
        return line
      })
      .join('\n')
      .trim()
  } catch (error) {
    throw toDockerError(error)
  }
}
