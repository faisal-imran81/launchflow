export function sanitizeInput(value) {
  if (typeof value !== 'string') return value
  return value.trim().slice(0, 500)
}

export function sanitizeBody(body) {
  if (!body || typeof body !== 'object') return {}
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, sanitizeInput(v)])
  )
}
