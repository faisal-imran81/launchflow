/**
 * Builds a standardised EC2 error object.
 *
 * @param {string} message - Human-readable error message
 * @param {number} status  - HTTP status code to return to the client
 * @param {string} code    - Machine-readable error code e.g. "ec2/not-found"
 * @returns {Error}
 */
function buildError(message, status, code) {
  const err = new Error(message)
  err.status = status
  err.code = code
  err.isEc2Error = true
  return err
}

/**
 * Maps a raw AWS SDK error to a clean client-safe error.
 *
 * @param {unknown} error - Raw error from AWS SDK
 * @returns {Error} Standardised EC2 error
 */
export function toEc2Error(error) {
  if (error?.isEc2Error) return error

  const code = error?.Code ?? error?.code ?? error?.name

  if (code === 'InvalidInstanceID.NotFound' || code === 'InvalidAMIID.NotFound') {
    return buildError(
      'EC2 resource not found. Check the instance or AMI ID.',
      404,
      'ec2/not-found'
    )
  }

  if (code === 'InvalidInstanceID.Malformed') {
    return buildError(
      'The instance ID format is invalid.',
      400,
      'ec2/invalid-input'
    )
  }

  if (code === 'UnauthorizedOperation' || code === 'AuthFailure') {
    console.error('[ec2] AWS authentication failed. Check AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.')
    return buildError(
      'AWS authentication failed. Please contact the administrator.',
      500,
      'ec2/auth-failed'
    )
  }

  if (code === 'RequestExpired') {
    return buildError(
      'AWS request expired. Check server clock sync.',
      400,
      'ec2/request-expired'
    )
  }

  if (code === 'InstanceLimitExceeded') {
    return buildError(
      'EC2 instance limit exceeded for this account.',
      429,
      'ec2/limit-exceeded'
    )
  }

  if (code === 'InsufficientInstanceCapacity') {
    return buildError(
      'AWS does not have enough capacity for this instance type. Try a different region or type.',
      503,
      'ec2/insufficient-capacity'
    )
  }

  if (code === 'NetworkingError' || !error?.Code) {
    return buildError(
      'Could not reach the AWS EC2 service. Check your network connection.',
      503,
      'ec2/service-unavailable'
    )
  }

  return buildError(
    'EC2 operation failed. Please try again.',
    502,
    'ec2/bad-gateway'
  )
}
