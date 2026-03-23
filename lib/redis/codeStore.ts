import { getRedis } from './client'
import { hashCode } from '@/lib/hashing/hash'

export type CodeStatus = 'active' | 'used'

export interface StoredCode {
  status: CodeStatus
  createdAt: string
  usedAt?: string
  toolId?: string
  planId?: string
}

const KEY_PREFIX = 'code:'

function codeKey(hash: string): string {
  return `${KEY_PREFIX}${hash}`
}

export type RedeemResult = 
  | { success: true }
  | { success: false; reason: 'not_found' | 'already_used' | 'invalid_tool' }

/**
 * Atomically validates and redeems a code using a Lua script
 * to prevent the race condition where two concurrent requests
 * could both read status='active' and double-redeem the code.
 *
 * Returns:
 *  - 0: not found
 *  - 1: already used
 *  - 2: success (atomically set to 'used')
 */
const REDEEM_LUA = `
local key = KEYS[1]
local now = ARGV[1]
local expectedToolId = ARGV[2]
local raw = redis.call('GET', key)
if not raw then return 0 end
local data = cjson.decode(raw)
if data.status ~= 'active' then return 1 end
if expectedToolId ~= "" and data.toolId and data.toolId ~= "any" and data.toolId ~= expectedToolId then return 3 end
data.status = 'used'
data.usedAt = now
redis.call('SET', key, cjson.encode(data))
return 2
`

export async function redeemCode(rawCode: string, toolId?: string): Promise<RedeemResult> {
  const redis = getRedis()
  const hash = hashCode(rawCode)
  const key = codeKey(hash)
  const now = new Date().toISOString()
  const expectedToolId = toolId || ''

  const result = await redis.eval(REDEEM_LUA, [key], [now, expectedToolId]) as number

  if (result === 0) return { success: false, reason: 'not_found' }
  if (result === 1) return { success: false, reason: 'already_used' }
  if (result === 3) return { success: false, reason: 'invalid_tool' }
  return { success: true }
}

export async function storeCode(rawCode: string, toolId?: string, planId?: string, ttlSeconds = 60 * 60 * 24 * 30): Promise<void> {
  const redis = getRedis()
  const hash = hashCode(rawCode)
  const key = codeKey(hash)

  const entry: StoredCode = {
    status: 'active',
    createdAt: new Date().toISOString(),
    toolId,
    planId
  }

  await redis.set(key, entry, { ex: ttlSeconds })
}

export async function markEventProcessed(eventId: string, ttlSeconds = 60 * 60 * 24 * 7): Promise<boolean> {
  const redis = getRedis()
  // set returns 'OK' if the key was set (meaning it's new), or null if it already existed
  const result = await redis.set(`webhook_event:${eventId}`, 'processed', { nx: true, ex: ttlSeconds })
  return result !== null
}
