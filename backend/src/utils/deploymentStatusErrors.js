// backend/src/utils/deploymentStatusErrors.js

/**
 * @module deploymentStatusErrors
 * @description Centralized error code constants and error mapping for
 * deployment status operations. Controllers use mapDeploymentStatusError
 * to convert raw Supabase or service errors into structured responses.
 */

/**
 * Enum-like constants representing all possible deployment status failure scenarios.
 * @readonly
 * @enum {string}
 */
export const DEPLOYMENT_STATUS_ERRORS = {
  DEPLOYMENT_NOT_FOUND:    'DEPLOYMENT_NOT_FOUND',
  INVALID_STATUS_VALUE:    'INVALID_STATUS_VALUE',
  INVALID_DEPLOYMENT_ID:   'INVALID_DEPLOYMENT_ID',
  SUPABASE_WRITE_FAILED:   'SUPABASE_WRITE_FAILED',
  SUPABASE_READ_FAILED:    'SUPABASE_READ_FAILED',
  STREAM_POLLING_FAILED:   'STREAM_POLLING_FAILED',
  SSE_CONNECTION_DROPPED:  'SSE_CONNECTION_DROPPED',
};

/**
 * Maps a raw service or Supabase error to a structured LaunchFlow error object.
 * Returns a consistent shape: { code, message, statusCode }
 * so controllers can respond or close SSE streams uniformly.
 *
 * @param {Error} err - The raw error thrown by deploymentStatusService or Supabase
 * @returns {{ code: string, message: string, statusCode: number }}
 * @throws {never} This function always returns a structured object and never throws
 */
export function mapDeploymentStatusError(err) {
  const message = err?.message || 'Unknown deployment status error.';

  // Deployment record does not exist in Supabase
  if (message.includes('not found') || message.includes('No rows')) {
    return {
      code: DEPLOYMENT_STATUS_ERRORS.DEPLOYMENT_NOT_FOUND,
      message: 'Deployment not found. It may have been deleted.',
      statusCode: 404,
    };
  }

  // Invalid status value passed to updateDeploymentStatus
  if (message.includes('Invalid status value')) {
    return {
      code: DEPLOYMENT_STATUS_ERRORS.INVALID_STATUS_VALUE,
      message,
      statusCode: 400,
    };
  }

  // deploymentId missing or malformed
  if (message.includes('deploymentId is required')) {
    return {
      code: DEPLOYMENT_STATUS_ERRORS.INVALID_DEPLOYMENT_ID,
      message: 'A valid deploymentId is required.',
      statusCode: 400,
    };
  }

  // Supabase write failure (update)
  if (message.includes('Failed to update')) {
    return {
      code: DEPLOYMENT_STATUS_ERRORS.SUPABASE_WRITE_FAILED,
      message: 'Failed to persist deployment status update.',
      statusCode: 500,
    };
  }

  // Supabase read failure (select)
  if (message.includes('Failed to fetch')) {
    return {
      code: DEPLOYMENT_STATUS_ERRORS.SUPABASE_READ_FAILED,
      message: 'Failed to read deployment status from database.',
      statusCode: 500,
    };
  }

  // SSE polling loop encountered an error
  if (message.includes('polling') || message.includes('Status polling')) {
    return {
      code: DEPLOYMENT_STATUS_ERRORS.STREAM_POLLING_FAILED,
      message: 'Deployment status stream polling failed.',
      statusCode: 500,
    };
  }

  // Client dropped SSE connection mid-stream
  if (
    message.includes('write after end') ||
    message.includes('ERR_HTTP_HEADERS_SENT')
  ) {
    return {
      code: DEPLOYMENT_STATUS_ERRORS.SSE_CONNECTION_DROPPED,
      message: 'SSE connection was dropped by the client.',
      statusCode: 499,
    };
  }

  // Generic fallback for unmapped errors
  return {
    code: DEPLOYMENT_STATUS_ERRORS.SUPABASE_READ_FAILED,
    message,
    statusCode: 500,
  };
}
