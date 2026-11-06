/**
 * @module logStreamService
 * @description Handles real-time Docker log streaming and polling for LaunchFlow.
 * Supports live SSE streaming via Dockerode follow:true and a polling-based fallback.
 */

// backend/src/services/logStreamService.js

import { getDockerClient } from '../config/docker.js';
import {
  setSseHeaders,
  sendLogLine,
  closeSseStream,
  onClientDisconnect,
} from '../utils/sseHelper.js';

/**
 * Stream live logs from a running Docker container to the client via SSE.
 * Uses Dockerode with follow:true so log lines are pushed as they arrive.
 *
 * @param {string}                      containerId - Docker container ID or name
 * @param {import('express').Request}   req
 * @param {import('express').Response}  res
 * @returns {Promise<void>}
 * @throws {Error} If the container is not found or Dockerode fails to open the stream
 */
export async function streamDockerLogs(containerId, req, res, _docker = null) {
  // Guard against empty or invalid containerId before opening SSE connection
  if (!containerId || typeof containerId !== 'string' || !containerId.trim()) {
    setSseHeaders(res);
    closeSseStream(res, 'error', 'containerId is required to stream logs.');
    return;
  }

  const docker = _docker ?? getDockerClient();
  const container = docker.getContainer(containerId);

  // Open SSE connection immediately so the browser starts receiving
  setSseHeaders(res);

  let logStream = null;

  // Cleanup: destroy the Dockerode stream when the client disconnects
  onClientDisconnect(req, () => {
    if (logStream) {
      logStream.destroy();
    }
  });

  try {
    // Request log stream with follow:true — Dockerode returns a raw multiplexed stream
    logStream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      timestamps: false,
    });

    // Demultiplex Docker's multiplexed stream into stdout / stderr chunks
    container.modem.demuxStream(logStream, {
      // stdout handler
      write(chunk) {
        const line = chunk.toString('utf8').trimEnd();
        if (line) sendLogLine(res, line, 'stdout');
      },
    }, {
      // stderr handler
      write(chunk) {
        const line = chunk.toString('utf8').trimEnd();
        if (line) sendLogLine(res, line, 'stderr');
      },
    });

    // Stream ended naturally — container exited or logs exhausted
    logStream.on('end', () => {
      closeSseStream(res, 'done', 'Container log stream ended.');
    });

    // Forward stream-level errors to the client before closing
    logStream.on('error', (err) => {
      closeSseStream(res, 'error', err.message || 'Log stream error.');
    });
  } catch (err) {
    // Container not found or Dockerode failed to open stream
    closeSseStream(res, 'error', err.message || 'Failed to start log stream.');
  }
}

/**
 * Polling-based fallback for environments where SSE is restricted.
 * Fetches the last N lines from a container on a fixed interval
 * and sends each new line to the client via SSE.
 *
 * @param {string}                      containerId - Docker container ID or name
 * @param {import('express').Request}   req
 * @param {import('express').Response}  res
 * @param {number}                      [tailLines=50]     - Lines to fetch per poll
 * @param {number}                      [intervalMs=2000]  - Poll interval in milliseconds
 * @returns {Promise<void>}
 * @throws {Error} If the container is unreachable or polling encounters a fatal error
 */
