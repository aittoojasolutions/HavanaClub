import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

// Salary tiers: attendees → pay per class (€)
export const SALARY_TIERS = [
  { min: 0,  max: 4,  pay: 20 },
  { min: 5,  max: 8,  pay: 25 },
  { min: 9,  max: 12, pay: 32 },
  { min: 13, max: 16, pay: 38 },
  { min: 17, max: 20, pay: 45 },
  { min: 21, max: 22, pay: 52 },
  { min: 23, max: Infinity, pay: 60 },
]

export function salaryForAttendees(n: number): number {
  return SALARY_TIERS.find(t => n >= t.min && n <= t.max)?.pay ?? 20
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const monthParam = searchParams.get('month') // YYYY-MM, optional

  try {
    const db = createServiceClient()

    // All class instances with booking counts and class info
    // Filter by month if provided
    let query = db
      .from('class_instances')
      .select(`
        id, date, status,
        leader_spots_taken, follower_spots_taken, general_spots_taken,
        classes ( id, title, style, instructor, is_pairwork, leader_capacity, follower_capacity, general_capacity )
      `)
      .eq('status', 'scheduled')
      .order('date', { ascending: false })

    if (monthParam) {
      const [y, m] = monthParam.split('-').map(Number)
      const start = new Date(y, m - 1, 1).toISOString().split('T')[0]
      const end = new Date(y, m, 0).toISOString().split('T')[0]
      query = query.gte('date', start).lte('date', end)
    } else {
      // Default: last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
      query = query.gte('date', sixMonthsAgo.toISOString().split('T')[0])
    }

    const { data: instances, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Also get actual booking counts per instance (more accurate than spots_taken)
    const instanceIds = (instances ?? []).map(i => i.id)
    const { data: bookingCounts } = instanceIds.length > 0
      ? await db
          .from('bookings')
          .select('class_instance_id')
          .in('class_instance_id', instanceIds)
          .eq('status', 'confirmed')
      : { data: [] }

    // Count per instance
    const countByInstance: Record<string, number> = {}
    ;(bookingCounts ?? []).forEach(b => {
      countByInstance[b.class_instance_id] = (countByInstance[b.class_instance_id] ?? 0) + 1
    })

    // Build per-class records
    type ClassRow = {
      id: string
      date: string
      instructor: string
      title: string
      style: string
      attendees: number
      pay: number
      month: string
    }

    const rows: ClassRow[] = (instances ?? []).map(inst => {
      const cls = (Array.isArray(inst.classes) ? inst.classes[0] : inst.classes) as {
        id: string; title: string; style: string; instructor: string;
        is_pairwork: boolean; leader_capacity: number; follower_capacity: number; general_capacity: number
      } | null

      if (!cls) return null

      // Use booking count if available, otherwise fall back to spots_taken
      const attendees = countByInstance[inst.id]
        ?? (cls.is_pairwork
          ? (inst.leader_spots_taken ?? 0) + (inst.follower_spots_taken ?? 0)
          : (inst.general_spots_taken ?? 0))

      return {
        id: inst.id,
        date: inst.date,
        instructor: cls.instructor,
        title: cls.title,
        style: cls.style,
        attendees,
        pay: salaryForAttendees(attendees),
        month: inst.date.slice(0, 7),
      }
    }).filter(Boolean) as ClassRow[]

    // Group by instructor → month → classes
    const byInstructor: Record<string, {
      instructor: string
      months: Record<string, { month: string; classes: ClassRow[]; totalPay: number; totalAttendees: number }>
      allTimeTotal: number
    }> = {}

    rows.forEach(row => {
      if (!byInstructor[row.instructor]) {
        byInstructor[row.instructor] = { instructor: row.instructor, months: {}, allTimeTotal: 0 }
      }
      const inst = byInstructor[row.instructor]
      if (!inst.months[row.month]) {
        inst.months[row.month] = { month: row.month, classes: [], totalPay: 0, totalAttendees: 0 }
      }
      inst.months[row.month].classes.push(row)
      inst.months[row.month].totalPay += row.pay
      inst.months[row.month].totalAttendees += row.attendees
      inst.allTimeTotal += row.pay
    })

    // Available months for filter
    const allMonths = [...new Set(rows.map(r => r.month))].sort().reverse()

    return NextResponse.json({
      tiers: SALARY_TIERS,
      instructors: Object.values(byInstructor),
      allMonths,
      totalRows: rows.length,
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
