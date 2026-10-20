import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { cleanAiOutput } from '../src/utils/cleanAiOutput.js'

const FENCE = '`'.repeat(3)
const df = (...lines) => lines.join('\n')

describe('cleanAiOutput — AI extra text around fenced blocks', () => {
  it('strips preamble text before the fenced block', () => {
    const input = df('Here is your Dockerfile:', FENCE + 'dockerfile', 'FROM node:20-alpine', FENCE)
    assert.equal(cleanAiOutput(input), 'FROM node:20-alpine')
  })

  it('strips epilogue text after the fenced block', () => {
    const input = df(FENCE + 'dockerfile', 'FROM node:20-alpine', FENCE, 'Let me know if you need changes.')
    assert.equal(cleanAiOutput(input), 'FROM node:20-alpine')
  })

  it('strips both preamble and epilogue', () => {
    const input = df('Sure! Here is the workflow:', FENCE + 'yaml', 'name: CI', FENCE, 'Hope this helps!')
    assert.equal(cleanAiOutput(input), 'name: CI')
  })

  it('handles multiline AI preamble before the fence', () => {
    const input = df(
      'I have generated a Dockerfile for you.',
      'It uses node:20-alpine as the base image.',
      '',
      FENCE + 'dockerfile',
      'FROM node:20-alpine',
      'WORKDIR /app',
      FENCE
    )
    assert.equal(cleanAiOutput(input), 'FROM node:20-alpine\nWORKDIR /app')
  })

  it('returns the first fenced block only when AI returns two blocks with explanation between them', () => {
    const input = df(
      'Option 1:',
      FENCE + 'dockerfile',
      'FROM node:20-alpine',
      FENCE,
      'Option 2:',
      FENCE + 'dockerfile',
      'FROM node:18',
      FENCE
    )
    assert.equal(cleanAiOutput(input), 'FROM node:20-alpine')
  })
})

describe('cleanAiOutput — incomplete or malformed fences', () => {
  it('falls back to trimmed text when the fence is never closed', () => {
    const input = FENCE + 'dockerfile\nFROM node:20-alpine\nWORKDIR /app'
    assert.equal(cleanAiOutput(input), input.trim())
  })

  it('falls back to trimmed text when a space follows the language name', () => {
    // regex requires [a-zA-Z]* then immediately \r?\n — a trailing space breaks the match
    const input = FENCE + 'dockerfile \nFROM node:20-alpine\n' + FENCE
    assert.equal(cleanAiOutput(input), input.trim())
  })

  it('returns empty string when the fence contains only whitespace', () => {
    const input = FENCE + 'dockerfile\n   \n' + FENCE
    assert.equal(cleanAiOutput(input), '')
  })

  it('returns empty string when the fence is immediately closed after opening', () => {
    const input = FENCE + 'dockerfile\n' + FENCE
    assert.equal(cleanAiOutput(input), '')
  })
})

describe('cleanAiOutput — content preservation inside fences', () => {
  it('preserves internal blank lines', () => {
    const input = FENCE + 'dockerfile\nFROM node:20-alpine\n\nWORKDIR /app\n' + FENCE
    assert.equal(cleanAiOutput(input), 'FROM node:20-alpine\n\nWORKDIR /app')
  })

  it('preserves YAML indentation inside the fence', () => {
    const input = FENCE + 'yaml\njobs:\n  build:\n    runs-on: ubuntu-latest\n' + FENCE
    assert.equal(cleanAiOutput(input), 'jobs:\n  build:\n    runs-on: ubuntu-latest')
  })

  it('strips leading and trailing blank lines inside the fence via trim', () => {
    const input = FENCE + 'dockerfile\n\n\nFROM node:20-alpine\n\n\n' + FENCE
    assert.equal(cleanAiOutput(input), 'FROM node:20-alpine')
  })

  it('handles CRLF line endings inside the fenced block content', () => {
    const input = FENCE + 'dockerfile\r\nFROM node:20-alpine\r\nWORKDIR /app\r\n' + FENCE
    assert.equal(cleanAiOutput(input), 'FROM node:20-alpine\r\nWORKDIR /app')
  })
})
