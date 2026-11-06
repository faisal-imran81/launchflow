// backend/src/services/deploymentStatusService.js

/**
 * @module deploymentStatusService
 * @description Manages deployment status persistence and real-time SSE streaming
 * for LaunchFlow. Writes status updates to Supabase at each pipeline step and
 * streams live progress to connected clients via Server-Sent Events.
 *
 * Status flow: queued → building → pushing → deploying → running | failed | stopped
 */

import { getSupabaseClient } from '../config/supabase.js';
import { setSseHeaders, sendSseEvent, closeSseStream, onClientDisconnect } from '../utils/sseHelper.js';

/**
 * All valid deployment pipeline status values.
 * Controllers and services must only use values from this enum.
 * @readonly
 * @enum {string}
 */
export const DEPLOYMENT_STATUS = {
  QUEUED:     'queued',
  BUILDING:   'building',
  PUSHING:    'pushing',
  DEPLOYING:  'deploying',
  RUNNING:    'running',
  FAILED:     'failed',
  STOPPED:    'stopped',
};

/**
 * Writes a new status and optional metadata to the deployments table in Supabase.
 * Called at each step of the deploy pipeline to track progress in real time.
 *
 * @param {string} deploymentId        - UUID of the deployment record
 * @param {string} status              - One of DEPLOYMENT_STATUS values
 * @param {object} [meta={}]           - Optional metadata (error message, image tag, etc.)
 * @param {object} [_supabase=null]    - Optional Supabase client override for testing
 * @returns {Promise<object>}          - Updated deployment row from Supabase
 * @throws {Error}                     - If deploymentId is missing, status is invalid, or Supabase write fails
 */
export async function updateDeploymentStatus(
  deploymentId,
  status,
  meta = {},
  _supabase = null,
) {
  if (!deploymentId) {
    throw new Error('deploymentId is required to update deployment status.');
  }

  if (!Object.values(DEPLOYMENT_STATUS).includes(status)) {
    throw new Error(`Invalid status value: "${status}".`);
  }

  const supabase = _supabase ?? getSupabaseClient();

  const updatePayload = {
    status,
    updated_at: new Date().toISOString(),
    // Spread any extra metadata fields (error, imageTag, containerId, etc.)
    ...meta,
  };

  const { data, error } = await supabase
    .from('deployments')
    .update(updatePayload)
    .eq('id', deploymentId)
    .select()
    .single();

  if (error) {
    throw new Error(
      `Failed to update deployment status: ${error.message}`,
    );
  }

  return data;
}

/**
 * Reads the current status of a deployment from Supabase.
 * Used by the GET endpoint and the SSE polling loop to check for changes.
 *
 * @param {string} deploymentId     - UUID of the deployment record
 * @param {object} [_supabase=null] - Optional Supabase client override for testing
 * @returns {Promise<object>}       - Deployment row containing status and metadata
 * @throws {Error}                  - If deploymentId is missing or deployment record is not found
 */
export async function getDeploymentStatus(deploymentId, _supabase = null) {
  if (!deploymentId) {
    throw new Error('deploymentId is required to get deployment status.');
  }

  const supabase = _supabase ?? getSupabaseClient();

  const { data, error } = await supabase
    .from('deployments')
    .select('id, status, updated_at, error, image_tag, container_id')
    .eq('id', deploymentId)
    .single();

  if (error) {
    throw new Error(
      `Failed to fetch deployment status: ${error.message}`,
    );
  }

  if (!data) {
    throw new Error(`Deployment not found: ${deploymentId}`);
  }

  return data;
}

/**
 * Streams real-time deployment status updates to the client via SSE.
 * Polls Supabase on a fixed interval and pushes a status event whenever
 * the status changes. Closes the stream when a terminal status is reached.
 *
 * Terminal statuses: 'running', 'failed', 'stopped'
 *
 * @param {string}                      deploymentId    - UUID of the deployment record
 * @param {import('express').Request}   req
 * @param {import('express').Response}  res
 * @param {number}                      [intervalMs=2000] - Poll interval in milliseconds
 * @param {object}                      [_supabase=null]  - Optional Supabase client override
 * @returns {Promise<void>}
 * @throws {never} All errors are caught and sent as SSE status events
 */
export async function streamDeploymentStatus(
  deploymentId,
  req,
  res,
  intervalMs = 2000,
  _supabase = null,
) {
  // Terminal statuses — stream closes when any of these is reached
  const TERMINAL_STATUSES = new Set([
    DEPLOYMENT_STATUS.RUNNING,
    DEPLOYMENT_STATUS.FAILED,
    DEPLOYMENT_STATUS.STOPPED,
  ]);

  // Open SSE connection immediately
  setSseHeaders(res);

  let timer = null;
  let lastStatus = null;

  // Stop polling when client disconnects
  onClientDisconnect(req, () => {
    if (timer) clearInterval(timer);
  });

  /**
   * Poll Supabase for the latest deployment status.
   * Push a status event only when the status has changed.
   * Close the stream once a terminal status is reached.
   */
  async function poll() {
    try {
      const deployment = await getDeploymentStatus(deploymentId, _supabase);
      const currentStatus = deployment.status;

      // Only send an event if status changed since the last poll
      if (currentStatus !== lastStatus) {
        lastStatus = currentStatus;

        // Skip write if client already disconnected
        if (res.ended) return;
        sendSseEvent(res, 'status', {
          deploymentId,
          status: currentStatus,
          updatedAt: deployment.updated_at,
          error: deployment.error ?? null,
          imageTag: deployment.image_tag ?? null,
          containerId: deployment.container_id ?? null,
        });

        // Stop polling once we hit a terminal state
        if (TERMINAL_STATUSES.has(currentStatus)) {
          clearInterval(timer);
          // Guard against write-after-end if client already disconnected
          if (!res.ended) {
            closeSseStream(res, 'done', `Deployment reached terminal status: ${currentStatus}`);
          }
          return;
        }
      }
    } catch (err) {
      // Any Supabase or network error — stop polling and report
      clearInterval(timer);
      // Guard against write-after-end if client already disconnected
      if (!res.ended) {
        closeSseStream(res, 'error', err.message || 'Status polling error.');
      }
    }
  }

  // Run immediately then repeat on interval
  await poll();

  // Only start interval if stream is still open after first poll
  if (!res.ended) {
    timer = setInterval(poll, intervalMs);
  }
}
