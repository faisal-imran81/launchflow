import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { toEc2Error } from '../src/utils/ec2Errors.js'

describe('toEc2Error — passthrough', () => {
  it('returns an existing ec2 error unchanged', () => {
    const original = new Error('already clean')
    original.status = 404
    original.isEc2Error = true
    assert.equal(toEc2Error(original), original)
  })
})

describe('toEc2Error — AWS error code mapping', () => {
  it('maps InvalidInstanceID.NotFound to ec2/not-found', () => {
    const err = toEc2Error({ Code: 'InvalidInstanceID.NotFound' })
    assert.equal(err.status, 404)
    assert.equal(err.code, 'ec2/not-found')
    assert.equal(err.isEc2Error, true)
    assert.match(err.message, /not found/i)
  })

  it('maps InvalidAMIID.NotFound to ec2/not-found', () => {
    const err = toEc2Error({ Code: 'InvalidAMIID.NotFound' })
    assert.equal(err.status, 404)
    assert.equal(err.code, 'ec2/not-found')
    assert.equal(err.isEc2Error, true)
  })

  it('maps InvalidInstanceID.Malformed to ec2/invalid-input', () => {
    const err = toEc2Error({ Code: 'InvalidInstanceID.Malformed' })
    assert.equal(err.status, 400)
    assert.equal(err.code, 'ec2/invalid-input')
    assert.equal(err.isEc2Error, true)
  })

  it('maps UnauthorizedOperation to ec2/auth-failed', () => {
    const err = toEc2Error({ Code: 'UnauthorizedOperation' })
    assert.equal(err.status, 500)
    assert.equal(err.code, 'ec2/auth-failed')
    assert.equal(err.isEc2Error, true)
    assert.ok(!err.message.includes('AWS_ACCESS_KEY_ID'))
  })

  it('maps AuthFailure to ec2/auth-failed', () => {
    const err = toEc2Error({ Code: 'AuthFailure' })
    assert.equal(err.status, 500)
    assert.equal(err.code, 'ec2/auth-failed')
    assert.equal(err.isEc2Error, true)
  })

  it('maps RequestExpired to ec2/request-expired', () => {
    const err = toEc2Error({ Code: 'RequestExpired' })
    assert.equal(err.status, 400)
    assert.equal(err.code, 'ec2/request-expired')
    assert.equal(err.isEc2Error, true)
  })

  it('maps InstanceLimitExceeded to ec2/limit-exceeded', () => {
    const err = toEc2Error({ Code: 'InstanceLimitExceeded' })
    assert.equal(err.status, 429)
    assert.equal(err.code, 'ec2/limit-exceeded')
    assert.equal(err.isEc2Error, true)
  })

  it('maps InsufficientInstanceCapacity to ec2/insufficient-capacity', () => {
    const err = toEc2Error({ Code: 'InsufficientInstanceCapacity' })
    assert.equal(err.status, 503)
    assert.equal(err.code, 'ec2/insufficient-capacity')
    assert.equal(err.isEc2Error, true)
  })

  it('maps NetworkingError to ec2/service-unavailable', () => {
    const err = toEc2Error({ Code: 'NetworkingError' })
    assert.equal(err.status, 503)
    assert.equal(err.code, 'ec2/service-unavailable')
    assert.equal(err.isEc2Error, true)
  })

  it('maps unknown AWS error code to ec2/bad-gateway', () => {
    const err = toEc2Error({ Code: 'SomeUnknownError' })
    assert.equal(err.status, 502)
    assert.equal(err.code, 'ec2/bad-gateway')
    assert.equal(err.isEc2Error, true)
  })
})

describe('toEc2Error — no Code (network/SDK error)', () => {
  it('maps plain Error with no Code to ec2/service-unavailable', () => {
    const err = toEc2Error(new Error('getaddrinfo ENOTFOUND ec2.amazonaws.com'))
    assert.equal(err.status, 503)
    assert.equal(err.code, 'ec2/service-unavailable')
    assert.equal(err.isEc2Error, true)
  })

  it('maps null to ec2/service-unavailable', () => {
    const err = toEc2Error(null)
    assert.equal(err.status, 503)
    assert.equal(err.code, 'ec2/service-unavailable')
  })
})

describe('toEc2Error — code field fallback', () => {
  it('reads .code when .Code is absent', () => {
    const err = toEc2Error({ code: 'InvalidInstanceID.NotFound' })
    assert.equal(err.status, 404)
    assert.equal(err.code, 'ec2/not-found')
  })

  it('reads .name when .Code and .code are absent', () => {
    const err = toEc2Error({ name: 'InvalidInstanceID.Malformed' })
    assert.equal(err.status, 400)
    assert.equal(err.code, 'ec2/invalid-input')
  })
})
