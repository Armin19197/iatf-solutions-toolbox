import { NextRequest, NextResponse } from 'next/server'
import { OEM_CATALOG } from '@/modules/csr/data'

/**
 * GET /api/csr/oems
 *
 * Public endpoint returning the available OEM list.
 * No auth required – used on info/selection pages.
 */
export async function GET(_request: NextRequest) {
  return NextResponse.json({ oems: OEM_CATALOG })
}
