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
