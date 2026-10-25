/**
 * @module ecrService
 *
 * High-level AWS ECR operations built on top of @aws-sdk/client-ecr.
 * All functions use the shared client in src/config/ecr.js and throw
 * standardised errors from src/utils/ecrErrors.js.
 *
 * Exported functions:
 *  - createRepository     — create a new ECR repository
 *  - describeRepositories — list all ECR repositories
 *  - deleteRepository     — delete an ECR repository
 *  - getAuthToken         — fetch ECR auth token for docker login
 *  - pushImageToEcr       — tag and push a local image to ECR
 *  - listImages           — list images in a repository
 *  - deleteImage          — delete an image from a repository
 *
 * @requires @aws-sdk/client-ecr
 */

import { CreateRepositoryCommand, DescribeRepositoriesCommand, DeleteRepositoryCommand, GetAuthorizationTokenCommand } from '@aws-sdk/client-ecr'
import ecrClient from '../config/ecr.js'
import docker from '../config/docker.js'
import { toEcrError } from '../utils/ecrErrors.js'

// Test-only injection hook
let _testEcrClient = null
export const _setTestEcrClient = (c) => { _testEcrClient = c }
export const _clearTestEcrClient = () => { _testEcrClient = null }
const getClient = () => _testEcrClient ?? ecrClient

/**
 * Creates a new ECR repository.
 *
 * @param {object} options
 * @param {string} options.repositoryName - Name of the ECR repository
 * @returns {Promise<{ repositoryName: string, repositoryUri: string, registryId: string }>}
 */
export async function createRepository({ repositoryName } = {}) {
  if (!repositoryName || typeof repositoryName !== 'string') {
    const err = new Error('repositoryName is required and must be a string')
    err.status = 400
    err.code = 'ecr/invalid-input'
    throw err
  }

  const command = new CreateRepositoryCommand({
    repositoryName,
    imageScanningConfiguration: { scanOnPush: true },
    imageTagMutability: 'MUTABLE',
  })

  try {
    const response = await getClient().send(command)
    const repo = response.repository
    return {
      repositoryName: repo.repositoryName,
      repositoryUri: repo.repositoryUri,
      registryId: repo.registryId,
    }
  } catch (error) {
    throw toEcrError(error)
  }
}

/**
 * Lists all ECR repositories in the account.
 *
 * @returns {Promise<Array<{ repositoryName: string, repositoryUri: string, registryId: string }>>}
 */
export async function describeRepositories() {
  const command = new DescribeRepositoriesCommand({})

  try {
    const response = await getClient().send(command)
    return (response.repositories ?? []).map((repo) => ({
      repositoryName: repo.repositoryName,
      repositoryUri: repo.repositoryUri,
      registryId: repo.registryId,
    }))
  } catch (error) {
    throw toEcrError(error)
  }
}

/**
 * Deletes an ECR repository and all images inside it.
 *
 * @param {string} repositoryName - Name of the ECR repository to delete
 * @returns {Promise<{ repositoryName: string }>}
 */
export async function deleteRepository(repositoryName) {
  if (!repositoryName || typeof repositoryName !== 'string') {
    const err = new Error('repositoryName is required and must be a string')
    err.status = 400
    err.code = 'ecr/invalid-input'
    throw err
  }

  const command = new DeleteRepositoryCommand({
    repositoryName,
    force: true,
  })

  try {
    const response = await getClient().send(command)
    return { repositoryName: response.repository.repositoryName }
  } catch (error) {
    throw toEcrError(error)
  }
}

/**
 * Fetches an ECR authorization token for docker login.
 * The token is base64-encoded and valid for 12 hours.
 *
 * @returns {Promise<{ username: string, password: string, endpoint: string, expiresAt: Date }>}
 */
export async function getAuthToken() {
  const command = new GetAuthorizationTokenCommand({})

  try {
    const response = await getClient().send(command)
    const authData = response.authorizationData?.[0]

    if (!authData?.authorizationToken) {
      const err = new Error('ECR did not return an authorization token.')
      err.status = 502
      err.code = 'ecr/no-auth-token'
      err.isEcrError = true
      throw err
    }

    const decoded = Buffer.from(authData.authorizationToken, 'base64').toString('utf8')
    const [username, password] = decoded.split(':')

    return {
      username,
      password,
      endpoint: authData.proxyEndpoint,
      expiresAt: authData.expiresAt,
    }
  } catch (error) {
    if (error?.isEcrError) throw error
    throw toEcrError(error)
  }
}

/**
 * Tags a local Docker image and pushes it to AWS ECR.
 * Fetches an ECR auth token automatically before pushing.
 *
 * @param {object} options
 * @param {string} options.localTag    - Local image tag e.g. "myapp:latest"
 * @param {string} options.repositoryUri - Full ECR repository URI e.g. "123456789.dkr.ecr.us-east-1.amazonaws.com/myapp"
 * @param {string} [options.imageTag]  - Tag to push e.g. "latest" (defaults to "latest")
 * @returns {Promise<{ pushedUri: string }>}
 */
export async function pushImageToEcr({ localTag, repositoryUri, imageTag = 'latest' } = {}) {
  if (!localTag || typeof localTag !== 'string') {
    const err = new Error('localTag is required and must be a string')
    err.status = 400
    err.code = 'ecr/invalid-input'
    throw err
  }

  if (!repositoryUri || typeof repositoryUri !== 'string') {
    const err = new Error('repositoryUri is required and must be a string')
    err.status = 400
    err.code = 'ecr/invalid-input'
    throw err
  }

  // 1 — fetch ECR auth token
  const { username, password, endpoint } = await getAuthToken()

  // 2 — tag the local image with the ECR URI
  const pushedUri = `${repositoryUri}:${imageTag}`

  try {
    const image = docker.getImage(localTag)
    await image.tag({ repo: repositoryUri, tag: imageTag })
  } catch (error) {
    const err = new Error(`Failed to tag image "${localTag}": ${error.message}`)
    err.status = 422
    err.code = 'ecr/tag-failed'
    err.isEcrError = true
    throw err
  }

  // 3 — push the tagged image to ECR
  try {
    const pushStream = await docker.getImage(pushedUri).push({
      authconfig: {
        username,
        password,
        serveraddress: endpoint,
      },
    })

    await new Promise((resolve, reject) => {
      docker.modem.followProgress(pushStream, (err, output) => {
        if (err) return reject(err)
        const lastMessage = output?.[output.length - 1]
        if (lastMessage?.error) {
          const pushErr = new Error(lastMessage.error.trim())
          pushErr.status = 422
          pushErr.code = 'ecr/push-failed'
          pushErr.isEcrError = true
          return reject(pushErr)
        }
        resolve()
      })
    })

    return { pushedUri }
  } catch (error) {
    if (error?.isEcrError) throw error
    const err = new Error(`Failed to push image to ECR: ${error.message}`)
    err.status = 502
    err.code = 'ecr/push-failed'
    err.isEcrError = true
    throw err
  }
}
