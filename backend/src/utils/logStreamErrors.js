// backend/src/utils/logStreamErrors.js

/**
 * SSE and log stream specific error codes and their mapped HTTP responses.
 * Keeps all stream-related error logic centralized and consistent.
 */

// Error code constants for log streaming failures
export const LOG_STREAM_ERRORS = {
  CONTAINER_NOT_FOUND: 'CONTAINER_NOT_FOUND',
  STREAM_CONNECTION_DROPPED: 'STREAM_CONNECTION_DROPPED',
  BUILD_STREAM_FAILED: 'BUILD_STREAM_FAILED',
  DOCKER_DAEMON_UNREACHABLE: 'DOCKER_DAEMON_UNREACHABLE',
  INVALID_CONTAINER_ID: 'INVALID_CONTAINER_ID',
  POLLING_FAILED: 'POLLING_FAILED',
  SSE_WRITE_FAILED: 'SSE_WRITE_FAILED',
};

/**
 * Maps a raw Dockerode or stream error to a structured LaunchFlow error object.
 * Returns a consistent shape: { code, message, statusCode }
 * so controllers can respond or close SSE streams uniformly.
 *
 * @param {Error} err - The raw error thrown by Dockerode or Node streams
 * @returns {{ code: string, message: string, statusCode: number }}
 */
export function mapLogStreamError(err) {
  const message = err?.message || 'Unknown log stream error.';

  // Container does not exist or has already been removed
  if (message.includes('No such container')) {
    return {
      code: LOG_STREAM_ERRORS.CONTAINER_NOT_FOUND,
      message: 'Container not found. It may have been removed.',
      statusCode: 404,
    };
  }

  // Docker daemon is not running or socket is unreachable
  if (
    message.includes('connect ENOENT') ||
    message.includes('connect ECONNREFUSED')
  ) {
    return {
      code: LOG_STREAM_ERRORS.DOCKER_DAEMON_UNREACHABLE,
      message: 'Docker daemon is unreachable. Ensure Docker is running.',
      statusCode: 503,
    };
  }

  // Client dropped the SSE connection mid-stream
  if (
    message.includes('write after end') ||
    message.includes('ERR_HTTP_HEADERS_SENT')
  ) {
    return {
      code: LOG_STREAM_ERRORS.STREAM_CONNECTION_DROPPED,
      message: 'SSE connection was dropped by the client.',
      statusCode: 499,
    };
  }

  // Docker build stream failed at the daemon level
  if (message.includes('build failed') || message.includes('buildImage')) {
    return {
      code: LOG_STREAM_ERRORS.BUILD_STREAM_FAILED,
      message: 'Docker image build stream encountered an error.',
      statusCode: 500,
    };
  }

  // Polling cycle failed — container may have exited
  if (message.includes('polling') || message.includes('tail')) {
    return {
      code: LOG_STREAM_ERRORS.POLLING_FAILED,
      message: 'Log polling failed. Container may have stopped.',
      statusCode: 500,
    };
  }

  // Generic fallback for unmapped stream errors
  return {
    code: LOG_STREAM_ERRORS.SSE_WRITE_FAILED,
    message,
    statusCode: 500,
  };
}
