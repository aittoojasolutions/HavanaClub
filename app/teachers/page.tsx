'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Teacher {
  id: string
  name: string
  bio: string | null
  photo_url: string | null
}

function Avatar({ teacher }: { teacher: Teacher }) {
  const initials = teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  if (teacher.photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={teacher.photo_url} alt={teacher.name}
        className="w-48 h-48 mx-auto rounded-full object-cover border-4 border-[#c8932a] shadow-lg" />
    )
  }
  return (
    <div className="w-48 h-48 mx-auto rounded-full bg-[#c8932a]/20 border-4 border-[#c8932a] flex items-center justify-center">
      <span className="text-4xl font-bold text-[#c8932a]">{initials}</span>
    </div>
  )
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/teachers')
      .then(r => r.json())
      .then(d => { setTeachers(d.teachers ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0805] pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-[#c8932a] uppercase tracking-widest text-sm font-semibold mb-3">The Team</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Meet Our Instructors</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Passionate dancers and dedicated teachers — our instructors bring years of professional experience to every class.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#c8932a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && teachers.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">Check back soon — instructor profiles coming shortly.</p>
          </div>
        )}

        {!loading && teachers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {teachers.map(t => (
              <div key={t.id} className="flex flex-col items-center text-center group">
                <div className="transition-transform group-hover:scale-105 duration-300">
                  <Avatar teacher={t} />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-white">{t.name}</h2>
                {t.bio && (
                  <p className="mt-3 text-gray-400 text-sm leading-relaxed max-w-xs">{t.bio}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <p className="text-gray-400 mb-5">Want to experience their teaching firsthand?</p>
          <Link
            href="/first-timers"
            className="inline-block bg-[#c8932a] text-black font-bold px-8 py-3 rounded-lg hover:bg-[#e0a830] transition-colors"
          >
            Book a Free Trial Class
          </Link>
        </div>
      </div>
    </main>
  )
}
