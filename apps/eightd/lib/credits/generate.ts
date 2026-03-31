import { randomBytes } from 'crypto'
import { storeCode } from '../redis/codeStore'

export async function generateCreditCodes({ toolId, planId, count, sessionId }: { toolId: string, planId?: string, count: number, sessionId: string }) {
  const codes: string[] = []
  
  for (let i = 0; i < count; i++) {
    // Generate an 8-character uppercase alphanumeric code
    const code = randomBytes(4).toString('hex').toUpperCase()
    
    // Store in Redis using the existing codeStore implementation. Now supports toolId matching.
    await storeCode(code, toolId, planId)
    
    codes.push(code)
  }
  
  return codes
}
