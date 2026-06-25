'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Calendar, Clock, MapPin, Sparkles } from '@/components/Icons'

interface BaseEvent {
  id: string
  title: string
  description: string | null
  event_date: string
  start_time: string
  end_time: string | null
  location: string | null
  location_url: string | null
  image_url: string | null
  ticket_url: string | null
}

interface RegularEvent extends BaseEvent {
  type: 'event'
}

interface TrialEvent extends BaseEvent {
  type: 'trial'
  style: string
  trial_id: string
  capacity: number
  spots_left: number
}

type AnyEvent = RegularEvent | TrialEvent

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':')
  return `${h}:${m}`
}

function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const event = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((event.getTime() - today.getTime()) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff <= 7) return `In ${diff} days`
  return null
}

function buildFacebookUrl(ev: BaseEvent) {
  const base = 'https://www.facebook.com/events/create'
  const params = new URLSearchParams()
  if (ev.title) params.set('name', ev.title)
  if (ev.description) params.set('description', ev.description)
  if (ev.location) params.set('location', ev.location)
  return `${base}?${params.toString()}`
}

function TrialCard({ ev }: { ev: TrialEvent }) {
  const urgency = daysUntil(ev.event_date)
  const isSalsa = ev.style === 'salsa'

  return (
    <div className="bg-[#141008] border border-[#c8932a]/20 hover:border-[#c8932a]/50 rounded-2xl overflow-hidden transition-colors">
      {/* Coloured top bar */}
      <div className={`h-1.5 w-full ${isSalsa ? 'bg-orange-500' : 'bg-purple-500'}`} />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {/* Tryout badge */}
              <span className={`text-xs font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full border ${
                isSalsa
                  ? 'bg-orange-900/30 text-orange-300 border-orange-700/30'
                  : 'bg-purple-900/30 text-purple-300 border-purple-700/30'
              }`}>
                ✦ Tryout Class ✦
              </span>
              {urgency && (
                <span className="text-xs bg-[#c8932a]/20 text-[#c8932a] border border-[#c8932a]/30 px-2 py-0.5 rounded-full font-semibold">
                  {urgency}
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">{ev.title}</h2>

            <div className="flex flex-wrap gap-4 text-sm text-[#9a8a72] mb-3">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 flex-shrink-0" />{formatDate(ev.event_date)}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 flex-shrink-0" />{formatTime(ev.start_time)}{ev.end_time ? ` – ${formatTime(ev.end_time)}` : ''}</span>
              {ev.location && <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{ev.location}</span>}
            </div>

            <p className="text-[#9a8a72] text-sm leading-relaxed mb-1">{ev.description}</p>

            <p className="text-[#c8932a] text-sm font-semibold mt-2">
              €10 · paid on site · no card needed to reserve
            </p>

            {ev.spots_left <= 10 && ev.spots_left > 0 && (
              <p className="text-orange-400 text-xs font-semibold mt-1">Only a few spots left!</p>
            )}
            {ev.spots_left <= 0 && (
              <p className="text-red-400 text-xs font-semibold mt-1">Fully booked</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          {ev.spots_left > 0 ? (
            <Link href="/first-timers"
              className="bg-[#c8932a] text-[#0a0805] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e0a830] transition-colors text-sm">
              Reserve Your Spot →
            </Link>
          ) : (
            <span className="bg-[#2a1f10] text-[#9a8a72] font-bold px-5 py-2.5 rounded-lg text-sm cursor-not-allowed">
              Fully Booked
            </span>
          )}
          <a href={buildFacebookUrl(ev)} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 border border-[#2a1f10] hover:border-[#c8932a]/40 text-[#9a8a72] hover:text-[#f5f0e8] px-5 py-2.5 rounded-lg transition-colors text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Share on Facebook
          </a>
        </div>
      </div>
    </div>
  )
}

function RegularCard({ ev }: { ev: RegularEvent }) {
  const urgency = daysUntil(ev.event_date)
  const fbUrl = buildFacebookUrl(ev)

  return (
    <div className="bg-[#141008] border border-[#2a1f10] hover:border-[#c8932a]/40 rounded-2xl overflow-hidden transition-colors">
      {ev.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ev.image_url} alt={ev.title} className="w-full h-56 object-cover" />
      )}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {urgency && (
                <span className="text-xs bg-[#c8932a]/20 text-[#c8932a] border border-[#c8932a]/30 px-2 py-0.5 rounded-full font-semibold">
                  {urgency}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{ev.title}</h2>
            <div className="flex flex-wrap gap-4 text-sm text-[#9a8a72] mb-3">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 flex-shrink-0" />{formatDate(ev.event_date)}</span>
              <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 flex-shrink-0" />{formatTime(ev.start_time)}{ev.end_time ? ` – ${formatTime(ev.end_time)}` : ''}</span>
              {ev.location && (
                ev.location_url
                  ? <a href={ev.location_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#c8932a] transition-colors"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{ev.location}</a>
                  : <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 flex-shrink-0" />{ev.location}</span>
              )}
            </div>
            {ev.description && (
              <p className="text-[#9a8a72] leading-relaxed text-sm whitespace-pre-line">{ev.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-5">
          {ev.ticket_url && (
            <a href={ev.ticket_url} target="_blank" rel="noopener noreferrer"
              className="bg-[#c8932a] text-[#0a0805] font-bold px-5 py-2.5 rounded-lg hover:bg-[#e0a830] transition-colors text-sm">
              Get Tickets
            </a>
          )}
          <a href={fbUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 border border-[#2a1f10] hover:border-[#c8932a]/40 text-[#9a8a72] hover:text-[#f5f0e8] px-5 py-2.5 rounded-lg transition-colors text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Share on Facebook
          </a>
        </div>
      </div>
    </div>
  )
}

export default function EventsPage() {
  const [events, setEvents] = useState<AnyEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/events')
      .then(r => r.json())
      .then(d => { setEvents(d.events ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0805] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#c8932a] uppercase tracking-widest text-sm font-semibold mb-3">What&apos;s On</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Upcoming Events</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Tryout classes, socials, workshops and more — all in one place.
          </p>
        </div>

        {/* First-timer nudge */}
        <div className="mb-10 bg-[#141008] border border-[#c8932a]/20 rounded-2xl px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-[#f5f0e8] mb-0.5">New to Latin dance?</p>
            <p className="text-sm text-[#9a8a72]">Try your first Cuban Salsa or Bachata class for just €10 — no experience or partner needed.</p>
          </div>
          <Link href="/first-timers"
            className="flex-shrink-0 bg-[#c8932a] text-[#0a0805] font-bold px-5 py-2.5 rounded-lg hover:bg-[#a87820] transition-colors text-sm whitespace-nowrap">
            See Tryout Classes →
          </Link>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#c8932a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <Sparkles className="w-14 h-14 mb-4 mx-auto text-[#c8932a]/40" />
            <p className="text-xl">No upcoming events right now — check back soon!</p>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="space-y-6">
            {events.map(ev =>
              ev.type === 'trial'
                ? <TrialCard key={ev.id} ev={ev} />
                : <RegularCard key={ev.id} ev={ev} />
            )}
          </div>
        )}

        <div className="mt-16 text-center">
          <p className="text-[#9a8a72] mb-4">Want to join our regular weekly classes?</p>
          <Link href="/classes"
            className="inline-block bg-[#c8932a] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#e0a830] transition-colors">
            View Weekly Schedule
          </Link>
        </div>
      </div>
    </main>
  )
}
