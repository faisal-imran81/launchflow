import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { detectStack } from '../src/utils/detectStack.js'

describe('detectStack', () => {
  it('returns unknown when packageJson is null', () => {
    const result = detectStack(null)
    assert.equal(result.language, 'Unknown')
    assert.equal(result.framework, 'Unknown')
    assert.equal(result.type, 'unknown')
  })

  it('detects Next.js fullstack', () => {
    const result = detectStack({ dependencies: { next: '14.0.0' } })
    assert.equal(result.framework, 'Next.js')
    assert.equal(result.type, 'fullstack')
    assert.equal(result.buildOutput, '.next')
    assert.equal(result.port, 3000)
  })

  it('detects React + Vite frontend', () => {
    const result = detectStack({ dependencies: { vite: '5.0.0', react: '18.0.0' } })
    assert.equal(result.framework, 'React (Vite)')
    assert.equal(result.type, 'frontend')
    assert.equal(result.buildOutput, 'dist')
    assert.equal(result.port, 80)
  })

  it('detects Vue + Vite frontend', () => {
    const result = detectStack({ dependencies: { vite: '5.0.0', vue: '3.0.0' } })
    assert.equal(result.framework, 'Vue (Vite)')
    assert.equal(result.type, 'frontend')
  })

  it('detects plain Vite (no framework)', () => {
    const result = detectStack({ dependencies: { vite: '5.0.0' } })
    assert.equal(result.framework, 'Vite')
    assert.equal(result.type, 'frontend')
  })

  it('detects React CRA frontend', () => {
    const result = detectStack({ dependencies: { 'react-scripts': '5.0.0' } })
    assert.equal(result.framework, 'React (CRA)')
    assert.equal(result.buildOutput, 'build')
    assert.equal(result.port, 80)
  })

  it('detects Express backend', () => {
    const result = detectStack({ dependencies: { express: '4.18.0' }, scripts: { start: 'node index.js' } })
    assert.equal(result.framework, 'Express')
    assert.equal(result.type, 'backend')
    assert.equal(result.port, 3000)
  })

  it('detects Fastify backend', () => {
    const result = detectStack({ dependencies: { fastify: '4.0.0' } })
    assert.equal(result.framework, 'Fastify')
    assert.equal(result.type, 'backend')
  })

  it('falls back to Node.js backend when no framework matched', () => {
    const result = detectStack({ dependencies: { lodash: '4.0.0' } })
    assert.equal(result.framework, 'Node.js')
    assert.equal(result.type, 'backend')
  })

  it('uses npm start when scripts.start exists', () => {
    const result = detectStack({ dependencies: { express: '4.0.0' }, scripts: { start: 'node server.js' } })
    assert.equal(result.startCommand, 'npm start')
  })
})
