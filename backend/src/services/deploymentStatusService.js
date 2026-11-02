// backend/src/services/deploymentStatusService.js

/**
 * @module deploymentStatusService
 * @description Handles deployment status persistence and real-time streaming
 * for LaunchFlow. All status updates are written to Supabase and streamed
 * to the frontend via SSE.
 */

import { getSupabaseClient } from '../config/supabase.js';
import { setSseHeaders, sendSseEvent, closeSseStream, onClientDisconnect } from '../utils/sseHelper.js';

/**
 * Valid deployment status values representing each stage of the deploy pipeline.
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
 * @throws {Error}                     - If deploymentId is missing or Supabase write fails
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
