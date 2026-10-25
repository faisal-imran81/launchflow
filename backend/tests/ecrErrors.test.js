import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { toEcrError } from '../src/utils/ecrErrors.js'

describe('toEcrError — passthrough', () => {
  it('returns an existing ecr error unchanged', () => {
    const original = new Error('already clean')
    original.status = 404
    original.isEcrError = true
    assert.equal(toEcrError(original), original)
  })
})

describe('toEcrError — AWS error code mapping', () => {
  it('maps RepositoryNotFoundException to ecr/not-found', () => {
    const err = toEcrError({ Code: 'RepositoryNotFoundException' })
    assert.equal(err.status, 404)
    assert.equal(err.code, 'ecr/not-found')
    assert.equal(err.isEcrError, true)
    assert.match(err.message, /not found/i)
  })

  it('maps ImageNotFoundException to ecr/not-found', () => {
    const err = toEcrError({ Code: 'ImageNotFoundException' })
    assert.equal(err.status, 404)
    assert.equal(err.code, 'ecr/not-found')
    assert.equal(err.isEcrError, true)
  })

  it('maps RepositoryAlreadyExistsException to ecr/already-exists', () => {
    const err = toEcrError({ Code: 'RepositoryAlreadyExistsException' })
    assert.equal(err.status, 409)
    assert.equal(err.code, 'ecr/already-exists')
    assert.equal(err.isEcrError, true)
    assert.match(err.message, /already exists/i)
  })

  it('maps InvalidParameterException to ecr/invalid-input', () => {
    const err = toEcrError({ Code: 'InvalidParameterException' })
    assert.equal(err.status, 400)
    assert.equal(err.code, 'ecr/invalid-input')
    assert.equal(err.isEcrError, true)
  })

  it('maps ValidationException to ecr/invalid-input', () => {
    const err = toEcrError({ Code: 'ValidationException' })
    assert.equal(err.status, 400)
    assert.equal(err.code, 'ecr/invalid-input')
    assert.equal(err.isEcrError, true)
  })

  it('maps AuthorizationException to ecr/auth-failed', () => {
    const err = toEcrError({ Code: 'AuthorizationException' })
    assert.equal(err.status, 500)
    assert.equal(err.code, 'ecr/auth-failed')
    assert.equal(err.isEcrError, true)
    assert.ok(!err.message.includes('AWS_ACCESS_KEY_ID'))
  })

  it('maps UnauthorizedOperation to ecr/auth-failed', () => {
    const err = toEcrError({ Code: 'UnauthorizedOperation' })
    assert.equal(err.status, 500)
    assert.equal(err.code, 'ecr/auth-failed')
    assert.equal(err.isEcrError, true)
  })

  it('maps LimitExceededException to ecr/limit-exceeded', () => {
    const err = toEcrError({ Code: 'LimitExceededException' })
    assert.equal(err.status, 429)
    assert.equal(err.code, 'ecr/limit-exceeded')
    assert.equal(err.isEcrError, true)
  })

  it('maps NetworkingError to ecr/service-unavailable', () => {
    const err = toEcrError({ Code: 'NetworkingError' })
    assert.equal(err.status, 503)
    assert.equal(err.code, 'ecr/service-unavailable')
    assert.equal(err.isEcrError, true)
  })

  it('maps unknown AWS error code to ecr/bad-gateway', () => {
    const err = toEcrError({ Code: 'SomeUnknownError' })
    assert.equal(err.status, 502)
    assert.equal(err.code, 'ecr/bad-gateway')
    assert.equal(err.isEcrError, true)
  })
})

describe('toEcrError — no Code (network/SDK error)', () => {
  it('maps plain Error with no Code to ecr/service-unavailable', () => {
    const err = toEcrError(new Error('getaddrinfo ENOTFOUND ecr.amazonaws.com'))
    assert.equal(err.status, 503)
    assert.equal(err.code, 'ecr/service-unavailable')
    assert.equal(err.isEcrError, true)
  })

  it('maps null to ecr/service-unavailable', () => {
    const err = toEcrError(null)
    assert.equal(err.status, 503)
    assert.equal(err.code, 'ecr/service-unavailable')
  })
})

describe('toEcrError — code field fallback', () => {
  it('reads .code when .Code is absent', () => {
    const err = toEcrError({ code: 'RepositoryNotFoundException' })
    assert.equal(err.status, 404)
    assert.equal(err.code, 'ecr/not-found')
  })

  it('reads .name when .Code and .code are absent', () => {
    const err = toEcrError({ name: 'RepositoryAlreadyExistsException' })
    assert.equal(err.status, 409)
    assert.equal(err.code, 'ecr/already-exists')
  })
})
