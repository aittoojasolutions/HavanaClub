'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('cookie-notice-dismissed')
    if (!dismissed) setVisible(true)
  }, [])

  function dismiss() {
    localStorage.setItem('cookie-notice-dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#141008] border-t border-[#2a1f10] px-4 py-4 md:py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-[#9a8a72] text-sm leading-relaxed max-w-2xl">
          We use only essential cookies to keep the site working — no tracking, no advertising.{' '}
          <Link href="/privacy" className="text-[#c8932a] hover:underline">Privacy Policy</Link>
        </p>
        <button
          onClick={dismiss}
          className="flex-shrink-0 bg-[#c8932a] text-[#0a0805] text-sm font-bold px-5 py-2 rounded-lg hover:bg-[#a87820] transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}
