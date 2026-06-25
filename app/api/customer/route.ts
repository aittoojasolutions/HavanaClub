import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const db = createServiceClient()
  const { data: customer } = await db
    .from('customers')
    .select('name, first_name, last_name, phone, age, subscription_tier, pack_credits_remaining, pack_expires_at, pack_credits_lapsed')
    .eq('email', email)
    .single()

  return NextResponse.json({ customer })
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const body = await request.json()
  const { first_name, last_name, phone, age } = body

  const updates: Record<string, unknown> = {}
  if (first_name !== undefined) updates.first_name = first_name
  if (last_name !== undefined) updates.last_name = last_name
  if (phone !== undefined) updates.phone = phone
  if (age !== undefined) updates.age = age
  if (first_name !== undefined || last_name !== undefined) {
    updates.name = [first_name, last_name].filter(Boolean).join(' ')
  }

  const db = createServiceClient()
  const { data, error } = await db
    .from('customers')
    .update(updates)
    .eq('email', email)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ customer: data })
}
