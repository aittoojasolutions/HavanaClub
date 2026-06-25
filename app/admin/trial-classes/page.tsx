'use client'
import { useState, useEffect } from 'react'
import { useAdmin } from '../layout'

interface TrialClass {
  id: string
  style: 'salsa' | 'bachata'
  date: string
  start_time: string
  instructor: string
  location: string
  capacity: number
  trial_signups: { count: number }[]
}

interface Signup {
  id: string
  name: string
  email: string
  phone: string
  created_at: string
}

const DEFAULTS = {
  salsa: { start_time: '18:00', instructor: '', location: 'Main Studio', capacity: 15 },
  bachata: { start_time: '19:30', instructor: '', location: 'Main Studio', capacity: 15 },
}

function AddDateForm({ style, onSaved, onCancel, password }: {
  style: 'salsa' | 'bachata'
  onSaved: () => void
  onCancel: () => void
  password: string
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState(DEFAULTS[style].start_time)
  const [instructor, setInstructor] = useState(DEFAULTS[style].instructor)
  const [location, setLocation] = useState(DEFAULTS[style].location)
  const [capacity, setCapacity] = useState(DEFAULTS[style].capacity)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    const res = await fetch('/api/trial-classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ style, date, start_time: time, instructor, location, capacity }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to save'); setSaving(false); return }
    onSaved()
  }

  const isSalsa = style === 'salsa'

  return (
    <form onSubmit={save} className={`bg-[#141008] border rounded-2xl p-5 mb-4 ${isSalsa ? 'border-orange-700/30' : 'border-purple-700/30'}`}>
      <div className="flex items-center gap-2 mb-4">
        <span>{isSalsa ? '💃' : '🕺'}</span>
        <h3 className="font-bold">Add {isSalsa ? 'Salsa' : 'Bachata'} Trial Date</h3>
      </div>
      {error && <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-3 py-2 rounded-lg mb-3 text-sm">{error}</div>}
      <div className="grid sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Date *</label>
          <input required type="date" value={date} onChange={e => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Start Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Instructor *</label>
          <input required value={instructor} onChange={e => setInstructor(e.target.value)} placeholder="e.g. Carlos M."
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Location</label>
          <input value={location} onChange={e => setLocation(e.target.value)}
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Max Spots</label>
          <input type="number" min={1} max={50} value={capacity} onChange={e => setCapacity(parseInt(e.target.value) || 0)}
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving}
          className="bg-[#c8932a] text-[#0a0805] px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#a87820] transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : `Add ${isSalsa ? 'Salsa' : 'Bachata'} Date`}
        </button>
        <button type="button" onClick={onCancel}
          className="px-5 py-2 rounded-lg border border-[#2a1f10] text-[#9a8a72] hover:text-[#f5f0e8] text-sm transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

function ClassRow({ cls, password, onRemove }: { cls: TrialClass; password: string; onRemove: () => void }) {
  const [open, setOpen] = useState(false)
  const [signups, setSignups] = useState<Signup[]>([])
  const [loading, setLoading] = useState(false)

  const count = cls.trial_signups?.[0]?.count ?? 0
  const pct = cls.capacity > 0 ? count / cls.capacity : 0
  const dateObj = new Date(cls.date + 'T00:00:00')
  const isPast = dateObj < new Date()

  async function toggle() {
    if (!open && signups.length === 0) {
      setLoading(true)
      const res = await fetch(`/api/admin/trial-signups?class_id=${cls.id}`, {
        headers: { 'x-admin-password': password },
      })
      const data = await res.json()
      setSignups(data.signups ?? [])
      setLoading(false)
    }
    setOpen(o => !o)
  }

  function exportCsv() {
    const rows = [['Name', 'Email', 'Phone', 'Signed up'].join(',')]
    signups.forEach(s => rows.push([s.name, s.email, s.phone || '', new Date(s.created_at).toLocaleString('en-GB')].map(v => `"${v}"`).join(',')))
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = `signups-${cls.date}-${cls.style}.csv`; a.click()
  }

  return (
    <div className={`bg-[#141008] border border-[#2a1f10] rounded-xl overflow-hidden transition-opacity ${isPast ? 'opacity-50' : ''}`}>
      {/* Header row */}
      <div className="px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">
            {dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
            {isPast && <span className="ml-2 text-xs text-[#9a8a72]">(past)</span>}
          </div>
          <div className="text-[#9a8a72] text-xs">{cls.start_time} · {cls.location} · {cls.instructor}</div>
        </div>

        {/* Fill bar */}
        <div className="flex items-center gap-2">
          <div className="w-20 h-1.5 bg-[#2a1f10] rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${pct >= 1 ? 'bg-red-400' : pct > 0.7 ? 'bg-orange-400' : 'bg-green-400'}`}
              style={{ width: `${Math.min(pct * 100, 100)}%` }} />
          </div>
          <span className={`text-sm font-bold w-14 text-right ${pct >= 1 ? 'text-red-400' : pct > 0.7 ? 'text-orange-400' : 'text-green-400'}`}>
            {count}/{cls.capacity}
          </span>
        </div>

        <button onClick={toggle}
          className="text-xs text-[#9a8a72] hover:text-[#c8932a] border border-[#2a1f10] hover:border-[#c8932a]/30 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1">
          {open ? 'Hide' : 'View list'}
          <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button onClick={onRemove} className="text-xs text-[#9a8a72] hover:text-red-400 transition-colors flex-shrink-0">Remove</button>
      </div>

      {/* Expandable roster */}
      {open && (
        <div className="border-t border-[#2a1f10] px-4 py-4">
          {loading ? (
            <div className="text-[#9a8a72] text-sm text-center py-4">Loading signups…</div>
          ) : signups.length === 0 ? (
            <div className="text-[#9a8a72] text-sm text-center py-4">No signups yet.</div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-[#9a8a72] uppercase tracking-widest">{signups.length} signed up</span>
                <button onClick={exportCsv}
                  className="text-xs text-[#c8932a] hover:underline flex items-center gap-1">
                  ↓ Export CSV
                </button>
              </div>
              <div className="space-y-2">
                {signups.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 text-sm py-2 border-b border-[#2a1f10] last:border-0">
                    <span className="text-[#9a8a72] w-5 text-xs">{i + 1}</span>
                    <span className="font-medium text-[#f5f0e8] flex-1">{s.name}</span>
                    <span className="text-[#9a8a72] text-xs">{s.email}</span>
                    <span className="text-[#9a8a72] text-xs">{s.phone || '—'}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function StyleSection({ style, list, password, onRefresh }: {
  style: 'salsa' | 'bachata'
  list: TrialClass[]
  password: string
  onRefresh: () => void
}) {
  const [adding, setAdding] = useState(false)
  const [toast, setToast] = useState('')
  const isSalsa = style === 'salsa'

  async function remove(id: string) {
    if (!confirm('Remove this trial class?')) return
    await fetch(`/api/trial-classes?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    onRefresh()
  }

  function onSaved() {
    setAdding(false)
    setToast('✓ Added and now live on the website')
    onRefresh()
    setTimeout(() => setToast(''), 3000)
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{isSalsa ? '💃' : '🕺'}</span>
          <div>
            <h2 className="text-xl font-bold">{isSalsa ? 'Salsa' : 'Bachata'} Trial Classes</h2>
            <p className="text-[#9a8a72] text-xs">{list.length} date{list.length !== 1 ? 's' : ''} scheduled</p>
          </div>
        </div>
        {!adding && (
          <button onClick={() => setAdding(true)}
            className={`text-sm font-bold px-4 py-2 rounded-lg border transition-colors ${
              isSalsa
                ? 'border-orange-700/40 text-orange-300 hover:bg-orange-900/20'
                : 'border-purple-700/40 text-purple-300 hover:bg-purple-900/20'
            }`}>
            + Add Date
          </button>
        )}
      </div>

      {toast && (
        <div className="bg-green-900/20 border border-green-700/40 text-green-300 px-4 py-2 rounded-lg mb-3 text-sm">
          {toast}
        </div>
      )}

      {adding && (
        <AddDateForm style={style} password={password} onSaved={onSaved} onCancel={() => setAdding(false)} />
      )}

      {list.length === 0 && !adding ? (
        <div className="text-[#9a8a72] text-sm bg-[#141008] border border-[#2a1f10] rounded-xl p-6 text-center">
          No {isSalsa ? 'Salsa' : 'Bachata'} dates scheduled.{' '}
          <button onClick={() => setAdding(true)} className="text-[#c8932a] hover:underline">Add one now →</button>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map(cls => (
            <ClassRow key={cls.id} cls={cls} password={password} onRemove={() => remove(cls.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminTrialClassesPage() {
  const { password } = useAdmin()
  const [classes, setClasses] = useState<TrialClass[]>([])

  async function load() {
    const res = await fetch('/api/trial-classes', { headers: { 'x-admin-password': password } })
    const data = await res.json()
    setClasses(data.classes || [])
  }

  useEffect(() => { if (password) load() }, [password])

  const salsa = classes.filter(c => c.style === 'salsa')
  const bachata = classes.filter(c => c.style === 'bachata')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Trial Classes</h1>
        <p className="text-[#9a8a72] text-sm mt-1">
          Dates added here appear live on the website immediately. Keep a rolling 4–6 weeks of upcoming dates.
        </p>
      </div>

      <StyleSection style="salsa" list={salsa} password={password} onRefresh={load} />
      <StyleSection style="bachata" list={bachata} password={password} onRefresh={load} />
    </div>
  )
}
