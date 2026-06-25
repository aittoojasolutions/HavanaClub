import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('class_id')
  const date = searchParams.get('date')

  if (!classId || !date) {
    return NextResponse.json({ error: 'class_id and date required' }, { status: 400 })
  }

  const db = createServiceClient()

  let { data } = await db
    .from('class_instances')
    .select('id')
    .eq('class_id', classId)
    .eq('date', date)
    .single()

  // Auto-create the instance if it doesn't exist yet
  if (!data) {
    const { data: created } = await db
      .from('class_instances')
      .insert({ class_id: classId, date })
      .select('id')
      .single()
    data = created
  }

  return NextResponse.json({ instanceId: data?.id || null })
}
