'use client'
import { useState, useEffect, useRef } from 'react'
import { useAdmin } from '../layout'
import { DAY_LABELS, DAYS_ORDER, formatTime } from '@/lib/utils'

interface Teacher { id: string; name: string; photo_url: string | null }

function InstructorPicker({ value, onChange, password }: {
  value: string
  onChange: (v: string) => void
  password: string
}) {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!password) return
    fetch('/api/admin/teachers', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(d => setTeachers(d.teachers ?? []))
  }, [password])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = teachers.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  function selectTeacher(name: string) {
    onChange(name)
    setSearch('')
    setOpen(false)
    setCustom(false)
  }

  function enableCustom() {
    onChange('')
    setCustom(true)
    setOpen(false)
    setSearch('')
  }

  const initials = (name: string) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  if (custom) {
    return (
      <div className="space-y-2">
        <input
          required
          autoFocus
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Enter substitute name…"
          className="w-full bg-[#0a0805] border border-[#c8932a]/50 rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none"
        />
        <button type="button" onClick={() => { setCustom(false); onChange('') }}
          className="text-xs text-[#9a8a72] hover:text-[#c8932a] transition-colors">
          ← Back to teacher list
        </button>
      </div>
    )
  }

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full bg-[#0a0805] border rounded-lg px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${
          open ? 'border-[#c8932a]' : 'border-[#2a1f10] hover:border-[#c8932a]/40'
        }`}
      >
        {value ? (
          <>
            <div className="w-6 h-6 rounded-full bg-[#c8932a]/20 border border-[#c8932a]/30 flex items-center justify-center text-[#c8932a] text-xs font-bold flex-shrink-0">
              {initials(value)}
            </div>
            <span className="text-[#f5f0e8] flex-1">{value}</span>
          </>
        ) : (
          <span className="text-[#4a3a28] flex-1">Select instructor…</span>
        )}
        <svg className={`w-4 h-4 text-[#9a8a72] transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 top-full mt-1 w-full bg-[#141008] border border-[#2a1f10] rounded-xl shadow-2xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-[#2a1f10]">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search teachers…"
              className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none text-sm"
            />
          </div>

          <div className="max-h-52 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="px-4 py-3 text-[#9a8a72] text-sm">No teachers found</div>
            )}
            {filtered.map(t => (
              <button key={t.id} type="button" onClick={() => selectTeacher(t.name)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2a1f10]/50 transition-colors text-left">
                {t.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={t.photo_url} alt={t.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#c8932a]/20 border border-[#c8932a]/30 flex items-center justify-center text-[#c8932a] text-xs font-bold flex-shrink-0">
                    {initials(t.name)}
                  </div>
                )}
                <span className="text-[#f5f0e8] text-sm">{t.name}</span>
              </button>
            ))}
          </div>

          {/* Custom option */}
          <div className="border-t border-[#2a1f10]">
            <button type="button" onClick={enableCustom}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#2a1f10]/50 transition-colors text-left">
              <div className="w-7 h-7 rounded-full bg-[#2a1f10] border border-[#3a2f20] flex items-center justify-center text-[#9a8a72] text-xs flex-shrink-0">
                ✎
              </div>
              <div>
                <div className="text-[#9a8a72] text-sm font-medium">Custom / Substitution</div>
                <div className="text-[#4a3a28] text-xs">Type a name for a one-off substitute</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface ClassData {
  id: string
  title: string
  style: string
  instructor: string
  day_of_week: string
  start_time: string
  is_recurring: boolean
  is_pairwork: boolean
  leader_capacity: number | null
  follower_capacity: number | null
  general_capacity: number | null
  location: string
}

const emptyForm = {
  title: '',
  style: 'salsa',
  instructor: '',
  day_of_week: 'monday',
  start_time: '19:00',
  is_recurring: true,
  is_pairwork: false,
  leader_capacity: 10,
  follower_capacity: 10,
  general_capacity: 20,
  location: 'Main Studio',
}

