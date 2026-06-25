import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const db = createServiceClient()
  const { data: customer } = await db
    .from('customers')
    .select('name, subscription_tier, pack_credits_remaining, pack_expires_at, pack_credits_lapsed')
    .eq('email', email)
    .single()

  return NextResponse.json({ customer })
}
