import { describe, it, afterEach } from 'node:test'
import assert from 'node:assert/strict'

const {
  launchInstance,
  describeInstance,
  stopInstance,
  startInstance,
  terminateInstance,
  listInstances,
  _setTestEc2Client,
  _clearTestEc2Client,
} = await import('../src/services/ec2Service.js')

afterEach(() => _clearTestEc2Client())

// Helper — builds a fake EC2 client whose send() returns the given response
function makeClient(response) {
  return { send: async () => response }
}

// Helper — builds a fake EC2 client whose send() throws the given error
function makeErrorClient(error) {
  return { send: async () => { throw error } }
}

// ─── launchInstance ──────────────────────────────────────────────────────────

describe('launchInstance — input validation', () => {
  it('throws ec2/invalid-input when name is missing', async () => {
    await assert.rejects(
      () => launchInstance({}),
      (err) => { assert.equal(err.code, 'ec2/invalid-input'); return true }
    )
  })

  it('throws ec2/invalid-input when name is not a string', async () => {
    await assert.rejects(
      () => launchInstance({ name: 123 }),
      (err) => { assert.equal(err.code, 'ec2/invalid-input'); return true }
    )
  })
})

describe('launchInstance — success', () => {
  it('resolves with instanceId and state', async () => {
    _setTestEc2Client(makeClient({
      Instances: [{ InstanceId: 'i-0abc123', State: { Name: 'pending' } }],
    }))
    const result = await launchInstance({ name: 'test-instance' })
    assert.equal(result.instanceId, 'i-0abc123')
    assert.equal(result.state, 'pending')
  })
})

describe('launchInstance — error mapping', () => {
  it('maps AWS error through toEc2Error', async () => {
    _setTestEc2Client(makeErrorClient({ Code: 'InstanceLimitExceeded' }))
    await assert.rejects(
      () => launchInstance({ name: 'test-instance' }),
      (err) => { assert.equal(err.code, 'ec2/limit-exceeded'); return true }
    )
  })
})

// ─── describeInstance ────────────────────────────────────────────────────────

describe('describeInstance — input validation', () => {
  it('throws ec2/invalid-input when instanceId is empty', async () => {
    await assert.rejects(
      () => describeInstance(''),
      (err) => { assert.equal(err.code, 'ec2/invalid-input'); return true }
    )
  })
})

describe('describeInstance — success', () => {
  it('returns instanceId, state, publicIp and publicDns', async () => {
    _setTestEc2Client(makeClient({
      Reservations: [{
        Instances: [{
          InstanceId: 'i-0abc123',
          State: { Name: 'running' },
          PublicIpAddress: '54.0.0.1',
          PublicDnsName: 'ec2-54-0-0-1.compute-1.amazonaws.com',
        }],
      }],
    }))
    const result = await describeInstance('i-0abc123')
    assert.equal(result.instanceId, 'i-0abc123')
    assert.equal(result.state, 'running')
    assert.equal(result.publicIp, '54.0.0.1')
    assert.equal(result.publicDns, 'ec2-54-0-0-1.compute-1.amazonaws.com')
  })

  it('returns null publicIp when instance has no public IP', async () => {
    _setTestEc2Client(makeClient({
      Reservations: [{
        Instances: [{
          InstanceId: 'i-0abc123',
          State: { Name: 'stopped' },
        }],
      }],
    }))
    const result = await describeInstance('i-0abc123')
    assert.equal(result.publicIp, null)
    assert.equal(result.publicDns, null)
  })

  it('throws ec2/not-found when Reservations is empty', async () => {
    _setTestEc2Client(makeClient({ Reservations: [] }))
    await assert.rejects(
      () => describeInstance('i-0abc123'),
      (err) => { assert.equal(err.code, 'ec2/not-found'); return true }
    )
  })
})

// ─── stopInstance ────────────────────────────────────────────────────────────

describe('stopInstance — input validation', () => {
  it('throws ec2/invalid-input when instanceId is empty', async () => {
    await assert.rejects(
      () => stopInstance(''),
      (err) => { assert.equal(err.code, 'ec2/invalid-input'); return true }
    )
  })
})

describe('stopInstance — success', () => {
  it('returns instanceId and state', async () => {
    _setTestEc2Client(makeClient({
      StoppingInstances: [{ InstanceId: 'i-0abc123', CurrentState: { Name: 'stopping' } }],
    }))
    const result = await stopInstance('i-0abc123')
    assert.equal(result.instanceId, 'i-0abc123')
    assert.equal(result.state, 'stopping')
  })
})

// ─── startInstance ───────────────────────────────────────────────────────────

describe('startInstance — input validation', () => {
  it('throws ec2/invalid-input when instanceId is empty', async () => {
    await assert.rejects(
      () => startInstance(''),
      (err) => { assert.equal(err.code, 'ec2/invalid-input'); return true }
    )
  })
})

describe('startInstance — success', () => {
  it('returns instanceId and state', async () => {
    _setTestEc2Client(makeClient({
      StartingInstances: [{ InstanceId: 'i-0abc123', CurrentState: { Name: 'pending' } }],
    }))
    const result = await startInstance('i-0abc123')
    assert.equal(result.instanceId, 'i-0abc123')
    assert.equal(result.state, 'pending')
  })
})

// ─── terminateInstance ───────────────────────────────────────────────────────

describe('terminateInstance — input validation', () => {
  it('throws ec2/invalid-input when instanceId is empty', async () => {
    await assert.rejects(
      () => terminateInstance(''),
      (err) => { assert.equal(err.code, 'ec2/invalid-input'); return true }
    )
  })
})

describe('terminateInstance — success', () => {
  it('returns instanceId and state', async () => {
    _setTestEc2Client(makeClient({
      TerminatingInstances: [{ InstanceId: 'i-0abc123', CurrentState: { Name: 'shutting-down' } }],
    }))
    const result = await terminateInstance('i-0abc123')
    assert.equal(result.instanceId, 'i-0abc123')
    assert.equal(result.state, 'shutting-down')
  })
})

// ─── listInstances ───────────────────────────────────────────────────────────

describe('listInstances — success', () => {
  it('returns mapped array of instances', async () => {
    _setTestEc2Client(makeClient({
      Reservations: [{
        Instances: [{
          InstanceId: 'i-0abc123',
          State: { Name: 'running' },
          PublicIpAddress: '54.0.0.1',
          Tags: [
            { Key: 'Name', Value: 'my-app' },
            { Key: 'ManagedBy', Value: 'LaunchFlow' },
          ],
        }],
      }],
    }))
    const instances = await listInstances()
    assert.equal(instances.length, 1)
    assert.equal(instances[0].instanceId, 'i-0abc123')
    assert.equal(instances[0].name, 'my-app')
    assert.equal(instances[0].state, 'running')
    assert.equal(instances[0].publicIp, '54.0.0.1')
  })

  it('returns empty array when no LaunchFlow instances exist', async () => {
    _setTestEc2Client(makeClient({ Reservations: [] }))
    const instances = await listInstances()
    assert.deepEqual(instances, [])
  })

  it('uses "unnamed" when Name tag is missing', async () => {
    _setTestEc2Client(makeClient({
      Reservations: [{
        Instances: [{
          InstanceId: 'i-0xyz',
          State: { Name: 'stopped' },
          Tags: [{ Key: 'ManagedBy', Value: 'LaunchFlow' }],
        }],
      }],
    }))
    const instances = await listInstances()
    assert.equal(instances[0].name, 'unnamed')
  })
})
