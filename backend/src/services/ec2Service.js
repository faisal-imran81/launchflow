/**
 * @module ec2Service
 *
 * High-level AWS EC2 operations built on top of @aws-sdk/client-ec2.
 * All functions use the shared client in src/config/ec2.js and throw
 * standardised errors from src/utils/ec2Errors.js.
 *
 * Exported functions:
 *  - launchInstance     — launch a new EC2 instance
 *  - describeInstance   — get instance status, IP and DNS
 *  - stopInstance       — stop a running instance
 *  - startInstance      — start a stopped instance
 *  - terminateInstance  — permanently terminate an instance
 *  - listInstances      — list all LaunchFlow-tagged instances
 *
 * @requires @aws-sdk/client-ec2
 */

import { RunInstancesCommand, DescribeInstancesCommand, StopInstancesCommand, StartInstancesCommand, TerminateInstancesCommand } from '@aws-sdk/client-ec2'
import ec2Client from '../config/ec2.js'
import { toEc2Error } from '../utils/ec2Errors.js'

// Default AMI — Amazon Linux 2023 (us-east-1)
const DEFAULT_AMI = 'ami-0c02fb55956c7d316'
const DEFAULT_INSTANCE_TYPE = 't2.micro'

// Test-only injection hook
let _testEc2Client = null
export const _setTestEc2Client = (c) => { _testEc2Client = c }
export const _clearTestEc2Client = () => { _testEc2Client = null }
const getClient = () => _testEc2Client ?? ec2Client

/**
 * Launches a new EC2 instance tagged with LaunchFlow metadata.
 *
 * @param {object} options
 * @param {string} options.name            - Instance name tag
 * @param {string} [options.ami]           - AMI ID (defaults to Amazon Linux 2023)
 * @param {string} [options.instanceType]  - Instance type (defaults to t2.micro)
 * @param {string} [options.keyPairName]   - EC2 key pair name for SSH access
 * @param {string} [options.securityGroupId] - Security group ID
 * @returns {Promise<{ instanceId: string, state: string }>}
 */
export async function launchInstance({
  name,
  ami = DEFAULT_AMI,
  instanceType = DEFAULT_INSTANCE_TYPE,
  keyPairName = process.env.AWS_KEY_PAIR_NAME,
  securityGroupId = process.env.AWS_SECURITY_GROUP_ID,
} = {}) {
  if (!name || typeof name !== 'string') {
    const err = new Error('name is required and must be a string')
    err.status = 400
    err.code = 'ec2/invalid-input'
    throw err
  }

  const command = new RunInstancesCommand({
    ImageId: ami,
    InstanceType: instanceType,
    MinCount: 1,
    MaxCount: 1,
    ...(keyPairName ? { KeyName: keyPairName } : {}),
    ...(securityGroupId ? { SecurityGroupIds: [securityGroupId] } : {}),
    TagSpecifications: [
      {
        ResourceType: 'instance',
        Tags: [
          { Key: 'Name', Value: name },
          { Key: 'ManagedBy', Value: 'LaunchFlow' },
        ],
      },
    ],
  })

  try {
    const response = await getClient().send(command)
    const instance = response.Instances?.[0]
    return {
      instanceId: instance.InstanceId,
      state: instance.State?.Name ?? 'pending',
    }
  } catch (error) {
    throw toEc2Error(error)
  }
}

/**
 * Describes a single EC2 instance — returns state, public IP and public DNS.
 *
 * @param {string} instanceId - EC2 instance ID e.g. "i-0abc123def456"
 * @returns {Promise<{ instanceId: string, state: string, publicIp: string|null, publicDns: string|null }>}
 */
export async function describeInstance(instanceId) {
  if (!instanceId || typeof instanceId !== 'string') {
    const err = new Error('instanceId is required and must be a string')
    err.status = 400
    err.code = 'ec2/invalid-input'
    throw err
  }

  const command = new DescribeInstancesCommand({
    InstanceIds: [instanceId],
  })

  try {
    const response = await getClient().send(command)
    const instance = response.Reservations?.[0]?.Instances?.[0]

    if (!instance) {
      const err = new Error(`Instance ${instanceId} not found.`)
      err.status = 404
      err.code = 'ec2/not-found'
      err.isEc2Error = true
      throw err
    }

    return {
      instanceId: instance.InstanceId,
      state: instance.State?.Name ?? 'unknown',
      publicIp: instance.PublicIpAddress ?? null,
      publicDns: instance.PublicDnsName ?? null,
    }
  } catch (error) {
    if (error?.isEc2Error) throw error
    throw toEc2Error(error)
  }
}

/**
 * Stops a running EC2 instance.
 *
 * @param {string} instanceId - EC2 instance ID e.g. "i-0abc123def456"
 * @returns {Promise<{ instanceId: string, state: string }>}
 */
export async function stopInstance(instanceId) {
  if (!instanceId || typeof instanceId !== 'string') {
    const err = new Error('instanceId is required and must be a string')
    err.status = 400
    err.code = 'ec2/invalid-input'
    throw err
  }

  const command = new StopInstancesCommand({ InstanceIds: [instanceId] })

  try {
    const response = await getClient().send(command)
    const instance = response.StoppingInstances?.[0]
    return {
      instanceId: instance.InstanceId,
      state: instance.CurrentState?.Name ?? 'stopping',
    }
  } catch (error) {
    throw toEc2Error(error)
  }
}

/**
 * Starts a stopped EC2 instance.
 *
 * @param {string} instanceId - EC2 instance ID e.g. "i-0abc123def456"
 * @returns {Promise<{ instanceId: string, state: string }>}
 */
export async function startInstance(instanceId) {
  if (!instanceId || typeof instanceId !== 'string') {
    const err = new Error('instanceId is required and must be a string')
    err.status = 400
    err.code = 'ec2/invalid-input'
    throw err
  }

  const command = new StartInstancesCommand({ InstanceIds: [instanceId] })

  try {
    const response = await getClient().send(command)
    const instance = response.StartingInstances?.[0]
    return {
      instanceId: instance.InstanceId,
      state: instance.CurrentState?.Name ?? 'pending',
    }
  } catch (error) {
    throw toEc2Error(error)
  }
}

/**
 * Permanently terminates an EC2 instance.
 * This action is irreversible — the instance and its root volume are deleted.
 *
 * @param {string} instanceId - EC2 instance ID e.g. "i-0abc123def456"
 * @returns {Promise<{ instanceId: string, state: string }>}
 */
export async function terminateInstance(instanceId) {
  if (!instanceId || typeof instanceId !== 'string') {
    const err = new Error('instanceId is required and must be a string')
    err.status = 400
    err.code = 'ec2/invalid-input'
    throw err
  }

  const command = new TerminateInstancesCommand({ InstanceIds: [instanceId] })

  try {
    const response = await getClient().send(command)
    const instance = response.TerminatingInstances?.[0]
    return {
      instanceId: instance.InstanceId,
      state: instance.CurrentState?.Name ?? 'shutting-down',
    }
  } catch (error) {
    throw toEc2Error(error)
  }
}