export default function AdminClassesPage() {
  const { password } = useAdmin()
  const [classes, setClasses] = useState<ClassData[]>([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)

  function set(key: string, value: unknown) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function fetchClasses() {
    setLoading(true)
    const res = await fetch('/api/admin/classes', { headers: { 'x-admin-password': password } })
    const data = await res.json()
    setClasses(data.classes || [])
    setLoading(false)
  }

  async function saveClass(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/admin/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Failed to save'); setSaving(false); return }
    setSuccess(true)
    setForm(emptyForm)
    setShowForm(false)
    fetchClasses()
    setTimeout(() => setSuccess(false), 3000)
    setSaving(false)
  }

  async function deleteClass(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This will also delete all future instances and bookings.`)) return
    await fetch(`/api/admin/classes?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-password': password },
    })
    fetchClasses()
  }

  useEffect(() => { if (password) fetchClasses() }, [password])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Manage Classes</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-[#c8932a] text-[#0a0805] px-4 py-2 rounded-md text-sm font-bold hover:bg-[#a87820] transition-colors">
          {showForm ? 'Cancel' : '+ Add New Class'}
        </button>
      </div>

      {success && (
        <div className="bg-green-900/20 border border-green-700/40 text-green-300 px-4 py-3 rounded-lg mb-6 text-sm">
          ✓ Class created successfully! Instances generated for the next 8 weeks.
        </div>
      )}

      {/* Add Class Form */}
      {showForm && (
        <form onSubmit={saveClass} className="bg-[#141008] border border-[#c8932a]/30 rounded-2xl p-8 mb-10">
          <h2 className="text-xl font-bold mb-6">New Class</h2>

          {error && <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-[#9a8a72] mb-1">Class Title *</label>
              <input required value={form.title} onChange={e => set('title', e.target.value)}
                placeholder="e.g. Salsa Beginners"
                className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm text-[#9a8a72] mb-1">Dance Style *</label>
              <select value={form.style} onChange={e => set('style', e.target.value)}
                className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none">
                <option value="salsa">Salsa</option>
                <option value="bachata">Bachata</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#9a8a72] mb-1">Instructor *</label>
              <InstructorPicker value={form.instructor} onChange={v => set('instructor', v)} password={password} />
            </div>

            <div>
              <label className="block text-sm text-[#9a8a72] mb-1">Location</label>
              <input value={form.location} onChange={e => set('location', e.target.value)}
                className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none" />
            </div>

            <div>
              <label className="block text-sm text-[#9a8a72] mb-1">Day of Week *</label>
              <select value={form.day_of_week} onChange={e => set('day_of_week', e.target.value)}
                className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none">
                {DAYS_ORDER.map(d => <option key={d} value={d}>{DAY_LABELS[d]}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-[#9a8a72] mb-1">Start Time *</label>
              <input type="time" required value={form.start_time} onChange={e => set('start_time', e.target.value)}
                className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none" />
              <div className="text-xs text-[#9a8a72] mt-1">Duration is always 1h 30min</div>
            </div>
          </div>

          {/* Toggles */}
          <div className="mt-6 flex flex-col sm:flex-row gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={form.is_recurring} onChange={e => set('is_recurring', e.target.checked)} />
                <div className={`w-11 h-6 rounded-full transition-colors ${form.is_recurring ? 'bg-[#c8932a]' : 'bg-[#2a1f10]'}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.is_recurring ? 'translate-x-5' : ''}`} />
              </div>
              <div>
                <div className="font-medium text-sm">Recurring Class</div>
                <div className="text-xs text-[#9a8a72]">Repeats every week at the same time</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={form.is_pairwork} onChange={e => set('is_pairwork', e.target.checked)} />
                <div className={`w-11 h-6 rounded-full transition-colors ${form.is_pairwork ? 'bg-[#c8932a]' : 'bg-[#2a1f10]'}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.is_pairwork ? 'translate-x-5' : ''}`} />
              </div>
              <div>
                <div className="font-medium text-sm">Pairwork Class</div>
                <div className="text-xs text-[#9a8a72]">Students enroll as Leader or Follower</div>
              </div>
            </label>
          </div>

          {/* Capacity */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {form.is_pairwork ? (
              <>
                <div>
                  <label className="block text-sm text-[#9a8a72] mb-1">Leader Spots</label>
                  <input type="number" min={1} max={50} value={form.leader_capacity} onChange={e => set('leader_capacity', parseInt(e.target.value))}
                    className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#9a8a72] mb-1">Follower Spots</label>
                  <input type="number" min={1} max={50} value={form.follower_capacity} onChange={e => set('follower_capacity', parseInt(e.target.value))}
                    className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none" />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm text-[#9a8a72] mb-1">Total Spots</label>
                <input type="number" min={1} max={100} value={form.general_capacity} onChange={e => set('general_capacity', parseInt(e.target.value))}
                  className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none" />
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <button type="submit" disabled={saving}
              className="bg-[#c8932a] text-[#0a0805] px-8 py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
              {saving ? 'Saving…' : 'Create Class'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-8 py-3 rounded-lg border border-[#2a1f10] text-[#9a8a72] hover:text-[#f5f0e8] transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Existing classes */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-[#9a8a72]">All Classes ({classes.length})</h2>
        {loading ? (
          <div className="text-[#9a8a72]">Loading…</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {classes.map(cls => (
              <div key={cls.id} className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-bold">{cls.title}</div>
                    <div className="text-[#9a8a72] text-sm">{DAY_LABELS[cls.day_of_week]} · {formatTime(cls.start_time)}</div>
                  </div>
                  <div className="flex gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      cls.style === 'salsa' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'
                    }`}>{cls.style}</span>
                    {cls.is_pairwork && <span className="text-xs px-2 py-0.5 rounded-full bg-[#c8932a]/10 text-[#c8932a] border border-[#c8932a]/20">Pairwork</span>}
                    {cls.is_recurring && <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a1f10] text-[#9a8a72]">Recurring</span>}
                  </div>
                </div>
                <div className="text-[#9a8a72] text-sm">
                  👤 {cls.instructor} · 📍 {cls.location}
                  {cls.is_pairwork
                    ? ` · ${cls.leader_capacity}L / ${cls.follower_capacity}F`
                    : ` · ${cls.general_capacity} spots`}
                </div>
                <button onClick={() => deleteClass(cls.id, cls.title)}
                  className="mt-3 text-xs text-red-400 hover:text-red-300 hover:underline">
                  Delete class
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
