/**
 * @module nginxErrors
 *
 * Maps raw Nginx-related errors to clean, client-safe error objects.
 * Every error thrown by nginxService passes through toNginxError()
 * so the client always receives a consistent shape:
 *   { message, status, code, isNginxError: true }
 *
 * Error codes:
 *  - nginx/invalid-input    — missing or malformed request field
 *  - nginx/invalid-config   — generated config failed validation
 *  - nginx/bad-gateway      — unexpected internal error
 *
 * @module nginxErrors
 */

/**
 * Builds a standardised Nginx error object.
 *
 * @param {string} message - Human-readable error message
 * @param {number} status  - HTTP status code to return to the client
 * @param {string} code    - Machine-readable error code e.g. "nginx/invalid-input"
 * @returns {Error}
 */
function buildError(message, status, code) {
  const err = new Error(message)
  err.status = status
  err.code = code
  err.isNginxError = true
  return err
}

/**
 * Maps a raw error to a clean client-safe Nginx error.
 *
 * @param {unknown} error - Raw error
 * @returns {Error} Standardised Nginx error
 */
export function toNginxError(error) {
  if (error?.isNginxError) return error

  const code = error?.code

  if (code === 'nginx/invalid-input') {
    return buildError(
      error.message ?? 'Invalid input supplied to Nginx config generator.',
      400,
      'nginx/invalid-input'
    )
  }

  if (code === 'nginx/invalid-config') {
    return buildError(
      error.message ?? 'Generated Nginx config failed validation.',
      422,
      'nginx/invalid-config'
    )
  }

  return buildError(
    'Nginx config generation failed. Please try again.',
    502,
    'nginx/bad-gateway'
  )
}
