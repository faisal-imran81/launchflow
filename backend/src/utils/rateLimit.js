/** @type {Map<string, { count: number, start: number }>} */
const requests = new Map()

/**
 * Returns true if the given key has exceeded the allowed request count
 * within the sliding time window.
 *
 * @param {string} key       - Unique identifier for the caller (e.g. IP address)
 * @param {number} [limit=10]       - Max requests allowed in the window
 * @param {number} [windowMs=60000] - Window size in milliseconds
 * @returns {boolean} true if rate-limited, false if the request is allowed
 */
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

/**
 * Clears the rate-limit counter for a given key.
 * Primarily used in tests to reset state between cases.
 *
 * @param {string} key - The key to clear
 */
export function resetRateLimit(key) {
  requests.delete(key)
}
