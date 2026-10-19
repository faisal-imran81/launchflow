export const errorHandler = (err, req, res, next) => {
  const status = err.status || 500
  const isClientSafe = status < 500 || err.isAiError === true
  const message = isClientSafe
    ? err.message || 'Internal Server Error'
    : 'Internal Server Error'

  console.error(
    `[${new Date().toISOString()}] ${status} — ${err.message || 'Internal Server Error'}`
  )
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack)
  }

  const body = { success: false, error: message }
  if (isClientSafe && err.code) body.code = err.code

  res.status(status).json(body)
}
