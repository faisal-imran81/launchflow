/**
 * @module validateNginxConfig
 *
 * Validates an Nginx config string for common errors and warnings.
 * Returns { errors, warnings } — does not throw.
 * Mirrors the shape of validateDockerfile and validateWorkflow.
 */

/**
 * Validates an Nginx configuration string.
 *
 * @param {string} config - Raw Nginx config text
 * @returns {{ errors: string[], warnings: string[] }}
 */
export function validateNginxConfig(config) {
  const errors = []
  const warnings = []

  if (!config || typeof config !== 'string') {
    errors.push('Config must be a non-empty string')
    return { errors, warnings }
  }

  const trimmed = config.trim()

  // Must have at least one server block
  if (!trimmed.includes('server {') && !trimmed.includes('server{')) {
    errors.push('No server block found — config must contain at least one server { } block')
  }

  // Must have a listen directive
  if (!trimmed.includes('listen ')) {
    errors.push('No listen directive found — add "listen 80;" or "listen 443 ssl;"')
  }

  // Must have a server_name directive
  if (!trimmed.includes('server_name ')) {
    errors.push('No server_name directive found — add "server_name yourdomain.com;"')
  }

  // Must have at least one location block
  if (!trimmed.includes('location ') && !trimmed.includes('location/')) {
    errors.push('No location block found — config must contain at least one location block')
  }

  // SSL checks — if port 443 is used, cert and key must be present
  if (trimmed.includes('listen 443')) {
    if (!trimmed.includes('ssl_certificate ')) {
      errors.push('SSL: ssl_certificate directive is missing')
    }
    if (!trimmed.includes('ssl_certificate_key ')) {
      errors.push('SSL: ssl_certificate_key directive is missing')
    }
    if (!trimmed.includes('ssl_protocols ')) {
      warnings.push('SSL: ssl_protocols directive is missing — consider adding TLSv1.2 TLSv1.3')
    }
  }

  // proxy_pass checks
  if (trimmed.includes('proxy_pass')) {
    if (!trimmed.includes('proxy_set_header Host')) {
      warnings.push('proxy_pass: missing "proxy_set_header Host $host" — upstream may not receive correct host header')
    }
    if (!trimmed.includes('proxy_http_version 1.1')) {
      warnings.push('proxy_pass: missing "proxy_http_version 1.1" — required for WebSocket support')
    }
  }

  // Warn if no HTTPS redirect when port 80 is present alongside 443
  if (trimmed.includes('listen 80') && trimmed.includes('listen 443')) {
    if (!trimmed.includes('return 301')) {
      warnings.push('HTTP to HTTPS redirect missing — consider adding "return 301 https://$host$request_uri;"')
    }
  }

  // Warn if server_name is set to _ (catch-all)
  if (trimmed.includes('server_name _;') || trimmed.includes('server_name _')) {
    warnings.push('server_name is set to "_" (catch-all) — set a real domain for production')
  }

  // Warn if try_files is missing in a static file server
  if (trimmed.includes('root ') && !trimmed.includes('try_files')) {
    warnings.push('Static file server: missing "try_files" directive — SPA routes may return 404')
  }

  return { errors, warnings }
}
