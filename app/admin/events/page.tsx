'use client'

import { useState, useEffect } from 'react'
import { useAdmin } from '../layout'

interface Event {
  id: string
  title: string
  description: string
  event_date: string
  start_time: string
  end_time: string
  location: string
  location_url: string
  image_url: string
  ticket_url: string
  is_published: boolean
  created_at: string
}

const EMPTY = {
  title: '', description: '', event_date: '', start_time: '18:00', end_time: '',
  location: '', location_url: '', image_url: '', ticket_url: '', is_published: true,
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(t: string) { return t?.slice(0, 5) ?? '' }

function buildFacebookUrl(ev: Partial<Event>) {
  const base = 'https://www.facebook.com/events/create'
  const params = new URLSearchParams()
  if (ev.title) params.set('name', ev.title)
  if (ev.description) params.set('description', ev.description)
  if (ev.location) params.set('location', ev.location)
  return `${base}?${params.toString()}`
}

function EventForm({ initial, onSave, onCancel, password, isEdit }: {
  initial: typeof EMPTY & { id?: string }
  onSave: (e: Event) => void
  onCancel: () => void
  password: string
  isEdit: boolean
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function importFromUrl() {
    if (!importUrl) return
    setImporting(true); setImportError('')
    const res = await fetch('/api/admin/scrape-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ url: importUrl }),
    })
    const data = await res.json()
    if (!res.ok) { setImportError(data.error); setImporting(false); return }
    setForm(f => ({
      ...f,
      title: data.title || f.title,
      description: data.description || f.description,
      event_date: data.event_date || f.event_date,
      start_time: data.start_time || f.start_time,
      end_time: data.end_time || f.end_time,
      location: data.location || f.location,
      image_url: data.image_url || f.image_url,
    }))
    setImportUrl('')
    setImporting(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const res = await fetch('/api/admin/events', {
      method: isEdit ? 'PATCH' : 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    onSave(data.event)
  }

  return (
    <form onSubmit={save} className="bg-[#141008] border border-[#c8932a]/20 rounded-2xl p-6 mb-6 space-y-4">
      <h3 className="font-bold text-lg">{isEdit ? 'Edit Event' : 'Create New Event'}</h3>
      {error && <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>}

      {/* Import from URL */}
      <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-4">
        <label className="block text-xs font-semibold text-[#c8932a] mb-2">Import from Facebook Event URL</label>
        <div className="flex gap-2">
          <input
            value={importUrl}
            onChange={e => { setImportUrl(e.target.value); setImportError('') }}
            placeholder="https://www.facebook.com/events/..."
            className="flex-1 bg-[#141008] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none text-sm"
          />
          <button type="button" onClick={importFromUrl} disabled={importing || !importUrl}
            className="bg-[#1877F2] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1565d8] transition-colors disabled:opacity-50 flex items-center gap-1.5 whitespace-nowrap">
            {importing ? 'Importing…' : (
              <>
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Import
              </>
            )}
          </button>
        </div>
        {importError && <p className="text-red-400 text-xs mt-2">{importError}</p>}
        <p className="text-[#9a8a72] text-xs mt-2">Paste a public Facebook event link to auto-fill the form below.</p>
      </div>

      <div>
        <label className="block text-xs text-[#9a8a72] mb-1">Event Title *</label>
        <input required value={form.title} onChange={e => set('title', e.target.value)}
          placeholder="Salsa Social Night"
          className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Date *</label>
          <input required type="date" value={form.event_date} onChange={e => set('event_date', e.target.value)}
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Start Time *</label>
          <input required type="time" value={form.start_time} onChange={e => set('start_time', e.target.value)}
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">End Time</label>
          <input type="time" value={form.end_time} onChange={e => set('end_time', e.target.value)}
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Location</label>
          <input value={form.location} onChange={e => set('location', e.target.value)}
            placeholder="Havana Club Studio, Helsinki"
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Location URL <span className="font-normal">(Google Maps link)</span></label>
          <input type="url" value={form.location_url} onChange={e => set('location_url', e.target.value)}
            placeholder="https://maps.google.com/..."
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#9a8a72] mb-1">Description</label>
        <textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Join us for an amazing night of salsa dancing! All levels welcome..."
          className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm resize-none" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Event Image URL</label>
          <input type="url" value={form.image_url} onChange={e => set('image_url', e.target.value)}
            placeholder="https://..."
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Ticket / RSVP URL</label>
          <input type="url" value={form.ticket_url} onChange={e => set('ticket_url', e.target.value)}
            placeholder="https://..."
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative flex-shrink-0">
          <input type="checkbox" className="sr-only" checked={form.is_published} onChange={e => set('is_published', e.target.checked)} />
          <div className={`w-10 h-6 rounded-full transition-colors ${form.is_published ? 'bg-[#c8932a]' : 'bg-[#2a1f10]'}`} />
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_published ? 'translate-x-4' : ''}`} />
        </div>
        <div>
          <span className="text-sm font-medium text-[#f5f0e8]">Published</span>
          <span className="text-xs text-[#9a8a72] ml-2">{form.is_published ? 'Visible on website' : 'Hidden — draft only'}</span>
        </div>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="bg-[#c8932a] text-[#0a0805] px-6 py-2.5 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Event'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-[#2a1f10] text-[#9a8a72] hover:text-[#f5f0e8] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminEventsPage() {
  const { password } = useAdmin()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Event | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function load() {
    const res = await fetch('/api/admin/events', { headers: { 'x-admin-password': password } })
    const data = await res.json()
    setEvents(data.events ?? [])
    setLoading(false)
  }

  async function togglePublished(ev: Event) {
    await fetch('/api/admin/events', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: ev.id, is_published: !ev.is_published }),
    })
    setEvents(es => es.map(e => e.id === ev.id ? { ...e, is_published: !e.is_published } : e))
  }

  async function deleteEvent(ev: Event) {
    if (!confirm(`Delete "${ev.title}"? This cannot be undone.`)) return
    await fetch(`/api/admin/events?id=${ev.id}`, {
      method: 'DELETE', headers: { 'x-admin-password': password },
    })
    setEvents(es => es.filter(e => e.id !== ev.id))
    showToast('Event deleted')
  }

  function onSaved(ev: Event) {
    if (editing) {
      setEvents(es => es.map(e => e.id === ev.id ? ev : e))
      setEditing(null)
    } else {
      setEvents(es => [...es, ev].sort((a, b) => a.event_date.localeCompare(b.event_date)))
      setShowForm(false)
    }
    showToast(editing ? 'Event updated' : `"${ev.title}" created`)
  }

  useEffect(() => { if (password) load() }, [password])

  const upcoming = events.filter(e => e.event_date >= new Date().toISOString().split('T')[0])
  const past = events.filter(e => e.event_date < new Date().toISOString().split('T')[0])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-[#9a8a72] text-sm mt-0.5">Create events here, then share them to Facebook in one click.</p>
        </div>
        {!showForm && !editing && (
          <button onClick={() => setShowForm(true)}
            className="bg-[#c8932a] text-[#0a0805] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#a87820] transition-colors">
            + New Event
          </button>
        )}
      </div>

      {toast && (
        <div className="bg-green-900/20 border border-green-700/40 text-green-300 px-4 py-2 rounded-lg mb-4 text-sm">
          ✓ {toast}
        </div>
      )}

      {showForm && (
        <EventForm initial={{ ...EMPTY }} onSave={onSaved} onCancel={() => setShowForm(false)} password={password} isEdit={false} />
      )}
      {editing && (
        <EventForm initial={{ ...EMPTY, ...editing }} onSave={onSaved} onCancel={() => setEditing(null)} password={password} isEdit={true} />
      )}

      {loading ? (
        <div className="text-[#9a8a72] text-sm py-8 text-center">Loading…</div>
      ) : events.length === 0 && !showForm ? (
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-12 text-center text-[#9a8a72]">
          <div className="text-4xl mb-3">🎉</div>
          <p className="mb-3">No events yet.</p>
          <button onClick={() => setShowForm(true)} className="text-[#c8932a] hover:underline text-sm">
            Create your first event →
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-[#9a8a72] uppercase tracking-widest mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map(ev => (
                  <EventCard key={ev.id} ev={ev} onEdit={() => { setEditing(ev); setShowForm(false) }}
                    onDelete={() => deleteEvent(ev)} onToggle={() => togglePublished(ev)} />
                ))}
              </div>
            </div>
          )}
          {past.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold text-[#9a8a72] uppercase tracking-widest mb-3">Past</h2>
              <div className="space-y-3 opacity-60">
                {past.slice().reverse().map(ev => (
                  <EventCard key={ev.id} ev={ev} onEdit={() => { setEditing(ev); setShowForm(false) }}
                    onDelete={() => deleteEvent(ev)} onToggle={() => togglePublished(ev)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function EventCard({ ev, onEdit, onDelete, onToggle }: {
  ev: Event
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  return (
    <div className={`bg-[#141008] border rounded-2xl p-5 flex items-center gap-4 transition-all ${ev.is_published ? 'border-[#c8932a]/20' : 'border-[#2a1f10]'}`}>
      {ev.image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={ev.image_url} alt={ev.title} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-bold text-[#f5f0e8]">{ev.title}</span>
          {!ev.is_published && (
            <span className="text-xs bg-[#2a1f10] text-[#9a8a72] border border-[#3a2f20] px-2 py-0.5 rounded-full">Draft</span>
          )}
        </div>
        <div className="text-[#9a8a72] text-sm">
          {formatDate(ev.event_date)} · {formatTime(ev.start_time)}{ev.end_time ? ` – ${formatTime(ev.end_time)}` : ''}
          {ev.location ? ` · ${ev.location}` : ''}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <a href={buildFacebookUrl(ev)} target="_blank" rel="noopener noreferrer"
          title="Open in Facebook Events"
          className="flex items-center gap-1.5 text-xs text-[#9a8a72] hover:text-[#1877F2] border border-[#2a1f10] hover:border-[#1877F2]/40 rounded-lg px-3 py-1.5 transition-colors">
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Facebook
        </a>

        <button onClick={onToggle} title={ev.is_published ? 'Unpublish' : 'Publish'}
          className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${ev.is_published ? 'bg-[#c8932a]' : 'bg-[#2a1f10]'}`}>
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${ev.is_published ? 'translate-x-4' : ''}`} />
        </button>

        <button onClick={onEdit}
          className="text-xs text-[#9a8a72] hover:text-[#c8932a] border border-[#2a1f10] hover:border-[#c8932a]/30 rounded-lg px-3 py-1.5 transition-colors">
          Edit
        </button>
        <button onClick={onDelete} className="text-xs text-[#9a8a72] hover:text-red-400 transition-colors">✕</button>
      </div>
    </div>
  )
}
