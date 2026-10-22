/**
 * Wraps an async Express route handler so that any rejected promise
 * or thrown error is forwarded to next() automatically.
 *
 * @param {Function} fn - Async (req, res, next) handler
 * @returns {Function} Express middleware that catches async errors
 */
export const asyncHandler = (fn) => (req, res, next) => {
  try {
    Promise.resolve(fn(req, res, next)).catch(next)
  } catch (err) {
    next(err)
  }
}
