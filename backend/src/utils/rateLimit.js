const requests = new Map()

export function isRateLimited(key, limit = 10, windowMs = 60_000) {
  const now = Date.now()
  const entry = requests.get(key) || { count: 0, start: now }

  if (now - entry.start > windowMs) {
    requests.set(key, { count: 1, start: now })
    return false
  }

  if (entry.count >= limit) return true

  requests.set(key, { count: entry.count + 1, start: entry.start })
  return false
}

export function resetRateLimit(key) {
  requests.delete(key)
}
