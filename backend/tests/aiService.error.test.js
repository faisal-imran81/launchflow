import { describe, it, afterEach } from 'node:test'
import assert from 'node:assert/strict'

process.env.GROQ_API_KEY = process.env.GROQ_API_KEY || 'test-key'

const {
  generateDockerfile,
  _setTestGroqClient,
  _clearTestGroqClient,
} = await import('../src/services/aiService.js')

afterEach(() => _clearTestGroqClient())

const REPO = { repoName: 'test-repo', language: 'Node.js', framework: 'Express' }

function makeGroqClient(finish_reason, content) {
  return {
    chat: {
      completions: {
        create: async () => ({
          choices: [{ finish_reason, message: { content } }],
        }),
      },
    },
  }
}

// ─── ai/too-long ─────────────────────────────────────────────────────────────

describe('aiService — ai/too-long', () => {
  it('throws ai/too-long when finish_reason is "length"', async () => {
    _setTestGroqClient(makeGroqClient('length', 'FROM node:20-alpine\n# truncated'))
    await assert.rejects(
      () => generateDockerfile(REPO),
      (err) => {
        assert.equal(err.code, 'ai/too-long')
        assert.equal(err.status, 502)
        assert.equal(err.isAiError, true)
        assert.match(err.message, /too long/i)
        return true
      }
    )
  })
})

// ─── ai/empty-response ───────────────────────────────────────────────────────

describe('aiService — ai/empty-response', () => {
  it('throws ai/empty-response when content is empty string', async () => {
    _setTestGroqClient(makeGroqClient('stop', ''))
    await assert.rejects(
      () => generateDockerfile(REPO),
      (err) => {
        assert.equal(err.code, 'ai/empty-response')
        assert.equal(err.status, 502)
        assert.equal(err.isAiError, true)
        assert.match(err.message, /empty/i)
        return true
      }
    )
  })

  it('throws ai/empty-response when content is null', async () => {
    _setTestGroqClient(makeGroqClient('stop', null))
    await assert.rejects(
      () => generateDockerfile(REPO),
      (err) => {
        assert.equal(err.code, 'ai/empty-response')
        assert.equal(err.status, 502)
        assert.equal(err.isAiError, true)
        return true
      }
    )
  })

  it('throws ai/empty-response when choices array is empty', async () => {
    _setTestGroqClient({
      chat: { completions: { create: async () => ({ choices: [] }) } },
    })
    await assert.rejects(
      () => generateDockerfile(REPO),
      (err) => {
        assert.equal(err.code, 'ai/empty-response')
        assert.equal(err.status, 502)
        assert.equal(err.isAiError, true)
        return true
      }
    )
  })
})
