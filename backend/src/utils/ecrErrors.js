/**
 * @module ecrErrors
 *
 * Maps raw AWS ECR SDK errors to clean, client-safe error objects.
 * Every error thrown by ecrService passes through toEcrError()
 * so the client always receives a consistent shape:
 *   { message, status, code, isEcrError: true }
 *
 * Error codes:
 *  - ecr/not-found           — repository or image does not exist
 *  - ecr/already-exists      — repository name already taken
 *  - ecr/invalid-input       — malformed request field
 *  - ecr/auth-failed         — invalid AWS credentials
 *  - ecr/no-auth-token       — ECR did not return an auth token
 *  - ecr/tag-failed          — local image tag failed
 *  - ecr/push-failed         — image push to ECR failed
 *  - ecr/limit-exceeded      — repository limit hit
 *  - ecr/service-unavailable — could not reach AWS ECR service
 *  - ecr/bad-gateway         — unexpected AWS error
 *
 * @requires @aws-sdk/client-ecr
 */

/**
 * Builds a standardised ECR error object.
 *
 * @param {string} message - Human-readable error message
 * @param {number} status  - HTTP status code to return to the client
 * @param {string} code    - Machine-readable error code e.g. "ecr/not-found"
 * @returns {Error}
 */
function buildError(message, status, code) {
  const err = new Error(message)
  err.status = status
  err.code = code
  err.isEcrError = true
  return err
}

/**
 * Maps a raw AWS SDK error to a clean client-safe error.
 *
 * @param {unknown} error - Raw error from AWS ECR SDK
 * @returns {Error} Standardised ECR error
 */
export function toEcrError(error) {
  if (error?.isEcrError) return error

  const code = error?.Code ?? error?.code ?? error?.name

  if (code === 'RepositoryNotFoundException' || code === 'ImageNotFoundException') {
    return buildError(
      'ECR repository or image not found. Check the repository name.',
      404,
      'ecr/not-found'
    )
  }

  if (code === 'RepositoryAlreadyExistsException') {
    return buildError(
      'An ECR repository with this name already exists.',
      409,
      'ecr/already-exists'
    )
  }

  if (code === 'InvalidParameterException' || code === 'ValidationException') {
    return buildError(
      'Invalid parameter supplied to ECR. Check your request fields.',
      400,
      'ecr/invalid-input'
    )
  }

  if (code === 'AuthorizationException' || code === 'UnauthorizedOperation') {
    console.error('[ecr] AWS authentication failed. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.')
    return buildError(
      'AWS ECR authentication failed. Please contact the administrator.',
      500,
      'ecr/auth-failed'
    )
  }

  if (code === 'LimitExceededException') {
    return buildError(
      'ECR repository limit exceeded for this account.',
      429,
      'ecr/limit-exceeded'
    )
  }

  if (code === 'NetworkingError' || !error?.Code) {
    return buildError(
      'Could not reach the AWS ECR service. Check your network connection.',
      503,
      'ecr/service-unavailable'
    )
  }

  return buildError(
    'ECR operation failed. Please try again.',
    502,
    'ecr/bad-gateway'
  )
}
