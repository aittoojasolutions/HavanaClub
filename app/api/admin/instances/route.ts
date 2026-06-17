import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function checkAdmin(request: NextRequest) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

// Cancel a single instance
export async function PATCH(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id, status } = await request.json()
  const db = createServiceClient()
  const { error } = await db.from('class_instances').update({ status }).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

// Get upcoming instances
export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServiceClient()
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await db
    .from('class_instances')
    .select('*, classes(*)')
    .gte('date', today)
    .order('date')
    .order('classes(start_time)')
    .limit(50)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ instances: data })
}
