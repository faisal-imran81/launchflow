export const validateJson = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      error: 'Invalid JSON in request body',
      code: 'bad-request/invalid-json',
    })
  }
  next(err)
}
