import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function checkAdmin(request: NextRequest) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const instanceId = searchParams.get('instanceId')

  const db = createServiceClient()
  let query = db.from('bookings').select('*, class_instances(*, classes(*))').eq('status', 'confirmed').order('created_at', { ascending: false })
  if (instanceId) query = query.eq('class_instance_id', instanceId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ bookings: data })
}
