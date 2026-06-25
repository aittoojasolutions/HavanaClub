import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import { PRICES } from '@/lib/prices'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, email, name, classInstanceId, role } = body
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const db = createServiceClient()

  // Get or create customer
  let { data: customer } = await db
    .from('customers')
    .select('*')
    .eq('email', email)
    .single()

  let stripeCustomerId = customer?.stripe_customer_id

  if (!stripeCustomerId) {
    const stripeCustomer = await stripe.customers.create({ email, name })
    stripeCustomerId = stripeCustomer.id
    if (customer) {
      await db.from('customers').update({ stripe_customer_id: stripeCustomerId }).eq('email', email)
    } else {
      await db.from('customers').insert({ email, name, stripe_customer_id: stripeCustomerId })
    }
  }

  const metadata: Record<string, string> = { email, name, type }
  if (classInstanceId) metadata.classInstanceId = classInstanceId
  if (role) metadata.role = role

  let session

  if (type === 'drop_in') {
    session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: PRICES.dropIn.priceId, quantity: 1 }],
      success_url: `${baseUrl}/booking-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/classes`,
      metadata,
    })
  } else if (type === 'pack_8' || type === 'pack_16' || type === 'pack_32') {
    const packMap = { pack_8: PRICES.pack8, pack_16: PRICES.pack16, pack_32: PRICES.pack32 }
    const pack = packMap[type as keyof typeof packMap]
    session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: pack.priceId, quantity: 1 }],
      success_url: `${baseUrl}/booking-success?type=pack&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      metadata: { ...metadata, classes: String(pack.classes) },
    })
  } else if (type === 'sub_1x' || type === 'sub_2x' || type === 'sub_3x') {
    const subMap = { sub_1x: PRICES.sub1x, sub_2x: PRICES.sub2x, sub_3x: PRICES.sub3x }
    const tierMap = { sub_1x: 1, sub_2x: 2, sub_3x: 3 }
    const sub = subMap[type as keyof typeof subMap]
    const tier = tierMap[type as keyof typeof tierMap]

    // Bill on the 1st of each month — anchor to next month's 1st
    const now = new Date()
    const nextFirst = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
    const billingAnchor = Math.floor(nextFirst.getTime() / 1000)

    session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{ price: sub.priceId, quantity: 1 }],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      subscription_data: {
        billing_cycle_anchor: billingAnchor,
        proration_behavior: 'create_prorations',
      } as any,
      success_url: `${baseUrl}/booking-success?type=sub&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/subscriptions`,
      metadata: { ...metadata, tier: String(tier) },
    })
  } else {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
  }

  return NextResponse.json({ url: session.url })
}
