// backend/src/controllers/deploymentStatusController.js

/**
 * @module deploymentStatusController
 * @description Express controllers for deployment status endpoints.
 * Handles input validation, error mapping, and delegates to deploymentStatusService.
 */

import {
  getDeploymentStatus,
  updateDeploymentStatus,
  streamDeploymentStatus,
  DEPLOYMENT_STATUS,
} from '../services/deploymentStatusService.js';
import { mapDeploymentStatusError } from '../utils/deploymentStatusErrors.js';
import { closeSseStream } from '../utils/sseHelper.js';

/**
 * Validates that a deploymentId is a non-empty UUID string.
 * Docker container IDs and Supabase UUIDs both pass this check.
 *
 * @param {string} id
 * @returns {boolean}
 */
function isValidDeploymentId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9_\-.]+$/.test(id) && id.length > 0;
}

/**
 * GET /api/status/:deploymentId
 *
 * Returns the current status and metadata of a deployment as JSON.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function handleGetDeploymentStatus(req, res) {
  const { deploymentId } = req.params;

  // Validate deploymentId format before hitting Supabase
  if (!isValidDeploymentId(deploymentId)) {
    return res.status(400).json({
      error: 'Invalid or missing deploymentId parameter.',
    });
  }

  try {
    const deployment = await getDeploymentStatus(deploymentId);

    return res.status(200).json({
      deploymentId: deployment.id,
      status: deployment.status,
      updatedAt: deployment.updated_at,
      error: deployment.error ?? null,
      imageTag: deployment.image_tag ?? null,
      containerId: deployment.container_id ?? null,
    });
  } catch (err) {
    const mapped = mapDeploymentStatusError(err);
    return res.status(mapped.statusCode).json({
      error: mapped.message,
      code: mapped.code,
    });
  }
}

/**
 * GET /api/status/:deploymentId/stream
 *
 * Streams real-time deployment status updates to the client via SSE.
 * Polls Supabase every 2 seconds and pushes a status event on each change.
 * Closes automatically when a terminal status is reached.
 *
 * Optional query params:
 *   ?interval=2000  — polling interval in ms (default 2000)
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function handleStreamDeploymentStatus(req, res) {
  const { deploymentId } = req.params;

  // Validate deploymentId format before opening SSE connection
  if (!isValidDeploymentId(deploymentId)) {
    return res.status(400).json({
      error: 'Invalid or missing deploymentId parameter.',
    });
  }

  // Allow clients to configure poll interval via query param
  const intervalMs = parseInt(req.query.interval, 10) || 2000;

  // Clamp interval between 500ms and 10000ms to prevent abuse
  const safeInterval = Math.min(Math.max(intervalMs, 500), 10000);

  try {
    await streamDeploymentStatus(deploymentId, req, res, safeInterval);
  } catch (err) {
    const mapped = mapDeploymentStatusError(err);

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

/**
 * PATCH /api/status/:deploymentId
 *
 * Internal endpoint for updating deployment status and metadata.
 * Called by the deploy pipeline at each step to persist progress.
 *
 * Request body:
 *   { status: string, ...meta }
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {Promise<void>}
 */
export async function handleUpdateDeploymentStatus(req, res) {
  const { deploymentId } = req.params;

  // Validate deploymentId format
  if (!isValidDeploymentId(deploymentId)) {
    return res.status(400).json({
      error: 'Invalid or missing deploymentId parameter.',
    });
  }

  const { status, ...meta } = req.body ?? {};

  // Status field is required in request body
  if (!status) {
    return res.status(400).json({
      error: 'Request body must include a status field.',
    });
  }

  // Validate status value against allowed enum
  if (!Object.values(DEPLOYMENT_STATUS).includes(status)) {
    return res.status(400).json({
      error: `Invalid status value: "${status}". Must be one of: ${Object.values(DEPLOYMENT_STATUS).join(', ')}.`,
    });
  }

  try {
    const updated = await updateDeploymentStatus(deploymentId, status, meta);

    return res.status(200).json({
      deploymentId: updated.id,
      status: updated.status,
      updatedAt: updated.updated_at,
    });
  } catch (err) {
    const mapped = mapDeploymentStatusError(err);
    return res.status(mapped.statusCode).json({
      error: mapped.message,
      code: mapped.code,
    });
  }
}
