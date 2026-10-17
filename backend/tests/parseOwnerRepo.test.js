import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { parseOwnerRepo } from '../src/utils/parseOwnerRepo.js'

describe('parseOwnerRepo', () => {
  it('parses owner/repo format', () => {
    const result = parseOwnerRepo('faisal/launchflow')
    assert.deepEqual(result, { owner: 'faisal', repo: 'launchflow' })
  })

  it('parses full github.com URL', () => {
    const result = parseOwnerRepo('https://github.com/faisal/launchflow')
    assert.deepEqual(result, { owner: 'faisal', repo: 'launchflow' })
  })

  it('parses github.com URL with .git suffix', () => {
    const result = parseOwnerRepo('https://github.com/faisal/launchflow.git')
    assert.deepEqual(result, { owner: 'faisal', repo: 'launchflow' })
  })

  it('returns null for empty string', () => {
    assert.equal(parseOwnerRepo(''), null)
  })

  it('returns null for null input', () => {
    assert.equal(parseOwnerRepo(null), null)
  })

  it('returns null for plain repo name with no owner', () => {
    assert.equal(parseOwnerRepo('launchflow'), null)
  })

  it('trims whitespace before parsing', () => {
    const result = parseOwnerRepo('  faisal/launchflow  ')
    assert.deepEqual(result, { owner: 'faisal', repo: 'launchflow' })
  })

  it('returns null for non-string input', () => {
    assert.equal(parseOwnerRepo(123), null)
  })
})
