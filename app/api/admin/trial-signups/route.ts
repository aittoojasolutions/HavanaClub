import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const classId = searchParams.get('class_id')
  if (!classId) return NextResponse.json({ error: 'class_id required' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('trial_signups')
    .select('id, name, email, phone, created_at')
    .eq('trial_class_id', classId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ signups: data ?? [] })
}
