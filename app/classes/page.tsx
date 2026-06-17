'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DAY_LABELS, DAYS_ORDER, formatTime, addMinutes, getNextOccurrences } from '@/lib/utils'
import { Suspense } from 'react'

interface ClassData {
  id: string
  title: string
  style: string
  instructor: string
  day_of_week: string
  start_time: string
  duration_minutes: number
  is_recurring: boolean
  is_pairwork: boolean
  leader_capacity: number | null
  follower_capacity: number | null
  general_capacity: number | null
  location: string
  nextDates: string[]
}

function StyleBadge({ style }: { style: string }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
      style === 'salsa' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'
    }`}>
      {style.charAt(0).toUpperCase() + style.slice(1)}
    </span>
  )
}

function ClassCard({ cls, nextDate }: { cls: ClassData; nextDate: string }) {
  const endTime = addMinutes(cls.start_time, cls.duration_minutes)
  const capacity = cls.is_pairwork
    ? `${cls.leader_capacity} leaders · ${cls.follower_capacity} followers`
    : `${cls.general_capacity} spots`

  return (
    <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5 hover:border-[#c8932a]/40 transition-all group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <StyleBadge style={cls.style} />
            {cls.is_pairwork && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#c8932a]/10 text-[#c8932a] border border-[#c8932a]/20">
                Pairwork
              </span>
            )}
          </div>
          <h3 className="font-bold text-lg group-hover:text-[#c8932a] transition-colors">{cls.title}</h3>
        </div>
        <div className="text-right text-sm text-[#9a8a72]">
          <div className="font-mono">{formatTime(cls.start_time)}</div>
          <div className="font-mono text-xs">–{formatTime(endTime)}</div>
        </div>
      </div>
      <div className="text-[#9a8a72] text-sm space-y-1 mb-4">
        <div>👤 {cls.instructor}</div>
        <div>📍 {cls.location}</div>
        <div>👥 {capacity}</div>
        <div className="text-[#c8932a]/70 text-xs">
          {new Date(nextDate + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
        </div>
      </div>
      <Link
        href={`/book/${cls.id}?date=${nextDate}`}
        className="block w-full text-center bg-[#c8932a] text-[#0a0805] py-2 rounded-md text-sm font-semibold hover:bg-[#a87820] transition-colors"
      >
        Book This Class
      </Link>
    </div>
  )
}

function ScheduleContent() {
  const searchParams = useSearchParams()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [styleFilter, setStyleFilter] = useState(searchParams.get('style') || 'all')
  const [pairworkFilter, setPairworkFilter] = useState(false)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (styleFilter !== 'all') params.set('style', styleFilter)
    const res = await fetch(`/api/classes?${params}`)
    const data = await res.json()
    setClasses(data.classes || [])
    setLoading(false)
  }, [styleFilter])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  const filtered = classes.filter(c => !pairworkFilter || c.is_pairwork)

  // Group by day of week
  const byDay: Record<string, ClassData[]> = {}
  DAYS_ORDER.forEach(day => { byDay[day] = [] })
  filtered.forEach(cls => {
    if (byDay[cls.day_of_week]) byDay[cls.day_of_week].push(cls)
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-10">
        {['all', 'salsa', 'bachata'].map(s => (
          <button key={s} onClick={() => setStyleFilter(s)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              styleFilter === s
                ? 'bg-[#c8932a] text-[#0a0805]'
                : 'bg-[#141008] border border-[#2a1f10] text-[#9a8a72] hover:border-[#c8932a]/40'
            }`}>
            {s === 'all' ? 'All Classes' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
        <button onClick={() => setPairworkFilter(!pairworkFilter)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            pairworkFilter
              ? 'bg-[#c8932a]/20 border border-[#c8932a] text-[#c8932a]'
              : 'bg-[#141008] border border-[#2a1f10] text-[#9a8a72] hover:border-[#c8932a]/40'
          }`}>
          Pairwork Only
        </button>
      </div>

      {loading ? (
        <div className="text-center text-[#9a8a72] py-20">Loading schedule…</div>
      ) : (
        <div className="space-y-10">
          {DAYS_ORDER.map(day => {
            const dayCls = byDay[day]
            if (dayCls.length === 0) return null
            const nextDates = dayCls[0] ? getNextOccurrences(day, 1) : []
            return (
              <div key={day}>
                <h2 className="text-xl font-bold mb-4 text-[#c8932a]">{DAY_LABELS[day]}</h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dayCls.map(cls => (
                    <ClassCard key={cls.id} cls={cls} nextDate={nextDates[0] || ''} />
                  ))}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center text-[#9a8a72] py-20">No classes found for this filter.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ClassesPage() {
  return (
    <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Class Schedule</h1>
        <p className="text-[#9a8a72] text-lg">All classes are 1h 30min. Book your spot below.</p>
      </div>
      <Suspense fallback={<div className="text-[#9a8a72]">Loading…</div>}>
        <ScheduleContent />
      </Suspense>
    </div>
  )
}
