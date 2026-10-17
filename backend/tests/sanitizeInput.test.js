import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeInput, sanitizeBody } from '../src/utils/sanitizeInput.js'

describe('sanitizeInput', () => {
  it('trims whitespace from strings', () => {
    assert.equal(sanitizeInput('  hello  '), 'hello')
  })

  it('truncates strings longer than 500 chars', () => {
    const long = 'a'.repeat(600)
    assert.equal(sanitizeInput(long).length, 500)
  })

  it('returns non-string values as-is', () => {
    assert.equal(sanitizeInput(42), 42)
    assert.equal(sanitizeInput(null), null)
    assert.equal(sanitizeInput(undefined), undefined)
  })

  it('returns empty string for empty input', () => {
    assert.equal(sanitizeInput(''), '')
  })
})

describe('sanitizeBody', () => {
  it('sanitizes all string values in object', () => {
    const result = sanitizeBody({ name: '  test  ', desc: '  hello  ' })
    assert.equal(result.name, 'test')
    assert.equal(result.desc, 'hello')
  })

  it('returns empty object for null input', () => {
    assert.deepEqual(sanitizeBody(null), {})
  })

  it('returns empty object for non-object input', () => {
    assert.deepEqual(sanitizeBody('string'), {})
  })

  it('passes through non-string values untouched', () => {
    const result = sanitizeBody({ count: 5, active: true })
    assert.equal(result.count, 5)
    assert.equal(result.active, true)
  })
})
