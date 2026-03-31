import { NextRequest, NextResponse } from 'next/server'
import { requireBillingAdmin } from '@/lib/billing/adminAuth'
import { deleteBillingPlan, listBillingPlans, upsertBillingPlan } from '@/lib/billing/store'

export async function GET(request: NextRequest) {
  try {
    const toolId = request.nextUrl.searchParams.get('toolId')
    const activeOnly = request.nextUrl.searchParams.get('activeOnly') === 'true'
    const plans = await listBillingPlans()

    const filtered = plans.filter((plan) => {
      if (toolId && plan.toolId !== toolId) {
        return false
      }
      if (activeOnly && !plan.active) {
        return false
      }
      return true
    })

    return NextResponse.json({ plans: filtered })
  } catch (error) {
    console.error('[billing/plans][GET]', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireBillingAdmin(request)
  if (unauthorized) {
    return unauthorized
  }

  try {
    const body = await request.json()
    const name = String(body?.name || '').trim()
    const stripePriceId = String(body?.stripePriceId || '').trim()
    const toolId = String(body?.toolId || '').trim()

    if (!name || !stripePriceId || !toolId) {
      return NextResponse.json({ error: 'name, stripePriceId, and toolId are required' }, { status: 400 })
    }

    const plan = await upsertBillingPlan({
      id: body?.id,
      name,
      description: body?.description,
      toolId,
      stripePriceId,
      unitAmount: Number(body?.unitAmount || 0),
      currency: body?.currency || 'usd',
      creditCount: Number(body?.creditCount || 1),
      interval: body?.interval || 'one_time',
      active: typeof body?.active === 'boolean' ? body.active : true,
    })

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('[billing/plans][POST]', error)
    return NextResponse.json({ error: 'Failed to create or update plan' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  return POST(request)
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireBillingAdmin(request)
  if (unauthorized) {
    return unauthorized
  }

  try {
    const idFromQuery = request.nextUrl.searchParams.get('id')
    const body = await request.json().catch(() => ({}))
    const id = String(idFromQuery || body?.id || '').trim()

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const deleted = await deleteBillingPlan(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[billing/plans][DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete plan' }, { status: 500 })
  }
}
