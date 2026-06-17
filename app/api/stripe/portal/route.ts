import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  const db = createServiceClient()

  const { data: customer } = await db
    .from('customers').select('stripe_customer_id').eq('email', email).single()

  if (!customer?.stripe_customer_id) {
    return NextResponse.json({ error: 'No customer found' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
  })

  return NextResponse.json({ url: session.url })
}
