import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { hashPassword } from '@/lib/teacher-auth'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createServiceClient()
  const { data, error } = await db
    .from('teachers')
    .select('id, name, email, phone, bio, photo_url, is_active, created_at')
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ teachers: data ?? [] })
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { name, email, phone, bio, photo_url, password, is_active } = body
  if (!name || !email || !password) {
    return NextResponse.json({ error: 'name, email and password are required' }, { status: 400 })
  }
  const password_hash = await hashPassword(password)
  const db = createServiceClient()
  const { data, error } = await db
    .from('teachers')
    .insert({ name, email, phone, bio, photo_url, password_hash, is_active: !!is_active })
    .select('id, name, email, phone, bio, photo_url, is_active, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ teacher: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const { id, password, ...fields } = body
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const updates: Record<string, unknown> = {
    ...fields,
    updated_at: new Date().toISOString(),
  }
  if (password) updates.password_hash = await hashPassword(password)

  // Remove sensitive / non-column keys
  delete updates.id; delete updates.created_at

  const db = createServiceClient()
  const { data, error } = await db
    .from('teachers')
    .update(updates)
    .eq('id', id)
    .select('id, name, email, phone, bio, photo_url, is_active, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ teacher: data })
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  const db = createServiceClient()
  const { error } = await db.from('teachers').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
