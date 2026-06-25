'use client'
import { useState, useEffect, useRef } from 'react'
import { useAdmin } from '../layout'

interface Teacher {
  id: string
  name: string
  email: string
  phone: string
  bio: string
  photo_url: string
  is_active: boolean
  created_at: string
}

const EMPTY: Omit<Teacher, 'id' | 'created_at'> & { password: string } = {
  name: '', email: '', phone: '', bio: '', photo_url: '', is_active: false, password: '',
}

function Avatar({ teacher, size = 48 }: { teacher: Partial<Teacher>; size?: number }) {
  const initials = (teacher.name || '?').trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
  if (teacher.photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={teacher.photo_url} alt={teacher.name ?? ''} className="rounded-full object-cover flex-shrink-0"
        style={{ width: size, height: size }} />
    )
  }
  return (
    <div className="rounded-full bg-[#c8932a]/15 border border-[#c8932a]/30 flex items-center justify-center flex-shrink-0 text-[#c8932a] font-bold"
      style={{ width: size, height: size, fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

function PhotoUpload({ value, onChange, password }: { value: string; onChange: (url: string) => void; password: string }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/teachers/upload', {
      method: 'POST',
      headers: { 'x-admin-password': password },
      body: formData,
    })
    const text = await res.text()
    let data: { error?: string; url?: string } = {}
    try { data = JSON.parse(text) } catch { setError(`Upload failed: ${text.slice(0, 100)}`); setUploading(false); return }
    if (!res.ok) { setError(data.error ?? 'Upload failed'); setUploading(false); return }
    if (data.url) onChange(data.url)
    setUploading(false)
  }

  return (
    <div>
      <label className="block text-xs text-[#9a8a72] mb-2">Photo</label>
      <div className="flex items-center gap-3">
        <Avatar teacher={{ photo_url: value, name: '' }} size={56} />
        <div className="flex-1">
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="text-sm border border-[#2a1f10] rounded-lg px-3 py-1.5 text-[#9a8a72] hover:text-[#f5f0e8] hover:border-[#c8932a]/40 transition-colors disabled:opacity-50">
            {uploading ? 'Uploading…' : value ? 'Change photo' : 'Upload photo'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')}
              className="ml-2 text-xs text-red-400 hover:text-red-300">Remove</button>
          )}
          {error && <div className="text-xs text-red-400 mt-1">{error}</div>}
          <div className="text-xs text-[#9a8a72] mt-1">JPG, PNG or WebP · max 10MB</div>
        </div>
      </div>
      {/* Or paste URL */}
      <div className="mt-2">
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="…or paste an image URL"
          className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none text-xs" />
      </div>
    </div>
  )
}

