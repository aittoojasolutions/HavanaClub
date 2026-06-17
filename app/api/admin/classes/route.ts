import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getNextOccurrences } from '@/lib/utils'

function checkAdmin(request: NextRequest) {
  const auth = request.headers.get('x-admin-password')
  return auth === process.env.ADMIN_PASSWORD
}

export async function GET(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServiceClient()
  const { data, error } = await db.from('classes').select('*').order('day_of_week').order('start_time')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ classes: data })
}

export async function POST(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const db = createServiceClient()

  const { data: cls, error } = await db.from('classes').insert({
    title: body.title,
    style: body.style,
    instructor: body.instructor,
    day_of_week: body.day_of_week,
    start_time: body.start_time,
    duration_minutes: 90,
    is_recurring: body.is_recurring ?? true,
    is_pairwork: body.is_pairwork ?? false,
    leader_capacity: body.is_pairwork ? (body.leader_capacity || 10) : null,
    follower_capacity: body.is_pairwork ? (body.follower_capacity || 10) : null,
    general_capacity: body.is_pairwork ? null : (body.general_capacity || 20),
    location: body.location || 'Main Studio',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Pre-create instances for the next 8 weeks
  if (cls) {
    const dates = getNextOccurrences(cls.day_of_week, 8)
    const instances = dates.map(date => ({ class_id: cls.id, date }))
    await db.from('class_instances').upsert(instances, { onConflict: 'class_id,date' })
  }

  return NextResponse.json({ class: cls }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  if (!checkAdmin(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const db = createServiceClient()
  const { error } = await db.from('classes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
