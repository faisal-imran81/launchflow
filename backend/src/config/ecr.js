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
