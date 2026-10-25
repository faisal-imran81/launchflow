import { describe, it, afterEach } from 'node:test'
import assert from 'node:assert/strict'

const {
  createRepository,
  describeRepositories,
  deleteRepository,
  getAuthToken,
  listImages,
  deleteImage,
  _setTestEcrClient,
  _clearTestEcrClient,
} = await import('../src/services/ecrService.js')

afterEach(() => _clearTestEcrClient())

function makeClient(response) {
  return { send: async () => response }
}

function makeErrorClient(error) {
  return { send: async () => { throw error } }
}

// ─── createRepository ────────────────────────────────────────────────────────

describe('createRepository — input validation', () => {
  it('throws ecr/invalid-input when repositoryName is missing', async () => {
    await assert.rejects(
      () => createRepository({}),
      (err) => { assert.equal(err.code, 'ecr/invalid-input'); return true }
    )
  })

  it('throws ecr/invalid-input when repositoryName is not a string', async () => {
    await assert.rejects(
      () => createRepository({ repositoryName: 123 }),
      (err) => { assert.equal(err.code, 'ecr/invalid-input'); return true }
    )
  })
})

describe('createRepository — success', () => {
  it('resolves with repositoryName, repositoryUri and registryId', async () => {
    _setTestEcrClient(makeClient({
      repository: {
        repositoryName: 'myapp',
        repositoryUri: '123456789.dkr.ecr.us-east-1.amazonaws.com/myapp',
        registryId: '123456789',
      },
    }))
    const result = await createRepository({ repositoryName: 'myapp' })
    assert.equal(result.repositoryName, 'myapp')
    assert.equal(result.registryId, '123456789')
    assert.ok(result.repositoryUri.includes('myapp'))
  })
})

describe('createRepository — error mapping', () => {
  it('maps RepositoryAlreadyExistsException to ecr/already-exists', async () => {
    _setTestEcrClient(makeErrorClient({ Code: 'RepositoryAlreadyExistsException' }))
    await assert.rejects(
      () => createRepository({ repositoryName: 'myapp' }),
      (err) => { assert.equal(err.code, 'ecr/already-exists'); return true }
    )
  })
})

// ─── describeRepositories ────────────────────────────────────────────────────

describe('describeRepositories — success', () => {
  it('returns mapped array of repositories', async () => {
    _setTestEcrClient(makeClient({
      repositories: [
        {
          repositoryName: 'myapp',
          repositoryUri: '123456789.dkr.ecr.us-east-1.amazonaws.com/myapp',
          registryId: '123456789',
        },
      ],
    }))
    const repos = await describeRepositories()
    assert.equal(repos.length, 1)
    assert.equal(repos[0].repositoryName, 'myapp')
  })

  it('returns empty array when no repositories exist', async () => {
    _setTestEcrClient(makeClient({ repositories: [] }))
    const repos = await describeRepositories()
    assert.deepEqual(repos, [])
  })
})

// ─── deleteRepository ────────────────────────────────────────────────────────

describe('deleteRepository — input validation', () => {
  it('throws ecr/invalid-input when repositoryName is empty', async () => {
    await assert.rejects(
      () => deleteRepository(''),
      (err) => { assert.equal(err.code, 'ecr/invalid-input'); return true }
    )
  })
})

describe('deleteRepository — success', () => {
  it('resolves with repositoryName', async () => {
    _setTestEcrClient(makeClient({
      repository: { repositoryName: 'myapp' },
    }))
    const result = await deleteRepository('myapp')
    assert.equal(result.repositoryName, 'myapp')
  })
})

// ─── getAuthToken ────────────────────────────────────────────────────────────

describe('getAuthToken — success', () => {
  it('decodes base64 token and returns username, password and endpoint', async () => {
    const token = Buffer.from('AWS:mysecretpassword').toString('base64')
    _setTestEcrClient(makeClient({
      authorizationData: [{
        authorizationToken: token,
        proxyEndpoint: 'https://123456789.dkr.ecr.us-east-1.amazonaws.com',
        expiresAt: new Date('2026-01-01'),
      }],
    }))
    const result = await getAuthToken()
    assert.equal(result.username, 'AWS')
    assert.equal(result.password, 'mysecretpassword')
    assert.ok(result.endpoint.includes('amazonaws.com'))
  })

  it('throws ecr/no-auth-token when authorizationData is empty', async () => {
    _setTestEcrClient(makeClient({ authorizationData: [] }))
    await assert.rejects(
      () => getAuthToken(),
      (err) => { assert.equal(err.code, 'ecr/no-auth-token'); return true }
    )
  })
})

// ─── listImages ──────────────────────────────────────────────────────────────

describe('listImages — input validation', () => {
  it('throws ecr/invalid-input when repositoryName is empty', async () => {
    await assert.rejects(
      () => listImages(''),
      (err) => { assert.equal(err.code, 'ecr/invalid-input'); return true }
    )
  })
})

describe('listImages — success', () => {
  it('returns mapped array of images', async () => {
    _setTestEcrClient(makeClient({
      imageIds: [
        { imageTag: 'latest', imageDigest: 'sha256:abc123' },
        { imageDigest: 'sha256:def456' },
      ],
    }))
    const images = await listImages('myapp')
    assert.equal(images.length, 2)
    assert.equal(images[0].imageTag, 'latest')
    assert.equal(images[1].imageTag, null)
  })

  it('returns empty array when no images exist', async () => {
    _setTestEcrClient(makeClient({ imageIds: [] }))
    const images = await listImages('myapp')
    assert.deepEqual(images, [])
  })
})

// ─── deleteImage ─────────────────────────────────────────────────────────────

describe('deleteImage — input validation', () => {
  it('throws ecr/invalid-input when repositoryName is empty', async () => {
    await assert.rejects(
      () => deleteImage({ repositoryName: '', imageTag: 'latest' }),
      (err) => { assert.equal(err.code, 'ecr/invalid-input'); return true }
    )
  })

  it('throws ecr/invalid-input when both imageTag and imageDigest are missing', async () => {
    await assert.rejects(
      () => deleteImage({ repositoryName: 'myapp' }),
      (err) => { assert.equal(err.code, 'ecr/invalid-input'); return true }
    )
  })
})

describe('deleteImage — success', () => {
  it('returns deleted count', async () => {
    _setTestEcrClient(makeClient({
      imageIds: [{ imageTag: 'latest' }],
      failures: [],
    }))
    const result = await deleteImage({ repositoryName: 'myapp', imageTag: 'latest' })
    assert.equal(result.deleted, 1)
  })
})
