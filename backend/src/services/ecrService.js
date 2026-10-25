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

import { CreateRepositoryCommand } from '@aws-sdk/client-ecr'
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
