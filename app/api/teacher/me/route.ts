import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { hashToken, COOKIE_NAME } from '@/lib/teacher-auth'
import { salaryForAttendees } from '@/app/api/admin/salary/route'

async function getTeacherFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const db = createServiceClient()
  const { data: session } = await db
    .from('teacher_sessions')
    .select('teacher_id, expires_at')
    .eq('token_hash', hashToken(token))
    .single()
  if (!session || new Date(session.expires_at) < new Date()) return null
  const { data: teacher } = await db
    .from('teachers')
    .select('id, name, email, phone, bio, photo_url, is_active')
    .eq('id', session.teacher_id)
    .single()
  return teacher ?? null
}

export async function GET(req: NextRequest) {
  const teacher = await getTeacherFromRequest(req)
  if (!teacher) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const db = createServiceClient()
  const today = new Date()
  const sixMonthsAgo = new Date(today); sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  const sixAgoStr = sixMonthsAgo.toISOString().split('T')[0]
  const todayStr = today.toISOString().split('T')[0]

  // Upcoming classes taught by this teacher
  const { data: upcomingInstances } = await db
    .from('class_instances')
    .select('id, date, leader_spots_taken, follower_spots_taken, general_spots_taken, classes(title, style, instructor, is_pairwork, leader_capacity, follower_capacity, general_capacity)')
    .gte('date', todayStr)
    .order('date', { ascending: true })
    .limit(20)

  // Past instances for salary calc
  const { data: pastInstances } = await db
    .from('class_instances')
    .select('id, date, leader_spots_taken, follower_spots_taken, general_spots_taken, classes(title, style, instructor, is_pairwork, leader_capacity, follower_capacity, general_capacity)')
    .gte('date', sixAgoStr)
    .lt('date', todayStr)
    .order('date', { ascending: false })

  const teacherName = teacher!.name.toLowerCase().trim()
  function matchesTeacher(inst: { classes: unknown }) {
    const cls = (Array.isArray(inst.classes) ? inst.classes[0] : inst.classes) as { instructor?: string } | null
    return cls?.instructor?.toLowerCase().trim() === teacherName
  }

  const myUpcoming = (upcomingInstances ?? []).filter(matchesTeacher)
  const myPast = (pastInstances ?? []).filter(matchesTeacher)

  // Build salary by month
  const salaryByMonth: Record<string, { month: string; classes: { date: string; title: string; style: string; attendees: number; pay: number }[]; totalPay: number }> = {}

  myPast.forEach(inst => {
    const cls = (Array.isArray(inst.classes) ? inst.classes[0] : inst.classes) as { title: string; style: string; is_pairwork: boolean; leader_capacity: number; follower_capacity: number; general_capacity: number } | null
    if (!cls) return
    const attendees = cls.is_pairwork
      ? (inst.leader_spots_taken ?? 0) + (inst.follower_spots_taken ?? 0)
      : (inst.general_spots_taken ?? 0)
    const pay = salaryForAttendees(attendees)
    const month = inst.date.slice(0, 7)
    if (!salaryByMonth[month]) salaryByMonth[month] = { month, classes: [], totalPay: 0 }
    salaryByMonth[month].classes.push({ date: inst.date, title: cls.title, style: cls.style, attendees, pay })
    salaryByMonth[month].totalPay += pay
  })

  // Current month signups for upcoming classes
  const upcomingWithSignups = myUpcoming.map(inst => {
    const cls = (Array.isArray(inst.classes) ? inst.classes[0] : inst.classes) as { title: string; style: string; is_pairwork: boolean; leader_capacity: number; follower_capacity: number; general_capacity: number } | null
    if (!cls) return null
    const taken = cls.is_pairwork
      ? (inst.leader_spots_taken ?? 0) + (inst.follower_spots_taken ?? 0)
      : (inst.general_spots_taken ?? 0)
    const capacity = cls.is_pairwork ? cls.leader_capacity + cls.follower_capacity : cls.general_capacity
    return { id: inst.id, date: inst.date, title: cls.title, style: cls.style, taken, capacity }
  }).filter(Boolean)

  return NextResponse.json({
    teacher,
    upcoming: upcomingWithSignups,
    salary: Object.values(salaryByMonth).sort((a, b) => b.month.localeCompare(a.month)),
  })
}
