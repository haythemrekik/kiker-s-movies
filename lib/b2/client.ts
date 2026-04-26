import { S3Client } from '@aws-sdk/client-s3'

export const b2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID!,
    secretAccessKey: process.env.B2_APP_KEY!,
  },
})

export const B2_BUCKET = process.env.B2_BUCKET_NAME!
