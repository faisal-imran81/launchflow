import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { cleanAiOutput } from '../src/utils/cleanAiOutput.js'

describe('cleanAiOutput', () => {
  it('returns null/undefined as-is', () => {
    assert.equal(cleanAiOutput(null), null)
    assert.equal(cleanAiOutput(undefined), undefined)
  })

  it('extracts content from fenced code block', () => {
    const input = '```dockerfile\nFROM node:18\nRUN npm install\n```'
    assert.equal(cleanAiOutput(input), 'FROM node:18\nRUN npm install')
  })

  it('extracts content from generic triple-backtick block', () => {
    const input = '```\nsome content\n```'
    assert.equal(cleanAiOutput(input), 'some content')
  })

  it('trims plain text with no fences', () => {
    const input = '   FROM node:18   '
    assert.equal(cleanAiOutput(input), 'FROM node:18')
  })

  it('returns first fenced block when multiple exist', () => {
    const input = '```yaml\nname: CI\n```\n```bash\necho hi\n```'
    assert.equal(cleanAiOutput(input), 'name: CI')
  })

  it('handles empty string', () => {
    assert.equal(cleanAiOutput(''), '')
  })

  it('handles fenced block with windows line endings', () => {
    const input = '```dockerfile\r\nFROM node:18\r\n```'
    assert.equal(cleanAiOutput(input), 'FROM node:18')
  })
})