function TeacherForm({ initial, onSave, onCancel, password, isEdit }: {
  initial: typeof EMPTY & { id?: string }
  onSave: (t: Teacher) => void
  onCancel: () => void
  password: string
  isEdit: boolean
}) {
  const [form, setForm] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(k: string, v: unknown) { setForm(f => ({ ...f, [k]: v })) }

  async function save(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('')
    const method = isEdit ? 'PATCH' : 'POST'
    const body = { ...form }
    if (isEdit && !body.password) delete (body as Record<string, unknown>).password // don't send empty password on edit
    const res = await fetch('/api/admin/teachers', {
      method,
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error); setSaving(false); return }
    onSave(data.teacher)
  }

  return (
    <form onSubmit={save} className="bg-[#141008] border border-[#c8932a]/20 rounded-2xl p-6 mb-6 space-y-4">
      <h3 className="font-bold text-lg">{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</h3>
      {error && <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>}

      <PhotoUpload value={form.photo_url} onChange={url => set('photo_url', url)} password={password} />

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Full Name *</label>
          <input required value={form.name} onChange={e => set('name', e.target.value)} placeholder="Carlos Medina"
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Email *</label>
          <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="carlos@example.com"
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Phone</label>
          <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+358 40 123 4567"
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">
            {isEdit ? 'New Password' : 'Password *'}
            {isEdit && <span className="text-[#9a8a72] font-normal"> (leave blank to keep current)</span>}
          </label>
          <input type="password" required={!isEdit} value={form.password} onChange={e => set('password', e.target.value)}
            placeholder={isEdit ? 'Leave blank to keep' : 'Set login password'}
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-xs text-[#9a8a72] mb-1">Bio <span className="font-normal">(shown publicly when active)</span></label>
        <textarea rows={3} value={form.bio} onChange={e => set('bio', e.target.value)}
          placeholder="Carlos has been teaching Salsa for 10 years, trained in Cali Colombia…"
          className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm resize-none" />
      </div>

      {/* Active toggle */}
      <label className="flex items-center gap-3 cursor-pointer">
        <div className="relative flex-shrink-0">
          <input type="checkbox" className="sr-only" checked={form.is_active} onChange={e => set('is_active', e.target.checked)} />
          <div className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-[#c8932a]' : 'bg-[#2a1f10]'}`} />
          <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-4' : ''}`} />
        </div>
        <div>
          <span className="text-sm font-medium text-[#f5f0e8]">Show on website</span>
          <span className="text-xs text-[#9a8a72] ml-2">
            {form.is_active ? 'Photo, name & bio visible to customers' : 'Hidden from customer-facing pages'}
          </span>
        </div>
      </label>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
          className="bg-[#c8932a] text-[#0a0805] px-6 py-2.5 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Teacher'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-6 py-2.5 rounded-lg border border-[#2a1f10] text-[#9a8a72] hover:text-[#f5f0e8] transition-colors">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function AdminTeachersPage() {
  const { password } = useAdmin()
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [toast, setToast] = useState('')

  function showToast(msg: string) { setToast(msg); setTimeout(() => setToast(''), 3000) }

  async function load() {
    const res = await fetch('/api/admin/teachers', { headers: { 'x-admin-password': password } })
    const data = await res.json()
    setTeachers(data.teachers ?? [])
    setLoading(false)
  }

  async function toggleActive(t: Teacher) {
    await fetch('/api/admin/teachers', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: t.id, is_active: !t.is_active }),
    })
    setTeachers(ts => ts.map(x => x.id === t.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function deleteTeacher(t: Teacher) {
    if (!confirm(`Remove ${t.name}? This cannot be undone.`)) return
    await fetch(`/api/admin/teachers?id=${t.id}`, {
      method: 'DELETE', headers: { 'x-admin-password': password },
    })
    setTeachers(ts => ts.filter(x => x.id !== t.id))
    showToast('Teacher removed')
  }

  function onSaved(t: Teacher) {
    if (editing) {
      setTeachers(ts => ts.map(x => x.id === t.id ? t : x))
      setEditing(null)
    } else {
      setTeachers(ts => [...ts, t])
      setShowForm(false)
    }
    showToast(editing ? 'Changes saved' : `${t.name} added`)
  }

  useEffect(() => { if (password) load() }, [password])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Teachers</h1>
          <p className="text-[#9a8a72] text-sm mt-0.5">
            Teachers can log in at <code className="bg-[#141008] px-1 rounded">/teacher/login</code> to see their schedule and salary.
          </p>
        </div>
        {!showForm && !editing && (
          <button onClick={() => setShowForm(true)}
            className="bg-[#c8932a] text-[#0a0805] px-4 py-2 rounded-lg font-bold text-sm hover:bg-[#a87820] transition-colors">
            + Add Teacher
          </button>
        )}
      </div>

      {toast && (
        <div className="bg-green-900/20 border border-green-700/40 text-green-300 px-4 py-2 rounded-lg mb-4 text-sm">
          ✓ {toast}
        </div>
      )}

      {showForm && (
        <TeacherForm
          initial={{ ...EMPTY }}
          onSave={onSaved}
          onCancel={() => setShowForm(false)}
          password={password}
          isEdit={false}
        />
      )}

      {editing && (
        <TeacherForm
          initial={{ ...EMPTY, ...editing, password: '' }}
          onSave={onSaved}
          onCancel={() => setEditing(null)}
          password={password}
          isEdit={true}
        />
      )}

      {loading ? (
        <div className="text-[#9a8a72] text-sm py-8 text-center">Loading…</div>
      ) : teachers.length === 0 && !showForm ? (
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-12 text-center text-[#9a8a72]">
          <div className="text-4xl mb-3">🎤</div>
          <p className="mb-3">No teachers yet.</p>
          <button onClick={() => setShowForm(true)}
            className="text-[#c8932a] hover:underline text-sm">Add your first teacher →</button>
        </div>
      ) : (
        <div className="space-y-3">
          {teachers.map(t => (
            <div key={t.id} className={`bg-[#141008] border rounded-2xl p-5 flex items-center gap-4 transition-all ${t.is_active ? 'border-[#c8932a]/20' : 'border-[#2a1f10]'}`}>
              <Avatar teacher={t} size={52} />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-[#f5f0e8]">{t.name}</span>
                  {t.is_active && (
                    <span className="text-xs bg-green-900/30 text-green-300 border border-green-700/30 px-2 py-0.5 rounded-full font-semibold">
                      Live on site
                    </span>
                  )}
                </div>
                <div className="text-[#9a8a72] text-sm">{t.email}{t.phone ? ` · ${t.phone}` : ''}</div>
                {t.bio && (
                  <div className="text-[#9a8a72] text-xs mt-1 line-clamp-1">{t.bio}</div>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Active toggle */}
                <button onClick={() => toggleActive(t)} title={t.is_active ? 'Hide from website' : 'Show on website'}
                  className={`relative w-10 h-6 rounded-full transition-colors flex-shrink-0 ${t.is_active ? 'bg-[#c8932a]' : 'bg-[#2a1f10]'}`}>
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${t.is_active ? 'translate-x-4' : ''}`} />
                </button>

                <button onClick={() => { setEditing(t); setShowForm(false) }}
                  className="text-xs text-[#9a8a72] hover:text-[#c8932a] border border-[#2a1f10] hover:border-[#c8932a]/30 rounded-lg px-3 py-1.5 transition-colors">
                  Edit
                </button>
                <button onClick={() => deleteTeacher(t)}
                  className="text-xs text-[#9a8a72] hover:text-red-400 transition-colors">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info box */}
      {teachers.length > 0 && (
        <div className="mt-6 bg-[#141008] border border-[#2a1f10] rounded-xl p-4 text-xs text-[#9a8a72]">
          <strong className="text-[#f5f0e8]">Salary sync:</strong> The salary tab matches classes to teachers by name.
          Make sure the <strong className="text-[#f5f0e8]">instructor name in each class</strong> matches the teacher name here exactly.
        </div>
      )}
    </div>
  )
}
