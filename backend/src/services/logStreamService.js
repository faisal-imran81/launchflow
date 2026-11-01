// backend/src/services/logStreamService.js

import docker from '../config/docker.js';
import { setSseHeaders, sendLogLine, closeSseStream, onClientDisconnect } from '../utils/sseHelper.js';

/**
 * Stream live logs from a running Docker container to the client via SSE.
 * Uses Dockerode with follow:true so log lines are pushed as they arrive.
 *
 * @param {string}                      containerId - Docker container ID or name
 * @param {import('express').Request}   req
 * @param {import('express').Response}  res
 */
export async function streamDockerLogs(containerId, req, res) {
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
