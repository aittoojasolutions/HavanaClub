import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim()

  const db = createServiceClient()
  let query = db
    .from('customers')
    .select('id, email, name, pack_credits_remaining, subscription_tier, stripe_customer_id, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  if (q) {
    query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ members: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { id, pack_credits_remaining, subscription_tier, name } = body

  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = createServiceClient()
  const updates: Record<string, unknown> = {}
  if (pack_credits_remaining !== undefined) updates.pack_credits_remaining = pack_credits_remaining
  if (subscription_tier !== undefined) updates.subscription_tier = subscription_tier === 0 ? null : subscription_tier
  if (name !== undefined) updates.name = name

  const { data, error } = await db
    .from('customers')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ member: data })
}
