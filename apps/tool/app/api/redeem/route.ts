import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

import { checkRateLimit } from '@/lib/rate-limit/rateLimit'
import { redeemCode, type RedeemResult } from '@/lib/redis/codeStore'
import { getSession } from '@/lib/session/session'
import { redeemSchema } from '@/modules/eightd/schemas/formSchemas'

export async function POST(request: NextRequest) {
  // 1. Rate limit check
  const allowed = await checkRateLimit(request)
  if (!allowed) {
    return NextResponse.json({ success: false, error: 'Too many attempts. Please wait.' }, { status: 429 })
  }

  // 2. Parse and validate request body
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = redeemSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? 'Invalid code format' },
      { status: 400 }
    )
  }

  const { code } = parsed.data

  // Optional toolId from body, fallback to 'tool_8d' for backward compatibility
  const extractedToolId = (body as any)?.toolId || 'tool_8d'

  // 3. Atomically validate and redeem code
  let result: RedeemResult
  try {
    result = await redeemCode(code, extractedToolId)
  } catch (err) {
    console.error('[redeem] Redis error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ success: false, error: 'Service unavailable. Please try again.' }, { status: 503 })
  }

  if (!result.success) {
    let errorMessage = 'Invalid access code'
    if (result.reason === 'already_used') errorMessage = 'This access code has already been used'
    if (result.reason === 'invalid_tool') errorMessage = 'Code not valid for this tool'
      
    return NextResponse.json({ success: false, error: errorMessage }, { status: 401 })
  }

  // 4. Issue 24h session cookie
  try {
    const session = await getSession()
    session.isAuthenticated = true
    session.issuedAt = Date.now()
    await session.save()
  } catch (err) {
    console.error('[redeem] Session error:', err instanceof Error ? err.message : err)
    return NextResponse.json({ success: false, error: 'Failed to create session' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

