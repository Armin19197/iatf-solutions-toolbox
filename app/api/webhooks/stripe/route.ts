import Stripe from 'stripe'
import { generateCreditCodes } from '@/lib/credits/generate'
import { sendCreditDeliveryEmail } from '@/lib/email/sendCredit'
import { NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/billing/stripe'
import { getStripeConfig } from '@/lib/billing/store'
import { markEventProcessed } from '@/lib/redis/codeStore'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    const { stripe } = await getStripeClient()
    const stripeConfig = await getStripeConfig()
    const webhookSecret = stripeConfig.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET

    if (!webhookSecret) {
      throw new Error('Stripe webhook secret is not configured')
    }

    event = stripe.webhooks.constructEvent(
      body, 
      signature, 
      webhookSecret
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  console.log(`[Webhook] Received Stripe event: ${event.type}`)

  if (event.type === 'checkout.session.completed') {
    // Idempotency: skip already-processed events
    const isNewEvent = await markEventProcessed(event.id)
    if (!isNewEvent) {
      console.log(`[Webhook] Event ${event.id} already processed. Skipping.`)
      return new NextResponse('Already processed', { status: 200 })
    }

    const session = event.data.object as Stripe.Checkout.Session
    
    const email = session.customer_details?.email || session.customer_email
    const metadata = session.metadata || {}
    const count = parseInt(metadata.creditCount || '1', 10)
    const toolId = metadata.toolId || 'tool_8d'
    const planId = metadata.planId || undefined

    if (!email) {
      console.error('No email found in session, cannot send code.')
      return new NextResponse('OK', { status: 200 })
    }

    try {
      // 1. Generate an 8 character uppercase alphanumeric code, store in Redis
      const codes = await generateCreditCodes({ toolId, planId, count, sessionId: session.id })
      
      // 2. Send email to the customer
      await sendCreditDeliveryEmail({ to: email, toolId, codes })
      
      console.log(`[Webhook] Processed purchase. Generated ${codes.length} code(s) for ${email}.`)
    } catch (err: any) {
      console.error('[Webhook] Failed to generate codes or send email:', err)
      return new NextResponse('Internal Server Error', { status: 500 })
    }
  }

  return new NextResponse('OK', { status: 200 })
}
