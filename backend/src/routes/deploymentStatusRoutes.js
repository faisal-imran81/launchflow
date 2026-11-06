// backend/src/routes/deploymentStatusRoutes.js

/**
 * @module deploymentStatusRoutes
 * @description Express routes for deployment status tracking.
 * Mounts under /api/status in index.js
 */

import { Router } from 'express';
import {
  handleGetDeploymentStatus,
  handleStreamDeploymentStatus,
  handleUpdateDeploymentStatus,
} from '../controllers/deploymentStatusController.js';

const router = Router();

/**
 * GET /api/status/:deploymentId
 * Returns the current status and metadata of a deployment as JSON.
 */
router.get('/:deploymentId', handleGetDeploymentStatus);

/**
 * GET /api/status/:deploymentId/stream
 * Streams real-time deployment status updates via SSE.
 * Optional query params:
 *   ?interval=2000  — polling interval in ms (default 2000, clamped 500-10000)
 */
router.get('/:deploymentId/stream', handleStreamDeploymentStatus);

/**
 * PATCH /api/status/:deploymentId
 * Internal endpoint — updates deployment status and metadata in Supabase.
 * Request body: { status: string, ...meta }
 */
router.patch('/:deploymentId', handleUpdateDeploymentStatus);

export default router;
