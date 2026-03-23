import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session/session'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const session = await getSession()
    await session.destroy()
    
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to logout' }, { status: 500 })
  }
}