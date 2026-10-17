import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-key'

// Integration smoke tests — verify module exports exist and are callable
const { generateDockerfile, generateGithubActionsYAML, generateDockerfileFromStack, generateGithubActionsFromStack } = await import('../src/services/aiService.js')

describe('aiService — export shape', () => {
  it('generateDockerfile is a function', () => {
    assert.equal(typeof generateDockerfile, 'function')
  })

  it('generateGithubActionsYAML is a function', () => {
    assert.equal(typeof generateGithubActionsYAML, 'function')
  })

  it('generateDockerfileFromStack is a function', () => {
    assert.equal(typeof generateDockerfileFromStack, 'function')
  })

  it('generateGithubActionsFromStack is a function', () => {
    assert.equal(typeof generateGithubActionsFromStack, 'function')
  })
})
