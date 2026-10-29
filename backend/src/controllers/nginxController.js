import {
  generateNginxConfig,
  generateNginxConfigFromStack,
  generateSslConfig,
} from '../services/nginxService.js'
import { validateNginxConfig } from '../utils/validateNginxConfig.js'

/**
 * POST /api/nginx/generate
 * Body: { domain: string, port: number, appName?: string }
 */
export async function handleGenerateConfig(req, res, next) {
  const { domain, port, appName } = req.body ?? {}

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'domain is required and must be a string' })
  }

  if (!port) {
    return res.status(400).json({ error: 'port is required' })
  }

  try {
    const result = generateNginxConfig({ domain, port, appName })
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
}

/**
 * POST /api/nginx/generate/stack
 * Body: { domain: string, type: string, port?: number, buildOutput?: string, appName?: string }
 */
export async function handleGenerateConfigFromStack(req, res, next) {
  const { domain, type, port, buildOutput, appName } = req.body ?? {}

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'domain is required and must be a string' })
  }

  if (!type || !['frontend', 'backend', 'fullstack'].includes(type)) {
    return res.status(400).json({ error: 'type must be one of: frontend, backend, fullstack' })
  }

  if ((type === 'backend' || type === 'fullstack') && !port) {
    return res.status(400).json({ error: 'port is required for backend and fullstack types' })
  }

  try {
    const result = generateNginxConfigFromStack({ domain, type, port, buildOutput, appName })
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
}

/**
 * POST /api/nginx/generate/ssl
 * Body: { domain: string, port: number, appName?: string, certPath?: string, keyPath?: string }
 */
export async function handleGenerateSslConfig(req, res, next) {
  const { domain, port, appName, certPath, keyPath } = req.body ?? {}

  if (!domain || typeof domain !== 'string') {
    return res.status(400).json({ error: 'domain is required and must be a string' })
  }

  if (!port) {
    return res.status(400).json({ error: 'port is required' })
  }

  try {
    const result = generateSslConfig({ domain, port, appName, certPath, keyPath })
    return res.status(200).json({ ok: true, ...result })
  } catch (err) {
    return next(err)
  }
}

/**
 * POST /api/nginx/validate
 * Body: { config: string }
 */
export async function handleValidateConfig(req, res, next) {
  const { config } = req.body ?? {}

  if (!config || typeof config !== 'string') {
    return res.status(400).json({ error: 'config is required and must be a string' })
  }

  try {
    const result = validateNginxConfig(config)
    const isValid = result.errors.length === 0
    return res.status(200).json({ ok: true, valid: isValid, ...result })
  } catch (err) {
    return next(err)
  }
}
