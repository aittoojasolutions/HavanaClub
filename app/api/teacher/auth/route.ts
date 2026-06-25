import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyPassword, generateSessionToken, hashToken, SESSION_DURATION_MS, COOKIE_NAME } from '@/lib/teacher-auth'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

  const db = createServiceClient()
  const { data: teacher, error } = await db
    .from('teachers')
    .select('id, name, email, phone, bio, photo_url, is_active, password_hash')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (error || !teacher) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const valid = await verifyPassword(password, teacher.password_hash)
  if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  // Create session
  const token = generateSessionToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

  await db.from('teacher_sessions').insert({
    teacher_id: teacher.id,
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  })

  // Clean up old expired sessions for this teacher
  await db.from('teacher_sessions')
    .delete()
    .eq('teacher_id', teacher.id)
    .lt('expires_at', new Date().toISOString())

  const { password_hash: _, ...safeTeacher } = teacher

  const res = NextResponse.json({ teacher: safeTeacher })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  })
  return res
}

export async function DELETE(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (token) {
    const db = createServiceClient()
    await db.from('teacher_sessions').delete().eq('token_hash', hashToken(token))
  }
  const res = NextResponse.json({ success: true })
  res.cookies.delete(COOKIE_NAME)
  return res
}
