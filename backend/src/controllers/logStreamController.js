// backend/src/controllers/logStreamController.js

/**
 * @module logStreamController
 * @description Express controllers for SSE-based Docker log streaming endpoints.
 * Handles input validation, error mapping, and delegates to logStreamService.
 */

import { streamDockerLogs, pollDockerLogs } from '../services/logStreamService.js';
import { mapLogStreamError } from '../utils/logStreamErrors.js';
import { closeSseStream, setSseHeaders } from '../utils/sseHelper.js';

/**
 * GET /api/logs/:containerId/stream
 *
 * Streams live logs from a running Docker container to the client via SSE.
 * Falls back to polling if the query param ?poll=true is passed.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function handleStreamContainerLogs(req, res) {
  const { containerId } = req.params;

  // Validate containerId — must be a non-empty alphanumeric string
  if (!containerId || !/^[a-zA-Z0-9_.-]+$/.test(containerId)) {
    return res.status(400).json({
      error: 'Invalid or missing containerId parameter.',
    });
  }

  // Allow clients to request polling fallback explicitly via ?poll=true
  const usePolling = req.query.poll === 'true';

  // Optional polling config from query params with safe defaults
  const tailLines = parseInt(req.query.tail, 10) || 50;
  const intervalMs = parseInt(req.query.interval, 10) || 2000;

  try {
    if (usePolling) {
      await pollDockerLogs(containerId, req, res, tailLines, intervalMs);
    } else {
      await streamDockerLogs(containerId, req, res);
    }
  } catch (err) {
    const mapped = mapLogStreamError(err);

    // If SSE headers already sent, close the stream with error event
    if (res.headersSent) {
      closeSseStream(res, 'error', mapped.message);
    } else {
      res.status(mapped.statusCode).json({
        error: mapped.message,
        code: mapped.code,
      });
    }
  }
}
