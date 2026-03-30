import { Redis } from '@upstash/redis'

let redisInstance: Redis | null = null

/**
 * Lazy initialization of Redis client.
 * Ensures environment variables are available and creates the instance only once.
 */
export function getRedis(): Redis {
  if (!redisInstance) {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('Missing Upstash Redis environment variables: KV_REST_API_URL, KV_REST_API_TOKEN')
    }
    
    redisInstance = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    })
  }
  
  return redisInstance
}

// Re-export function only — no eager initialisation at module scope.
// Callers should use getRedis() directly to avoid import-time crashes
// when Redis environment variables are not configured.
