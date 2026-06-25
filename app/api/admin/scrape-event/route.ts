import { NextRequest, NextResponse } from 'next/server'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

function getMeta(html: string, property: string): string {
  // Matches both property="..." and name="..."
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, 'i'),
  ]
  for (const re of patterns) {
    const m = html.match(re)
    if (m?.[1]) return decodeHtmlEntities(m[1].trim())
  }
  return ''
}

function decodeHtmlEntities(str: string) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
}

function parseDateTime(iso: string) {
  if (!iso) return { date: '', time: '' }
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return { date: '', time: '' }
    const date = d.toISOString().split('T')[0]
    const time = d.toTimeString().slice(0, 5)
    return { date, time }
  } catch {
    return { date: '', time: '' }
  }
}

export async function POST(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch URL (${res.status})` }, { status: 400 })
    }

    const html = await res.text()

    const title = getMeta(html, 'og:title')
    const description = getMeta(html, 'og:description')
    const image = getMeta(html, 'og:image')
    const startRaw = getMeta(html, 'event:start_time')
    const endRaw = getMeta(html, 'event:end_time')
    const location = getMeta(html, 'event:location') || getMeta(html, 'og:locality')

    const start = parseDateTime(startRaw)
    const end = parseDateTime(endRaw)

    if (!title) {
      return NextResponse.json({ error: 'Could not read event details from this URL. The event may be private or require login.' }, { status: 422 })
    }

    return NextResponse.json({
      title,
      description,
      image_url: image,
      event_date: start.date,
      start_time: start.time || '18:00',
      end_time: end.time,
      location,
    })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ error: `Fetch failed: ${msg}` }, { status: 500 })
  }
}
