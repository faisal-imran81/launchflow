export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500
  const message = err.message || 'Internal Server Error'

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${new Date().toISOString()}] ${status} — ${message}`)
    if (err.stack) console.error(err.stack)
  }

  const body = { success: false, error: message }
  if (err.code) body.code = err.code

  res.status(status).json(body)
}
