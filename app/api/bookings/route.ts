import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('bookings')
    .select('*, class_instances(*, classes(*))')
    .eq('customer_email', email)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookings: data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { customer_email, customer_name, class_instance_id, role, booking_type } = body

  if (!customer_email || !customer_name || !class_instance_id) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const db = createServiceClient()

  // Check for duplicate booking
  const { data: existing } = await db
    .from('bookings')
    .select('id')
    .eq('customer_email', customer_email)
    .eq('class_instance_id', class_instance_id)
    .eq('status', 'confirmed')
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Already booked for this class' }, { status: 409 })
  }

  // Check customer credits for pack/subscription
  if (booking_type === 'pack') {
    const { data: customer } = await db
      .from('customers')
      .select('pack_credits_remaining')
      .eq('email', customer_email)
      .single()

    if (!customer || customer.pack_credits_remaining < 1) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 402 })
    }

    // Deduct credit
    await db
      .from('customers')
      .update({ pack_credits_remaining: customer.pack_credits_remaining - 1 })
      .eq('email', customer_email)
  }

  if (booking_type === 'subscription') {
    const { data: customer } = await db
      .from('customers')
      .select('subscription_tier')
      .eq('email', customer_email)
      .single()

    if (!customer?.subscription_tier) {
      return NextResponse.json({ error: 'No active subscription' }, { status: 402 })
    }

    // Check weekly class limit
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const { count } = await db
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('customer_email', customer_email)
      .eq('booking_type', 'subscription')
      .eq('status', 'confirmed')
      .gte('created_at', weekStart.toISOString())
      .lt('created_at', weekEnd.toISOString())

    const limit = customer.subscription_tier
    if ((count || 0) >= limit) {
      return NextResponse.json({ error: `Weekly limit of ${limit} class(es) reached for your subscription` }, { status: 402 })
    }
  }

  // Create booking
  const { data: booking, error } = await db
    .from('bookings')
    .insert({ customer_email, customer_name, class_instance_id, role: role || 'general', booking_type })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update spot count
  const spotField = role === 'leader' ? 'leader_spots_taken'
    : role === 'follower' ? 'follower_spots_taken'
    : 'general_spots_taken'

  await db.rpc('increment_spot', { instance_id: class_instance_id, field: spotField })

  return NextResponse.json({ booking }, { status: 201 })
}
