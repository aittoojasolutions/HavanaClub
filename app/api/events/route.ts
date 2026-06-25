import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(':').map(Number)
  const total = h * 60 + m + minutes
  const endH = Math.floor(total / 60) % 24
  const endM = total % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

export async function GET() {
  try {
    const db = createServiceClient()
    const today = new Date().toISOString().split('T')[0]

    const [eventsRes, trialRes] = await Promise.all([
      db
        .from('events')
        .select('id, title, description, event_date, start_time, end_time, location, location_url, image_url, ticket_url')
        .eq('is_published', true)
        .gte('event_date', today)
        .order('event_date', { ascending: true }),
      db
        .from('trial_classes')
        .select('id, style, date, start_time, location, capacity, trial_signups(count)')
        .gte('date', today)
        .order('date', { ascending: true }),
    ])

    const events = (eventsRes.data ?? []).map(e => ({ ...e, type: 'event' as const }))

    const trialEvents = (trialRes.data ?? []).map(tc => {
      const style = tc.style as string
      const signupCount = (tc.trial_signups as { count: number }[])?.[0]?.count ?? 0
      const spotsLeft = tc.capacity - signupCount
      return {
        id: `trial-${tc.id}`,
        type: 'trial' as const,
        style,
        trial_id: tc.id,
        title: `${style === 'salsa' ? 'Cuban Salsa' : 'Bachata'} Tryout Class`,
        description: `Try ${style === 'salsa' ? 'Cuban Salsa' : 'Bachata'} for just €10. A full 90-minute class — no experience needed, no partner required. Come as you are.`,
        event_date: tc.date,
        start_time: tc.start_time,
        end_time: addMinutes(tc.start_time, 90),
        location: tc.location,
        location_url: null,
        image_url: null,
        ticket_url: null,
        capacity: tc.capacity,
        spots_left: spotsLeft,
      }
    })

    // Merge and sort by date
    const all = [...events, ...trialEvents].sort((a, b) =>
      a.event_date.localeCompare(b.event_date)
    )

    return NextResponse.json({ events: all })
  } catch {
    return NextResponse.json({ events: [] })
  }
}
