import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { getNextOccurrences } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const style = searchParams.get('style')
  const weekOffset = parseInt(searchParams.get('weekOffset') || '0')

  const db = createServiceClient()

  // Get all active classes
  let query = db.from('classes').select('*').order('day_of_week').order('start_time')
  if (style) query = query.eq('style', style)

  const { data: classes, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Get upcoming instances for the next 4 weeks
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

  // For recurring classes, generate virtual instances if DB doesn't have them
  const classesWithInstances = classes?.map(cls => {
    const nextDates = getNextOccurrences(cls.day_of_week, 8)
    return { ...cls, nextDates }
  })

  return NextResponse.json({ classes: classesWithInstances, instances })
}
