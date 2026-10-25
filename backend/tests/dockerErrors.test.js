import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { toDockerError } from '../src/utils/dockerErrors.js'

describe('toDockerError — passthrough', () => {
  it('returns an existing docker error unchanged', () => {
    const original = new Error('already clean')
    original.status = 404
    original.isDockerError = true
    assert.equal(toDockerError(original), original)
  })
})

describe('toDockerError — HTTP status mapping', () => {
  it('maps statusCode 404 to docker/not-found', () => {
    const err = toDockerError({ statusCode: 404 })
    assert.equal(err.status, 404)
    assert.equal(err.code, 'docker/not-found')
    assert.equal(err.isDockerError, true)
    assert.match(err.message, /not found/i)
  })

  it('maps statusCode 409 to docker/conflict', () => {
    const err = toDockerError({ statusCode: 409 })
    assert.equal(err.status, 409)
    assert.equal(err.code, 'docker/conflict')
    assert.equal(err.isDockerError, true)
    assert.match(err.message, /conflict/i)
  })

  it('maps statusCode 422 to docker/unprocessable', () => {
    const err = toDockerError({ statusCode: 422 })
    assert.equal(err.status, 422)
    assert.equal(err.code, 'docker/unprocessable')
    assert.equal(err.isDockerError, true)
    assert.match(err.message, /dockerfile/i)
  })

  it('maps statusCode 500 to docker/daemon-error with 502 client status', () => {
    const err = toDockerError({ statusCode: 500 })
    assert.equal(err.status, 502)
    assert.equal(err.code, 'docker/daemon-error')
    assert.equal(err.isDockerError, true)
  })

  it('maps unknown statusCode to docker/bad-gateway', () => {
    const err = toDockerError({ statusCode: 503 })
    assert.equal(err.status, 502)
    assert.equal(err.code, 'docker/bad-gateway')
    assert.equal(err.isDockerError, true)
  })
})

describe('toDockerError — no status (daemon unreachable)', () => {
  it('maps missing statusCode to docker/daemon-unavailable', () => {
    const err = toDockerError(new Error('connect ENOENT /var/run/docker.sock'))
    assert.equal(err.status, 503)
    assert.equal(err.code, 'docker/daemon-unavailable')
    assert.equal(err.isDockerError, true)
    assert.match(err.message, /docker/i)
  })

  it('maps null error to docker/daemon-unavailable', () => {
    const err = toDockerError(null)
    assert.equal(err.status, 503)
    assert.equal(err.code, 'docker/daemon-unavailable')
  })
})

describe('toDockerError — status field fallback', () => {
  it('reads .status when .statusCode is absent', () => {
    const err = toDockerError({ status: 404 })
    assert.equal(err.status, 404)
    assert.equal(err.code, 'docker/not-found')
  })
})
