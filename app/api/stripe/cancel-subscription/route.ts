import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

const THREE_MONTHS_MS = 90 * 24 * 60 * 60 * 1000

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  const db = createServiceClient()

  const { data: customer } = await db
    .from('customers')
    .select('stripe_customer_id, subscription_stripe_id')
    .eq('email', email)
    .single()

  if (!customer?.subscription_stripe_id) {
    return NextResponse.json({ error: 'No active subscription' }, { status: 404 })
  }

  const sub = await stripe.subscriptions.retrieve(customer.subscription_stripe_id) as unknown as { start_date: number; current_period_end: number; id: string }
  const startedAt = new Date(sub.start_date * 1000)
  const now = new Date()
  const threeMonthDate = new Date(startedAt.getTime() + THREE_MONTHS_MS)
  const pastMinimum = now >= threeMonthDate

  // If still in minimum period, cancel at the 3-month date
  // If past minimum, cancel at end of current billing period
  const cancelAt = pastMinimum
    ? Math.floor(sub.current_period_end) // end of current billing period
    : Math.floor(threeMonthDate.getTime() / 1000) // 3-month anniversary

  await stripe.subscriptions.update(customer.subscription_stripe_id, {
    cancel_at: cancelAt,
  } as Parameters<typeof stripe.subscriptions.update>[1])

  return NextResponse.json({
    cancelAt: new Date(cancelAt * 1000).toISOString(),
    pastMinimum,
    currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
  })
}
