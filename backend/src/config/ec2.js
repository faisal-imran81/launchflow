import { EC2Client } from '@aws-sdk/client-ec2'

/**
 * Shared AWS EC2 client.
 * Reads credentials and region from environment variables:
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION
 *
 * In production, prefer IAM instance roles over explicit credentials.
 */
const ec2Client = new EC2Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export default ec2Client
