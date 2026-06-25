import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  const db = createServiceClient()

  const { data: customer } = await db
    .from('customers')
    .select('subscription_stripe_id, subscription_tier, pack_credits_remaining, pack_expires_at, pack_credits_lapsed')
    .eq('email', email)
    .single()

  if (!customer?.subscription_stripe_id || !customer.subscription_tier) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
  }

  const sub = await stripe.subscriptions.retrieve(customer.subscription_stripe_id) as unknown as { current_period_end: number }
  const now = Math.floor(Date.now() / 1000)
  const secondsRemaining = sub.current_period_end - now
  const weeksRemaining = secondsRemaining / (7 * 24 * 60 * 60)
  const credits = Math.floor(weeksRemaining * customer.subscription_tier)

  // Cancel subscription immediately
  await stripe.subscriptions.cancel(customer.subscription_stripe_id)

  // Merge with any existing active pack credits
  const existingExpiry = customer.pack_expires_at ? new Date(customer.pack_expires_at) : null
  const packExpired = existingExpiry ? existingExpiry < new Date() : false
  const existingCredits = packExpired ? 0 : (customer.pack_credits_remaining || 0)
  const lapsed = packExpired ? (customer.pack_credits_remaining || 0) : 0
  const previousLapsed = customer.pack_credits_lapsed || 0

  // 6 months validity — longest standard pack
  const expiry = new Date()
  expiry.setMonth(expiry.getMonth() + 6)

  await db.from('customers').update({
    subscription_tier: null,
    subscription_stripe_id: null,
    pack_credits_remaining: existingCredits + credits + lapsed + previousLapsed,
    pack_expires_at: expiry.toISOString(),
    pack_credits_lapsed: 0,
  }).eq('email', email)

  return NextResponse.json({ credits, expiresAt: expiry.toISOString() })
}
