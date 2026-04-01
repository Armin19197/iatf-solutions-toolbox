import { NextRequest, NextResponse } from 'next/server'
import { getCsrForOems, buildMatrix } from '@/modules/csr/data'
import { generateMatrixSchema } from '@/modules/csr/schemas/formSchemas'
import { isAuthenticated } from '@/lib/session/session'
import type { ProcessEntry } from '@/modules/csr/types'

/**
 * POST /api/csr/generate-matrix
 *
 * Generates the CSR matrix for the selected OEMs and process map.
 * Returns the matrix rows to the client for preview and export.
 */
export async function POST(request: NextRequest) {
  const authed = await isAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = generateMatrixSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { oems, processes, companyName, language } = parsed.data

  const csrRows = getCsrForOems(oems)
  const matrixRows = buildMatrix(csrRows, processes as ProcessEntry[])

  const matrixId = `csr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

  return NextResponse.json({
    matrixId,
    rows: matrixRows.length,
    matrixRows,
    meta: {
      oems,
      companyName: companyName ?? '',
      language,
      generatedAt: new Date().toISOString(),
    },
  })
}
