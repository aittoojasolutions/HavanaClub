import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getNextOccurrences } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const style = searchParams.get('style')
  const weekOffset = parseInt(searchParams.get('weekOffset') || '0')

  try {
    const db = createServiceClient()

    let query = db.from('classes').select('*').order('day_of_week').order('start_time')
    if (style) query = query.eq('style', style)

    const { data: classes, error } = await query
    if (error) return NextResponse.json({ error: error.message, classes: [] }, { status: 500 })

    const today = new Date()
    const startDate = new Date(today)
    startDate.setDate(today.getDate() + weekOffset * 7)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 7)

    const { data: instances } = await db
      .from('class_instances')
      .select('*, classes(*)')
      .gte('date', startDate.toISOString().split('T')[0])
      .lt('date', endDate.toISOString().split('T')[0])
      .eq('status', 'scheduled')

    const classesWithInstances = (classes ?? []).map(cls => ({
      ...cls,
      nextDates: getNextOccurrences(cls.day_of_week, 8),
    }))

    return NextResponse.json({ classes: classesWithInstances, instances: instances ?? [] })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: message, classes: [], instances: [] }, { status: 500 })
  }
}