export async function pollDockerLogs(
  containerId,
  req,
  res,
  tailLines = 50,
  intervalMs = 2000,
  _docker = null,
) {
  const docker = _docker ?? getDockerClient();
  const container = docker.getContainer(containerId);

  // Open SSE connection before the first poll
  setSseHeaders(res);

  let timer = null;
  let lastSeen = '';

  // Stop polling and close stream when client disconnects
  onClientDisconnect(req, () => {
    if (timer) clearInterval(timer);
    closeSseStream(res, 'done', 'Client disconnected — polling stopped.');
  });

  /**
   * Fetch the latest tail lines, diff against the last snapshot,
   * and push only the new lines to the client.
   */
  async function poll() {
    try {
      const rawBuffer = await container.logs({
        follow: false,
        stdout: true,
        stderr: true,
        timestamps: false,
        tail: tailLines,
      });

      const rawText = rawBuffer.toString('utf8');

      // Skip if output hasn't changed since the last poll
      if (rawText === lastSeen) return;

      // Find lines that are genuinely new this cycle using index-based diff.
      const currentLines = rawText.split('\n');

      let newLines;

      if (!lastSeen) {
        // First poll — send all non-empty lines directly
        newLines = currentLines.filter((line) => line.trim());
      } else {
        // Subsequent polls — find lines after the last known line
        const prevLines = lastSeen.split('\n');
        const prevLastLine = prevLines[prevLines.length - 1] ?? '';
        const lastMatchIdx = currentLines.lastIndexOf(prevLastLine);
        const startIdx = lastMatchIdx !== -1 ? lastMatchIdx + 1 : prevLines.length;
        newLines = currentLines
          .slice(startIdx)
          .filter((line) => line.trim());
      }

      newLines.forEach((line) => sendLogLine(res, line.trimEnd(), 'stdout'));

      lastSeen = rawText;
    } catch (err) {
      // Container gone or Dockerode error — stop polling
      clearInterval(timer);
      closeSseStream(res, 'error', err.message || 'Polling error.');
    }
  }

  // Run immediately then repeat on interval
  await poll();
  timer = setInterval(poll, intervalMs);
}

/**
 * Stream Docker image build progress to the client via SSE.
 * Parses the JSON objects emitted by Dockerode's buildImage stream
 * and forwards each meaningful line (status, stream, error) individually.
 *
 * @param {string}                      tarStream   - Readable tar archive stream of the build context
 * @param {object}                      buildOpts   - Dockerode buildImage options (t, dockerfile, etc.)
 * @param {import('express').Request}   req
 * @param {import('express').Response}  res
 * @returns {Promise<void>}
 * @throws {Error} If docker.buildImage fails or the tar stream is invalid
 */
export async function streamBuildLogs(tarStream, buildOpts, req, res, _docker = null) {
  const docker = _docker ?? getDockerClient();

  // Open SSE connection before the build starts
  setSseHeaders(res);

  let buildStream = null;

  // Abort the build stream if the client disconnects mid-build
  onClientDisconnect(req, () => {
    if (buildStream) buildStream.destroy();
  });

  try {
    buildStream = await docker.buildImage(tarStream, buildOpts);

    // Dockerode build stream emits raw newline-delimited JSON objects
    buildStream.on('data', (chunk) => {
      const raw = chunk.toString('utf8');

      // A single chunk may contain multiple JSON lines — split and process each
      raw
        .split('\n')
        .filter((line) => line.trim())
        .forEach((line) => {
          try {
            const parsed = JSON.parse(line);

            if (parsed.error) {
              // Build-level error reported by Docker daemon
              sendLogLine(res, `ERROR: ${parsed.error.trim()}`, 'stderr');
            } else if (parsed.stream) {
              // Standard build output line (RUN, COPY, layer info, etc.)
              const text = parsed.stream.trimEnd();
              if (text) sendLogLine(res, text, 'stdout');
            } else if (parsed.status) {
              // Layer pull / push status messages
              const status = parsed.progress
                ? `${parsed.status} ${parsed.progress}`
                : parsed.status;
              sendLogLine(res, status.trimEnd(), 'stdout');
            }
          } catch {
            // Non-JSON chunk — forward as raw text so nothing is silently dropped
            const text = line.trimEnd();
            if (text) sendLogLine(res, text, 'stdout');
          }
        });
    });

    // Build completed successfully
    buildStream.on('end', () => {
      closeSseStream(res, 'done', 'Docker image build completed.');
    });

    // Forward stream-level errors to the client
    buildStream.on('error', (err) => {
      closeSseStream(res, 'error', err.message || 'Build stream error.');
    });
  } catch (err) {
    // docker.buildImage itself threw — daemon unreachable or bad tar
    closeSseStream(res, 'error', err.message || 'Failed to start build stream.');
  }
}