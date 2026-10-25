/**
 * @module ecr
 *
 * Shared AWS ECR (Elastic Container Registry) client.
 * Instantiated once and reused across all ecrService calls.
 *
 * Configuration is read from environment variables:
 *   AWS_ACCESS_KEY_ID     — AWS access key
 *   AWS_SECRET_ACCESS_KEY — AWS secret key
 *   AWS_ECR_REGION        — AWS region (defaults to us-east-1)
 *
 * In production, prefer IAM instance roles attached to the EC2 instance
 * over explicit credentials so no secrets are stored on disk.
 *
 * @requires @aws-sdk/client-ecr
 */
import { ECRClient } from '@aws-sdk/client-ecr'

/**
 * Shared AWS ECR client.
 * Reads credentials and region from environment variables:
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ECR_REGION
 *
 * In production, prefer IAM instance roles over explicit credentials.
 */
const ecrClient = new ECRClient({
  region: process.env.AWS_ECR_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export default ecrClient
