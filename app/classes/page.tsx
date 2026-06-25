'use client'
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { DAY_LABELS, DAYS_ORDER, formatTime, addMinutes } from '@/lib/utils'
import { Suspense } from 'react'
import { User, MapPin, Users } from '@/components/Icons'

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

function getWeekMonday(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function dateForDayInWeek(weekMonday: Date, dayName: string): string {
  const offsets: Record<string, number> = {
    monday: 0, tuesday: 1, wednesday: 2, thursday: 3,
    friday: 4, saturday: 5, sunday: 6,
  }
  const d = new Date(weekMonday)
  d.setDate(weekMonday.getDate() + offsets[dayName])
  return d.toISOString().split('T')[0]
}

function formatWeekRange(monday: Date): string {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${monday.toLocaleDateString('en-GB', opts)} – ${sunday.toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`
}

function todayDayName(): string {
  const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return names[new Date().getDay()]
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0]
}

function isTomorrow(dateStr: string): boolean {
  const tom = new Date(); tom.setDate(tom.getDate() + 1)
  return dateStr === tom.toISOString().split('T')[0]
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

function ClassCard({ cls, date, isPast }: { cls: ClassData; date: string; isPast: boolean }) {
  const endTime = addMinutes(cls.start_time, cls.duration_minutes)
  const capacity = cls.is_pairwork
    ? `${cls.leader_capacity} leaders · ${cls.follower_capacity} followers`
    : `${cls.general_capacity} spots`
  const today = isToday(date)
  const tomorrow = isTomorrow(date)

  return (
    <div className={`bg-[#141008] border rounded-xl p-5 transition-all group ${
      isPast ? 'border-[#1a1208] opacity-40' : 'border-[#2a1f10] hover:border-[#c8932a]/40'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <StyleBadge style={cls.style} />
            {cls.is_pairwork && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#c8932a]/10 text-[#c8932a] border border-[#c8932a]/20">
                Pairwork
              </span>
            )}
            {today && <span className="text-xs font-bold text-green-400">Today</span>}
            {tomorrow && <span className="text-xs font-bold text-[#c8932a]">Tomorrow</span>}
          </div>
          <h3 className={`font-bold text-lg ${isPast ? '' : 'group-hover:text-[#c8932a]'} transition-colors`}>{cls.title}</h3>
        </div>
        <div className="text-right text-sm text-[#9a8a72] flex-shrink-0">
          <div className="font-mono font-bold text-base text-[#f5f0e8]">{formatTime(cls.start_time)}</div>
          <div className="font-mono text-xs">– {formatTime(endTime)}</div>
        </div>
      </div>
      <div className="text-[#9a8a72] text-sm space-y-1 mb-4">
        <div className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 flex-shrink-0" />{cls.instructor}</div>
        <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{cls.location}</div>
        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 flex-shrink-0" />{capacity}</div>
      </div>
      {isPast ? (
        <div className="w-full text-center py-2 rounded-md text-sm text-[#4a3a28] border border-[#1a1208]">
          Class passed
        </div>
      ) : (
        <Link
          href={`/book/${cls.id}?date=${date}`}
          className="block w-full text-center bg-[#c8932a] text-[#0a0805] py-2 rounded-md text-sm font-semibold hover:bg-[#a87820] transition-colors"
        >
          Book This Class
        </Link>
      )}
    </div>
  )
}

function ScheduleContent() {
  const searchParams = useSearchParams()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [loading, setLoading] = useState(true)
  const [styleFilter, setStyleFilter] = useState(searchParams.get('style') || 'all')
  const [pairworkFilter, setPairworkFilter] = useState(false)
  const [weekMonday, setWeekMonday] = useState<Date>(() => getWeekMonday(new Date()))
  const [activeDay, setActiveDay] = useState<string>(todayDayName())

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const thisWeekMonday = getWeekMonday(new Date())
  const isCurrentWeek = weekMonday.getTime() === thisWeekMonday.getTime()

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (styleFilter !== 'all') params.set('style', styleFilter)
      const res = await fetch(`/api/classes?${params}`)
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      setClasses(data.classes || [])
    } catch {
      setClasses([])
    } finally {
      setLoading(false)
    }
  }, [styleFilter])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  function prevWeek() {
    if (isCurrentWeek) return
    const newMonday = new Date(weekMonday)
    newMonday.setDate(weekMonday.getDate() - 7)
    setWeekMonday(newMonday)
    // keep activeDay, but if going back to current week reset to today
    const newIsCurrentWeek = newMonday.getTime() === thisWeekMonday.getTime()
    if (newIsCurrentWeek) setActiveDay(todayDayName())
  }

  function nextWeek() {
    const newMonday = new Date(weekMonday)
    newMonday.setDate(weekMonday.getDate() + 7)
    setWeekMonday(newMonday)
    // when moving to a future week, default to Monday
    if (isCurrentWeek) setActiveDay('monday')
  }

  const filtered = classes.filter(c => !pairworkFilter || c.is_pairwork)

  // Group by day
  const byDay: Record<string, ClassData[]> = {}
  DAYS_ORDER.forEach(day => { byDay[day] = [] })
  filtered.forEach(cls => { if (byDay[cls.day_of_week]) byDay[cls.day_of_week].push(cls) })

  // Days that have classes (for tab display)
  const activeDays = DAYS_ORDER.filter(day => byDay[day].length > 0)

  // Current day's classes and date
  const currentDate = dateForDayInWeek(weekMonday, activeDay)
  const currentDateObj = new Date(currentDate + 'T00:00:00')
  const isPastDay = currentDateObj < today
  const currentClasses = byDay[activeDay] || []

  // Short day labels for tabs
  const shortLabels: Record<string, string> = {
    monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
    friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
  }

  return (
    <div>
      {/* Style & pairwork filters */}
      <div className="flex flex-wrap gap-3 mb-6">
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

      {/* Week navigator */}
      <div className="flex items-center justify-between bg-[#141008] border border-[#2a1f10] rounded-2xl px-4 py-3 mb-5">
        <button onClick={prevWeek} disabled={isCurrentWeek}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#9a8a72] hover:text-[#f5f0e8] disabled:opacity-30 disabled:cursor-not-allowed transition-colors px-3 py-1.5 rounded-lg hover:bg-[#2a1f10] disabled:hover:bg-transparent">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>
        <div className="text-center">
          <div className="font-bold text-[#f5f0e8] text-sm">{formatWeekRange(weekMonday)}</div>
          {isCurrentWeek && <div className="text-xs text-[#c8932a] font-semibold mt-0.5">This week</div>}
        </div>
        <button onClick={nextWeek}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#9a8a72] hover:text-[#f5f0e8] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#2a1f10]">
          Next
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day tabs */}
      <div className="flex gap-1.5 mb-8 overflow-x-auto pb-1 scrollbar-hide">
        {loading
          ? DAYS_ORDER.map(day => (
              <div key={day} className="h-14 w-14 flex-shrink-0 rounded-xl bg-[#141008] border border-[#2a1f10] animate-pulse" />
            ))
          : DAYS_ORDER.map(day => {
              const date = dateForDayInWeek(weekMonday, day)
              const dateObj = new Date(date + 'T00:00:00')
              const dayNum = dateObj.getDate()
              const hasClasses = byDay[day].length > 0
              const isPast = dateObj < today
              const isActive = activeDay === day
              const isTodayDay = isToday(date)

              return (
                <button
                  key={day}
                  onClick={() => hasClasses && setActiveDay(day)}
                  disabled={!hasClasses}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl text-center transition-all border ${
                    isActive
                      ? 'bg-[#c8932a] border-[#c8932a] text-[#0a0805]'
                      : hasClasses && !isPast
                        ? 'bg-[#141008] border-[#2a1f10] text-[#9a8a72] hover:border-[#c8932a]/50 hover:text-[#f5f0e8] cursor-pointer'
                        : hasClasses && isPast
                          ? 'bg-[#141008] border-[#1a1208] text-[#4a3a28] cursor-pointer hover:border-[#2a1f10]'
                          : 'bg-[#0d0b07] border-[#161008] text-[#2a2018] cursor-default'
                  }`}
                >
                  <span className={`text-xs font-semibold leading-none mb-1 ${isActive ? 'text-[#0a0805]' : ''}`}>
                    {shortLabels[day]}
                  </span>
                  <span className={`text-lg font-bold leading-none ${isActive ? 'text-[#0a0805]' : ''}`}>
                    {dayNum}
                  </span>
                  {isTodayDay && (
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full ${isActive ? 'bg-[#0a0805]' : 'bg-[#c8932a]'}`} />
                  )}
                </button>
              )
            })}
      </div>

      {/* Selected day header */}
      {!loading && (
        <div className="flex items-center gap-3 mb-5">
          <h2 className={`text-2xl font-bold ${isPastDay ? 'text-[#4a3a28]' : 'text-[#f5f0e8]'}`}>
            {DAY_LABELS[activeDay]}
          </h2>
          <span className={`text-sm ${isPastDay ? 'text-[#4a3a28]' : 'text-[#9a8a72]'}`}>
            {currentDateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
          </span>
          {isToday(currentDate) && (
            <span className="text-xs bg-green-900/30 text-green-300 border border-green-700/30 px-2 py-0.5 rounded-full font-semibold">
              Today
            </span>
          )}
        </div>
      )}

      {/* Classes for selected day */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2].map(i => (
            <div key={i} className="h-48 rounded-xl bg-[#141008] border border-[#2a1f10] animate-pulse" />
          ))}
        </div>
      ) : currentClasses.length === 0 ? (
        <div className="text-center py-20 text-[#9a8a72]">
          No classes on {DAY_LABELS[activeDay]}.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentClasses.map(cls => (
            <ClassCard key={cls.id} cls={cls} date={currentDate} isPast={isPastDay} />
          ))}
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
