import { describe, it, afterEach } from 'node:test'
import assert from 'node:assert/strict'

const {
  buildImage,
  listImages,
  removeImage,
  runContainer,
  stopContainer,
  removeContainer,
  getContainerLogs,
  _setTestDockerClient,
  _clearTestDockerClient,
} = await import('../src/services/dockerService.js')

afterEach(() => _clearTestDockerClient())

// ─── buildImage ──────────────────────────────────────────────────────────────

describe('buildImage — input validation', () => {
  it('throws docker/invalid-input when dockerfileContent is missing', async () => {
    await assert.rejects(
      () => buildImage({ tag: 'myapp:latest' }),
      (err) => { assert.equal(err.code, 'docker/invalid-input'); return true }
    )
  })

  it('throws docker/invalid-input when tag is missing', async () => {
    await assert.rejects(
      () => buildImage({ dockerfileContent: 'FROM node:20' }),
      (err) => { assert.equal(err.code, 'docker/invalid-input'); return true }
    )
  })
})

describe('buildImage — success', () => {
  it('resolves with the image tag on successful build', async () => {
    _setTestDockerClient({
      buildImage: async () => 'fake-stream',
      modem: {
        followProgress: (_s, cb) => cb(null, [{ stream: 'Successfully built abc123\n' }]),
      },
    })
    const result = await buildImage({ dockerfileContent: 'FROM node:20-alpine', tag: 'myapp:latest' })
    assert.equal(result, 'myapp:latest')
  })

  it('throws docker/build-failed when stream output contains an error field', async () => {
    _setTestDockerClient({
      buildImage: async () => 'fake-stream',
      modem: {
        followProgress: (_s, cb) => cb(null, [{ error: 'invalid reference format\n' }]),
      },
    })
    await assert.rejects(
      () => buildImage({ dockerfileContent: 'FROM node:20-alpine', tag: 'myapp:latest' }),
      (err) => { assert.equal(err.code, 'docker/build-failed'); return true }
    )
  })
})

// ─── listImages ──────────────────────────────────────────────────────────────

describe('listImages — success', () => {
  it('returns a mapped array of image summaries', async () => {
    _setTestDockerClient({
      listImages: async () => [
        { Id: 'sha256:abc', RepoTags: ['myapp:latest'], Size: 100, Created: 1700000000 },
      ],
    })
    const images = await listImages()
    assert.equal(images.length, 1)
    assert.equal(images[0].id, 'sha256:abc')
    assert.deepEqual(images[0].tags, ['myapp:latest'])
  })

  it('fills tags with empty array when RepoTags is null', async () => {
    _setTestDockerClient({
      listImages: async () => [
        { Id: 'sha256:xyz', RepoTags: null, Size: 50, Created: 1700000000 },
      ],
    })
    const images = await listImages()
    assert.deepEqual(images[0].tags, [])
  })
})

// ─── removeImage ─────────────────────────────────────────────────────────────

describe('removeImage — input validation', () => {
  it('throws docker/invalid-input when imageTag is empty', async () => {
    await assert.rejects(
      () => removeImage(''),
      (err) => { assert.equal(err.code, 'docker/invalid-input'); return true }
    )
  })
})

describe('removeImage — success', () => {
  it('resolves without error on successful removal', async () => {
    _setTestDockerClient({
      getImage: () => ({ remove: async () => {} }),
    })
    await assert.doesNotReject(() => removeImage('myapp:latest'))
  })
})

// ─── runContainer ────────────────────────────────────────────────────────────

describe('runContainer — input validation', () => {
  it('throws docker/invalid-input when imageTag is missing', async () => {
    await assert.rejects(
      () => runContainer({ hostPort: 3000, containerPort: 3000 }),
      (err) => { assert.equal(err.code, 'docker/invalid-input'); return true }
    )
  })

  it('throws docker/invalid-input when ports are missing', async () => {
    await assert.rejects(
      () => runContainer({ imageTag: 'myapp:latest' }),
      (err) => { assert.equal(err.code, 'docker/invalid-input'); return true }
    )
  })
})

describe('runContainer — success', () => {
  it('returns containerId and name on success', async () => {
    _setTestDockerClient({
      createContainer: async () => ({
        start: async () => {},
        inspect: async () => ({ Id: 'abc123', Name: '/my-container' }),
      }),
    })
    const result = await runContainer({ imageTag: 'myapp:latest', hostPort: 3000, containerPort: 3000 })
    assert.equal(result.containerId, 'abc123')
    assert.equal(result.name, 'my-container')
  })
})

// ─── stopContainer ───────────────────────────────────────────────────────────

describe('stopContainer — input validation', () => {
  it('throws docker/invalid-input when containerId is empty', async () => {
    await assert.rejects(
      () => stopContainer(''),
      (err) => { assert.equal(err.code, 'docker/invalid-input'); return true }
    )
  })
})

describe('stopContainer — 304 already stopped', () => {
  it('resolves silently when container is already stopped', async () => {
    _setTestDockerClient({
      getContainer: () => ({
        stop: async () => {
          const e = new Error('already stopped')
          e.statusCode = 304
          throw e
        },
      }),
    })
    await assert.doesNotReject(() => stopContainer('abc123'))
  })
})

// ─── removeContainer ─────────────────────────────────────────────────────────

describe('removeContainer — input validation', () => {
  it('throws docker/invalid-input when containerId is empty', async () => {
    await assert.rejects(
      () => removeContainer(''),
      (err) => { assert.equal(err.code, 'docker/invalid-input'); return true }
    )
  })
})

describe('removeContainer — 404 already gone', () => {
  it('resolves silently when container is already gone', async () => {
    _setTestDockerClient({
      getContainer: () => ({
        remove: async () => {
          const e = new Error('no such container')
          e.statusCode = 404
          throw e
        },
      }),
    })
    await assert.doesNotReject(() => removeContainer('abc123'))
  })
})

// ─── getContainerLogs ────────────────────────────────────────────────────────

describe('getContainerLogs — input validation', () => {
  it('throws docker/invalid-input when containerId is empty', async () => {
    await assert.rejects(
      () => getContainerLogs(''),
      (err) => { assert.equal(err.code, 'docker/invalid-input'); return true }
    )
  })
})

describe('getContainerLogs — success', () => {
  it('strips the 8-byte Docker header and returns plain text', async () => {
    const fakeLog = '        hello world'
    _setTestDockerClient({
      getContainer: () => ({
        logs: async () => Buffer.from(fakeLog),
      }),
    })
    const logs = await getContainerLogs('abc123')
    assert.equal(logs, 'hello world')
  })
})
