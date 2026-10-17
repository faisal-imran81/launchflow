import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { generateDockerignore } from '../src/utils/generateDockerignore.js'

describe('generateDockerignore', () => {
  it('always includes node_modules', () => {
    const result = generateDockerignore('backend')
    assert.ok(result.includes('node_modules'))
  })

  it('always includes .env', () => {
    const result = generateDockerignore('backend')
    assert.ok(result.includes('.env'))
  })

  it('includes dist for frontend type', () => {
    const result = generateDockerignore('frontend')
    assert.ok(result.includes('dist'))
  })

  it('includes .next for fullstack type', () => {
    const result = generateDockerignore('fullstack')
    assert.ok(result.includes('.next'))
  })

  it('returns a non-empty string for unknown type', () => {
    const result = generateDockerignore('unknown')
    assert.ok(typeof result === 'string')
    assert.ok(result.length > 0)
  })

  it('includes git files', () => {
    const result = generateDockerignore('backend')
    assert.ok(result.includes('.git'))
  })
})
