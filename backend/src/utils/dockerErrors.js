/**
 * Builds a standardised Docker error object.
 *
 * @param {string} message - Human-readable error message
 * @param {number} status  - HTTP status code to return to the client
 * @param {string} code    - Machine-readable error code e.g. "docker/not-found"
 * @returns {Error}
 */
function buildError(message, status, code) {
  const err = new Error(message)
  err.status = status
  err.code = code
  err.isDockerError = true
  return err
}

/**
 * Maps a raw Dockerode / Docker daemon error to a clean client-safe error.
 *
 * @param {unknown} error - Raw error from Dockerode
 * @returns {Error} Standardised Docker error
 */
export function toDockerError(error) {
  if (error?.isDockerError) return error

  const statusCode = error?.statusCode ?? error?.status

  if (statusCode === 404) {
    return buildError(
      'Docker resource not found. Check the image or container ID.',
      404,
      'docker/not-found'
    )
  }

  if (statusCode === 409) {
    return buildError(
      'Docker resource conflict. The container or image name is already in use.',
      409,
      'docker/conflict'
    )
  }

  if (statusCode === 422) {
    return buildError(
      'Docker could not process the request. Check your Dockerfile.',
      422,
      'docker/unprocessable'
    )
  }

  if (statusCode === 500) {
    return buildError(
      'Docker daemon returned an internal error. Please try again.',
      502,
      'docker/daemon-error'
    )
  }

  if (!statusCode) {
    return buildError(
      'Could not reach the Docker daemon. Make sure Docker is running.',
      503,
      'docker/daemon-unavailable'
    )
  }

  return buildError(
    'Docker operation failed. Please try again.',
    502,
    'docker/bad-gateway'
  )
}
