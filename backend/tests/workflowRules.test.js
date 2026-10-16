import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { getWorkflowRules } from '../src/utils/workflowRules.js'

describe('getWorkflowRules', () => {
  it('contains common CI rules for all types', () => {
    const result = getWorkflowRules({ repoName: 'my-app', type: 'backend', framework: 'Express' })
    assert.ok(result.includes('CI/CD'))
    assert.ok(result.includes('main branch'))
    assert.ok(result.includes('ubuntu-latest'))
    assert.ok(result.includes('npm ci'))
  })

  it('includes build step for frontend type', () => {
    const result = getWorkflowRules({ repoName: 'my-app', type: 'frontend', framework: 'React (Vite)' })
    assert.ok(result.includes('npm run build'))
    assert.ok(result.includes('React (Vite)'))
  })

  it('includes build step for fullstack type', () => {
    const result = getWorkflowRules({ repoName: 'my-app', type: 'fullstack', framework: 'Next.js' })
    assert.ok(result.includes('npm run build'))
    assert.ok(result.includes('Next.js'))
  })

  it('uses --if-present for backend build', () => {
    const result = getWorkflowRules({ repoName: 'my-app', type: 'backend', framework: 'Express' })
    assert.ok(result.includes('--if-present'))
  })

  it('always includes npm test --if-present', () => {
    const result = getWorkflowRules({ repoName: 'my-app', type: 'frontend', framework: 'React (Vite)' })
    assert.ok(result.includes('npm test --if-present'))
  })

  it('includes docker hub login and build-push steps', () => {
    const result = getWorkflowRules({ repoName: 'my-app', type: 'backend', framework: 'Express' })
    assert.ok(result.includes('docker/login-action@v3'))
    assert.ok(result.includes('docker/build-push-action@v5'))
  })

  it('never hardcodes credentials — uses GitHub Secrets', () => {
    const result = getWorkflowRules({ repoName: 'my-app', type: 'backend', framework: 'Express' })
    assert.ok(result.includes('DOCKER_USERNAME'))
    assert.ok(result.includes('DOCKER_PASSWORD'))
    assert.ok(result.includes('never hardcode'))
  })

  it('slugifies repo name for image tag', () => {
    const result = getWorkflowRules({ repoName: 'My App 2.0!', type: 'backend', framework: 'Express' })
    assert.ok(result.includes('my-app-2.0-'))
  })

  it('includes both latest and sha tags', () => {
    const result = getWorkflowRules({ repoName: 'my-app', type: 'backend', framework: 'Express' })
    assert.ok(result.includes(':latest'))
    assert.ok(result.includes('github.sha'))
  })
})
