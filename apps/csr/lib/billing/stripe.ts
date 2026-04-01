import Stripe from 'stripe'
import { getStripeConfig } from './store'

const DEFAULT_STRIPE_API_VERSION = '2024-12-18.acacia'

export interface BillingInlinePriceData {
  unitAmount: number
  currency: string
  productName: string
}

export interface CreateBillingCheckoutSessionInput {
  priceId?: string
  toolId: string
  planId?: string
  creditCount: number
  userEmail?: string
  successUrl: string
  cancelUrl: string
  inlinePriceData?: BillingInlinePriceData
}

function toApiVersion(version?: string): Stripe.LatestApiVersion {
  return (version || DEFAULT_STRIPE_API_VERSION) as Stripe.LatestApiVersion
}

export async function getStripeClient(): Promise<{ stripe: Stripe; config: Awaited<ReturnType<typeof getStripeConfig>> }> {
  const config = await getStripeConfig()
  const secretKey = config.secretKey || process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('Stripe secret key is not configured')
  }

  const stripe = new Stripe(secretKey, {
    apiVersion: toApiVersion(config.apiVersion),
  })

  return { stripe, config }
}

export async function createBillingCheckoutSession(input: CreateBillingCheckoutSessionInput): Promise<Stripe.Checkout.Session> {
  const { stripe } = await getStripeClient()

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = input.priceId
    ? [{ price: input.priceId, quantity: 1 }]
    : input.inlinePriceData
      ? [
          {
            quantity: 1,
            price_data: {
              currency: input.inlinePriceData.currency,
              unit_amount: input.inlinePriceData.unitAmount,
              product_data: {
                name: input.inlinePriceData.productName,
              },
            },
          },
        ]
      : []

  if (lineItems.length === 0) {
    throw new Error('No Stripe price or inline price data was provided for checkout session')
  }

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    customer_email: input.userEmail,
    automatic_tax: { enabled: false },
    invoice_creation: { enabled: false },
    billing_address_collection: 'required',
    metadata: {
      toolId: input.toolId,
      planId: input.planId || '',
      priceId: input.priceId || '',
      creditCount: String(input.creditCount),
    },
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
  })
}
