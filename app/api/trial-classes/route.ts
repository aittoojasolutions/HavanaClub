import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const db = createServiceClient()
    const today = new Date().toISOString().split('T')[0]
    const { data, error } = await db
      .from('trial_classes')
      .select('*, trial_signups(count)')
      .gte('date', today)
      .order('date')

    if (error) return NextResponse.json({ classes: [] }, { status: 200 })
    return NextResponse.json({ classes: data ?? [] })
  } catch {
    return NextResponse.json({ classes: [] })
  }
}

function checkAdmin(request: NextRequest) {
  return request.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function POST(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const db = createServiceClient()
  const { data, error } = await db
    .from('trial_classes')
    .insert({
      style: body.style,
      date: body.date,
      start_time: body.start_time || '18:00',
      instructor: body.instructor,
      location: body.location || 'Main Studio',
      capacity: body.capacity || 15,
    })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ class: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const db = createServiceClient()
  const { error } = await db.from('trial_classes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
