import { S3Client } from '@aws-sdk/client-s3'

const endpointUrl = process.env.B2_ENDPOINT || 's3.us-east-005.backblazeb2.com'
const region = endpointUrl.split('.')[1] || 'us-east-005'

export const b2Client = new S3Client({
  region,
  endpoint: `https://${endpointUrl}`,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
})

export const B2_BUCKET = process.env.B2_BUCKET_NAME!
