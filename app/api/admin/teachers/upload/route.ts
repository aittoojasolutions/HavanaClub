import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  try {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const allowed = ['jpg', 'jpeg', 'png', 'webp']
  if (!allowed.includes(ext)) return NextResponse.json({ error: 'Only JPG, PNG, WebP allowed' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Max file size is 10MB' }, { status: 400 })

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const db = createServiceClient()
  const { error } = await db.storage
    .from('teachers')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) {
    // Bucket might not exist yet — give a clear message
    if (error.message?.includes('Bucket not found') || error.message?.includes('bucket')) {
      return NextResponse.json({
        error: 'Storage bucket "teachers" not found. Create it in Supabase Dashboard → Storage → New bucket → name: "teachers", Public: on'
      }, { status: 500 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = db.storage.from('teachers').getPublicUrl(fileName)
  return NextResponse.json({ url: urlData.publicUrl })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
