import { Redis } from '@upstash/redis'

function createRedisClient(): Redis | null {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) {
    if (process.env.NODE_ENV === 'production') {
      console.warn('Missing Upstash Redis environment variables: KV_REST_API_URL, KV_REST_API_TOKEN')
    }
    return null
  }
  return new Redis({ url, token })
}

export const redis = createRedisClient()

export function getRedis(): Redis {
  if (!redis) {
    throw new Error('Missing Upstash Redis environment variables: KV_REST_API_URL, KV_REST_API_TOKEN')
  }
  return redis
}
