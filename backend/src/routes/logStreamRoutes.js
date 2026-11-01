// backend/src/routes/logStreamRoutes.js

/**
 * @module logStreamRoutes
 * @description Express routes for SSE-based Docker log streaming.
 * Mounts under /api/logs in index.js
 */

import { Router } from 'express';
import { handleStreamContainerLogs, handleStreamBuildLogs } from '../controllers/logStreamController.js';

const router = Router();

/**
 * GET /api/logs/:containerId/stream
 * Stream live logs from a running Docker container via SSE.
 * Optional query params:
 *   ?poll=true       — use polling fallback instead of SSE follow
 *   ?tail=50         — number of lines per poll cycle (default 50)
 *   ?interval=2000   — polling interval in ms (default 2000)
 */
router.get('/:containerId/stream', handleStreamContainerLogs);

/**
 * GET /api/logs/build/:imageTag/stream
 * Stream Docker image build progress via SSE.
 * Requires tarStream and buildOpts to be attached by upstream middleware.
 */
router.get('/build/:imageTag/stream', handleStreamBuildLogs);

export default router;
