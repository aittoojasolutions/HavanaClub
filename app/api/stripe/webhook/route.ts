import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = createServiceClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const meta = session.metadata || {}

    if (session.mode === 'payment') {
      if (meta.type === 'drop_in' && meta.classInstanceId) {
        // Create the booking
        await db.from('bookings').insert({
          customer_email: meta.email,
          customer_name: meta.name,
          class_instance_id: meta.classInstanceId,
          role: meta.role || 'general',
          booking_type: 'drop_in',
          stripe_session_id: session.id,
        })
        // Increment spot
        const spotField = meta.role === 'leader' ? 'leader_spots_taken'
          : meta.role === 'follower' ? 'follower_spots_taken'
          : 'general_spots_taken'
        await db.from('class_instances')
          .update({ [spotField]: db.rpc('increment_spot') })
          .eq('id', meta.classInstanceId)
      } else if (meta.classes) {
        // Class pack — add credits with expiry handling
        const newCredits = parseInt(meta.classes)
        const validityMonths: Record<number, number> = { 8: 2, 16: 3, 32: 6 }
        const months = validityMonths[newCredits] ?? 2

        const { data: existing } = await db
          .from('customers')
          .select('pack_credits_remaining, pack_expires_at, pack_credits_lapsed')
          .eq('email', meta.email).single()

        const now = new Date()
        const currentExpiry = existing?.pack_expires_at ? new Date(existing.pack_expires_at) : null
        const isExpired = currentExpiry ? currentExpiry < now : false
        const activeCredits = isExpired ? 0 : (existing?.pack_credits_remaining || 0)
        const lapsedFromExpiry = isExpired ? (existing?.pack_credits_remaining || 0) : 0
        const previousLapsed = existing?.pack_credits_lapsed || 0
        const totalLapsed = lapsedFromExpiry + previousLapsed

        const newExpiry = new Date()
        newExpiry.setMonth(newExpiry.getMonth() + months)

        await db.from('customers').upsert({
          email: meta.email,
          name: meta.name,
          pack_credits_remaining: activeCredits + newCredits + totalLapsed,
          pack_expires_at: newExpiry.toISOString(),
          pack_credits_lapsed: 0,
        })
      }
    } else if (session.mode === 'subscription' && meta.tier) {
      await db.from('customers').upsert({
        email: meta.email,
        name: meta.name,
        subscription_tier: parseInt(meta.tier),
        subscription_stripe_id: session.subscription as string,
      })
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await db.from('customers')
      .update({ subscription_tier: null, subscription_stripe_id: null })
      .eq('subscription_stripe_id', sub.id)
  }

  if (event.type === 'invoice.payment_failed') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const invoice = event.data.object as any
    const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id
    if (subId) {
      await db.from('customers')
        .update({ subscription_tier: null })
        .eq('subscription_stripe_id', subId)
    }
  }

  return NextResponse.json({ received: true })
}
