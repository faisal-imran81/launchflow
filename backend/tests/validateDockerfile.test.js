import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { validateDockerfile } from '../src/utils/validateDockerfile.js'

const df = (...lines) => lines.join('\n')
const CMD = 'CMD ["node", "index.js"]'
const FENCE = '`'.repeat(3)

describe('validateDockerfile', () => {
  describe('input handling', () => {
    it('returns the { valid, errors, warnings } shape', () => {
      const result = validateDockerfile(df('FROM node:20-alpine', 'EXPOSE 3000', CMD))
      assert.deepEqual(Object.keys(result).sort(), ['errors', 'valid', 'warnings'])
      assert.ok(Array.isArray(result.errors))
      assert.ok(Array.isArray(result.warnings))
    })

    const emptyCases = [
      ['an empty string', ''],
      ['whitespace-only text', '  \n\t \n'],
      ['null', null],
      ['undefined', undefined],
      ['a number', 42],
      ['an object', {}],
    ]

    for (const [label, input] of emptyCases) {
      it(`rejects ${label} without throwing`, () => {
        const result = validateDockerfile(input)
        assert.equal(result.valid, false)
        assert.deepEqual(result.errors, ['Dockerfile is empty'])
        assert.deepEqual(result.warnings, [])
      })
    }

    it('rejects output that still contains markdown code fences', () => {
      const result = validateDockerfile(
        df(FENCE + 'dockerfile', 'FROM node:20-alpine', FENCE)
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Dockerfile contains markdown code fences'])
    })
  })

  describe('valid Dockerfiles', () => {
    it('accepts a multi-stage Node build with no errors or warnings', () => {
      const result = validateDockerfile(
        df(
          'FROM node:20-alpine AS build',
          'WORKDIR /app',
          'COPY package*.json ./',
          'RUN npm ci',
          'COPY . .',
          'RUN npm run build',
          '',
          'FROM nginx:1.27-alpine',
          'COPY --from=build /app/dist /usr/share/nginx/html',
          'EXPOSE 80',
          'CMD ["nginx", "-g", "daemon off;"]'
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.warnings, [])
    })

    it('accepts a simple single-stage Dockerfile', () => {
      const result = validateDockerfile(
        df(
          'FROM node:20-alpine',
          'WORKDIR /app',
          'COPY . .',
          'RUN npm install',
          'EXPOSE 3000',
          CMD
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.warnings, [])
    })

    it('allows ARG before the first FROM', () => {
      const result = validateDockerfile(
        df('ARG NODE_VERSION=20', 'FROM node:20-alpine', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })

    it('accepts lowercase instructions', () => {
      const result = validateDockerfile(
        df('from node:20-alpine', 'workdir /app', 'expose 3000', 'cmd ["node", "index.js"]')
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
      assert.deepEqual(result.warnings, [])
    })

    it('ignores comments and blank lines', () => {
      const result = validateDockerfile(
        df('# build stage', 'FROM node:20-alpine', '', '# port', 'EXPOSE 3000', '', CMD)
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })

    it('joins lines that end with a backslash into one instruction', () => {
      const result = validateDockerfile(
        df(
          'FROM node:20-alpine',
          'RUN apt-get update && \\',
          '    apt-get install -y curl',
          'EXPOSE 3000',
          CMD
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
    })

    it('handles Windows (CRLF) line endings', () => {
      const text = ['FROM node:20-alpine', 'EXPOSE 3000', CMD].join('\r\n')
      const result = validateDockerfile(text)
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })

    it('accepts FROM scratch with ENTRYPOINT and no tag warning', () => {
      const result = validateDockerfile(
        df('FROM scratch', 'COPY app /app', 'EXPOSE 8080', 'ENTRYPOINT ["/app"]')
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })

    it('ignores --platform flags when reading the base image', () => {
      const result = validateDockerfile(
        df('FROM --platform=linux/amd64 node:20-alpine', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })

    it('does not warn when a FROM refers to an earlier build stage', () => {
      const result = validateDockerfile(
        df(
          'FROM node:20-alpine AS base',
          'FROM base AS build',
          'RUN npm ci',
          'FROM base',
          'EXPOSE 3000',
          CMD
        )
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })
  })

  describe('FROM rules', () => {
    it('flags a Dockerfile with no FROM', () => {
      const result = validateDockerfile(df('WORKDIR /app', CMD, 'EXPOSE 3000'))
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, [
        'Dockerfile must start with FROM (only ARG may come before it)',
      ])
    })

    it('flags a Dockerfile where FROM is not the first real instruction', () => {
      const result = validateDockerfile(
        df('RUN echo hi', 'FROM node:20-alpine', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, [
        'Dockerfile must start with FROM (only ARG may come before it)',
      ])
    })

    it('flags a FROM instruction with no image', () => {
      const result = validateDockerfile(df('FROM', 'EXPOSE 3000', CMD))
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['FROM instruction has no image'])
    })

    it('rejects plain English prose instead of a Dockerfile', () => {
      const result = validateDockerfile('Here is your Dockerfile for the project')
      assert.equal(result.valid, false)
      assert.ok(result.errors.includes('Unknown instruction: Here'))
    })
  })

  describe('instruction rules', () => {
    it('flags an unknown instruction', () => {
      const result = validateDockerfile(
        df('FROM node:20-alpine', 'INSTALL curl', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, ['Unknown instruction: INSTALL'])
    })

    it('collects several errors at once', () => {
      const result = validateDockerfile(
        df('INSTALL curl', 'FROM node:20-alpine', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, false)
      assert.equal(result.errors.length, 2)
      assert.ok(result.errors.includes('Unknown instruction: INSTALL'))
      assert.ok(
        result.errors.includes('Dockerfile must start with FROM (only ARG may come before it)')
      )
    })
  })

  describe('base image warnings', () => {
    it('warns when the base image has no version tag', () => {
      const result = validateDockerfile(df('FROM node', 'EXPOSE 3000', CMD))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, ['Base image "node" has no version tag'])
    })

    it('warns when the base image uses the latest tag', () => {
      const result = validateDockerfile(df('FROM node:latest', 'EXPOSE 3000', CMD))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, ['Base image "node:latest" uses the latest tag'])
    })

    it('treats a registry port as not being a version tag', () => {
      const result = validateDockerfile(df('FROM localhost:5000/myimage', 'EXPOSE 3000', CMD))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [
        'Base image "localhost:5000/myimage" has no version tag',
      ])
    })

    it('does not warn for an image pinned by digest', () => {
      const result = validateDockerfile(df('FROM node@sha256:abc123', 'EXPOSE 3000', CMD))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [])
    })
  })

  describe('CMD and EXPOSE warnings', () => {
    it('warns when there is no CMD or ENTRYPOINT', () => {
      const result = validateDockerfile(df('FROM node:20-alpine', 'EXPOSE 3000'))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, ['No CMD or ENTRYPOINT instruction found'])
    })

    it('accepts ENTRYPOINT in place of CMD', () => {
      const result = validateDockerfile(
        df('FROM node:20-alpine', 'EXPOSE 3000', 'ENTRYPOINT ["node", "index.js"]')
      )
      assert.deepEqual(result.warnings, [])
    })

    it('warns when there is no EXPOSE', () => {
      const result = validateDockerfile(df('FROM node:20-alpine', CMD))
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, ['No EXPOSE instruction found'])
    })

    it('reports both warnings in order when both are missing', () => {
      const result = validateDockerfile('FROM node:20-alpine')
      assert.equal(result.valid, true)
      assert.deepEqual(result.warnings, [
        'No CMD or ENTRYPOINT instruction found',
        'No EXPOSE instruction found',
      ])
    })
  })

  describe('hardcoded secret detection', () => {
    const secretError = 'Possible hardcoded secret in an ENV instruction'

    it('flags ENV API_KEY=value', () => {
      const result = validateDockerfile(
        df('FROM node:20-alpine', 'ENV API_KEY=sk-12345', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, [secretError])
    })

    it('flags the space-separated form ENV DB_PASSWORD value', () => {
      const result = validateDockerfile(
        df('FROM node:20-alpine', 'ENV DB_PASSWORD hunter2', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, [secretError])
    })

    it('flags a token variable', () => {
      const result = validateDockerfile(
        df('FROM node:20-alpine', 'ENV GITHUB_TOKEN=ghp_abc', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, [secretError])
    })

    it('detects secrets in lowercase env instructions', () => {
      const result = validateDockerfile(
        df('FROM node:20-alpine', 'env api_key=abc', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, false)
      assert.deepEqual(result.errors, [secretError])
    })

    it('does not flag normal ENV variables', () => {
      const result = validateDockerfile(
        df('FROM node:20-alpine', 'ENV NODE_ENV=production', 'ENV PORT=3000', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
    })

    it('does not flag a secret-like variable with an empty value', () => {
      const result = validateDockerfile(
        df('FROM node:20-alpine', 'ENV API_KEY=', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
    })

    it('does not flag secret-like words outside ENV instructions', () => {
      const result = validateDockerfile(
        df('FROM node:20-alpine', 'RUN echo $API_KEY', 'EXPOSE 3000', CMD)
      )
      assert.equal(result.valid, true)
      assert.deepEqual(result.errors, [])
    })
  })
})
