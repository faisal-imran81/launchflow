/**
 * Trims and truncates a single string value to 500 characters.
 * Non-string values are returned unchanged.
 *
 * @param {unknown} value - The value to sanitize
 * @returns {unknown} Sanitized string, or the original value if not a string
 */
export function sanitizeInput(value) {
  if (typeof value !== 'string') return value
  return value.trim().slice(0, 500)
}

/**
 * Sanitizes every string value in a request body object.
 * Non-object inputs return an empty object.
 *
 * @param {Record<string, unknown>} body - Raw request body
 * @returns {Record<string, unknown>} Body with all string values trimmed and truncated
 */
export function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return {}
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, sanitizeInput(v)])
  )
}
