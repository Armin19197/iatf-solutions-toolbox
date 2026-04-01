import { getIronSession, IronSession, SessionOptions } from 'iron-session'
import { cookies } from 'next/headers'

export interface SessionData {
  isAuthenticated: boolean
  issuedAt?: number
}

// Spec: 24h session cookie (86400s). Override via SESSION_TTL_SECONDS env var.
const SESSION_TTL_SECONDS = parseInt(process.env.SESSION_TTL_SECONDS || '86400', 10)

function getSessionPassword(): string {
  const secret = process.env.SESSION_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET must be set and at least 32 characters long. ' +
      'Generate one with: openssl rand -base64 32',
    )
  }
  return secret
}

/**
 * Lazily build sessionOptions so getSessionPassword() is only called at
 * request time — NOT at module-load / build time.  This prevents the build
 * from throwing when SESSION_SECRET is absent in the CI/Netlify environment.
 */
function getSessionOptions(): SessionOptions {
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    password: getSessionPassword(),
    cookieName: 'iatf-session',
    cookieOptions: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: SESSION_TTL_SECONDS,
      // Allow cookies to work across subdomains in production
      domain: isProduction ? '.iatf-solutions.com' : undefined,
    },
  }
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, getSessionOptions())
}

export async function requireSession(): Promise<SessionData> {
  const session = await getSession()

  if (!session.isAuthenticated) {
    throw new Error('Unauthorized')
  }

  // Check session expiry
  if (session.issuedAt && Date.now() - session.issuedAt > SESSION_TTL_SECONDS * 1000) {
    await session.destroy()
    throw new Error('Session expired')
  }

  return session
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const session = await getSession()
    
    if (!session.isAuthenticated) {
      return false
    }

    // Check session expiry
    if (session.issuedAt && Date.now() - session.issuedAt > SESSION_TTL_SECONDS * 1000) {
      await session.destroy()
      return false
    }

    return true
  } catch {
    return false
  }
}
