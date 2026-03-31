import { NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/session/session'

export async function GET() {
  try {
    const authenticated = await isAuthenticated()
    return NextResponse.json({ authenticated })
  } catch {
    return NextResponse.json({ authenticated: false })
  }
}