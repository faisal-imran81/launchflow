/**
 * @module sseHelper
 * @description Utility functions for managing Server-Sent Events (SSE) connections.
 * All log streaming in LaunchFlow routes through these helpers.
 */

/**
 * @module sseHelper
 *
 * Server-Sent Events (SSE) helpers for streaming deploy logs and status
 * updates to the client over a long-lived HTTP connection.
 *
 * Exported functions:
 *  - setSseHeaders       — prepares the response for SSE streaming
 *  - sendSseEvent        — writes a named event to the SSE stream
 *  - sendLogLine         — writes a log line as an SSE 'log' event
 *  - closeSseStream      — sends a final status event and ends the stream
 *  - onClientDisconnect  — registers cleanup on client disconnect
 */

/**
 * Prepares an HTTP response for Server-Sent Events streaming.
 *
 * Sets the headers required by the SSE protocol and the header that
 * disables Nginx proxy buffering so events are forwarded immediately.
 *
 * @param {object} res - Express response object
 * @returns {void}
 */
export function setSseHeaders(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  res.flushHeaders()
}

/**
 * Writes a named SSE event to the response stream.
 *
 * @param {object} res - Express response object
 * @param {string} event - Event name the client listens for
 * @param {unknown} data - Payload, serialized as JSON
 * @returns {void}
 */
export function sendSseEvent(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

/**
 * Writes a single process log line as an SSE 'log' event.
 *
 * @param {object} res - Express response object
 * @param {string} line - Raw log line from the process output
 * @param {string} [stream='stdout'] - Output stream the line came from (e.g. "stdout" or "stderr")
 * @returns {void}
 */
export function sendLogLine(res, line, stream = 'stdout') {
  sendSseEvent(res, 'log', { line, stream, ts: Date.now() })
}

/**
 * Sends a final 'status' event and closes the SSE stream.
 *
 * @param {object} res - Express response object
 * @param {string} [status='done'] - Terminal status e.g. "done" or "error"
 * @param {string} [message=''] - Optional human-readable status message
 * @returns {void}
 */
export function closeSseStream(res, status = 'done', message = '') {
  sendSseEvent(res, 'status', { status, message })
  res.end()
}

/**
 * Registers a cleanup callback that runs when the client disconnects.
 *
 * Useful for killing spawned processes or removing listeners so
 * resources are not leaked after the stream is abandoned.
 *
 * @param {object} req - Express request object
 * @param {Function} cleanup - Callback invoked on client disconnect
 * @returns {void}
 */
export function onClientDisconnect(req, cleanup) {
  req.on('close', () => {
    cleanup()
  })
}
