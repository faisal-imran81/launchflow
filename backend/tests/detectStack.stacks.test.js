import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { detectStack } from '../src/utils/detectStack.js'

const load = (name) =>
  JSON.parse(readFileSync(new URL(`./fixtures/stacks/${name}.json`, import.meta.url), 'utf8'))

const frontend = (framework, buildOutput) => ({
  language: 'JavaScript',
  framework,
  type: 'frontend',
  buildOutput,
  port: 80,
  startCommand: null,
})

const backend = (framework, startCommand) => ({
  language: 'JavaScript',
  framework,
  type: 'backend',
  buildOutput: null,
  port: 3000,
  startCommand,
})

const NEXT = {
  language: 'JavaScript',
  framework: 'Next.js',
  type: 'fullstack',
  buildOutput: '.next',
  port: 3000,
  startCommand: 'npm start',
}

const UNKNOWN = {
  language: 'Unknown',
  framework: 'Unknown',
  type: 'unknown',
  buildOutput: null,
  port: null,
  startCommand: null,
}

describe('detectStack with sample package.json fixtures', () => {
  const cases = [
    ['vite-react', frontend('React (Vite)', 'dist')],
    ['vite-vue', frontend('Vue (Vite)', 'dist')],
    ['vite-vanilla', frontend('Vite', 'dist')],
    ['cra-app', frontend('React (CRA)', 'build')],
    ['next-app', NEXT],
    ['express-api', backend('Express', 'npm start')],
    ['express-main-only', backend('Express', 'node server.js')],
    ['fastify-api', backend('Fastify', 'npm start')],
    ['koa-api', backend('Koa', null)],
    ['nestjs-api', backend('NestJS', 'npm start')],
    ['plain-node', backend('Node.js', 'node index.js')],
    ['plain-node-empty', backend('Node.js', null)],
  ]

  for (const [fixture, expected] of cases) {
    it(`detects the full stack for ${fixture}`, () => {
      assert.deepEqual(detectStack(load(fixture)), expected)
    })
  }
})

describe('detectStack input handling', () => {
  it('returns the full unknown shape for null', () => {
    assert.deepEqual(detectStack(null), UNKNOWN)
  })

  it('returns the full unknown shape for undefined', () => {
    assert.deepEqual(detectStack(undefined), UNKNOWN)
  })

  it('treats an empty object as a plain Node.js backend', () => {
    assert.deepEqual(detectStack({}), backend('Node.js', null))
  })
})

describe('detectStack priority rules', () => {
  it('prefers Next.js over Vite', () => {
    const result = detectStack({ dependencies: { next: '14.0.0', vite: '5.0.0', react: '18.0.0' } })
    assert.equal(result.framework, 'Next.js')
    assert.equal(result.type, 'fullstack')
  })

  it('prefers Vite over react-scripts', () => {
    const result = detectStack({ dependencies: { vite: '5.0.0', 'react-scripts': '5.0.0' } })
    assert.equal(result.framework, 'Vite')
    assert.equal(result.buildOutput, 'dist')
  })

  it('prefers React over Vue when both are present with Vite', () => {
    const result = detectStack({ dependencies: { vite: '5.0.0', react: '18.0.0', vue: '3.0.0' } })
    assert.equal(result.framework, 'React (Vite)')
  })

  it('treats a repo with Vite and Express as a frontend', () => {
    const result = detectStack({ dependencies: { vite: '5.0.0', express: '4.18.0' } })
    assert.equal(result.framework, 'Vite')
    assert.equal(result.type, 'frontend')
  })

  it('prefers Express over Fastify', () => {
    const result = detectStack({ dependencies: { express: '4.0.0', fastify: '4.0.0' } })
    assert.equal(result.framework, 'Express')
  })

  it('prefers Fastify over Koa', () => {
    const result = detectStack({ dependencies: { fastify: '4.0.0', koa: '2.0.0' } })
    assert.equal(result.framework, 'Fastify')
  })

  it('prefers Koa over NestJS', () => {
    const result = detectStack({ dependencies: { koa: '2.0.0', '@nestjs/core': '10.0.0' } })
    assert.equal(result.framework, 'Koa')
  })
})

describe('detectStack dependency sources', () => {
  it('reads Next.js from devDependencies', () => {
    const result = detectStack({ devDependencies: { next: '14.0.0' } })
    assert.equal(result.framework, 'Next.js')
  })

  it('reads Express from devDependencies', () => {
    const result = detectStack({ devDependencies: { express: '4.0.0' } })
    assert.equal(result.framework, 'Express')
  })
})

describe('detectStack start command', () => {
  it('always uses npm start for Next.js, even without scripts', () => {
    const result = detectStack({ dependencies: { next: '14.0.0' } })
    assert.equal(result.startCommand, 'npm start')
  })

  it('keeps startCommand null for frontend stacks even with a start script', () => {
    const result = detectStack({
      dependencies: { vite: '5.0.0' },
      scripts: { start: 'vite' },
    })
    assert.equal(result.startCommand, null)
  })

  it('prefers the start script over main', () => {
    const result = detectStack({
      dependencies: { express: '4.0.0' },
      scripts: { start: 'node app.js' },
      main: 'server.js',
    })
    assert.equal(result.startCommand, 'npm start')
  })

  it('falls back to main when the start script is empty', () => {
    const result = detectStack({
      dependencies: { express: '4.0.0' },
      scripts: { start: '' },
      main: 'server.js',
    })
    assert.equal(result.startCommand, 'node server.js')
  })

  it('returns a null startCommand when there is no start script and no main', () => {
    const result = detectStack({ dependencies: { express: '4.0.0' } })
    assert.equal(result.startCommand, null)
  })
})
