'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg text-center">
        <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-4">Something went wrong</p>
        <h2 className="text-2xl font-bold mb-4">{error.message || 'Unexpected error'}</h2>
        <pre className="text-left text-xs bg-[#141008] border border-[#2a1f10] rounded-xl p-4 mb-6 overflow-auto text-[#9a8a72]">
          {error.stack}
        </pre>
        <button
          onClick={reset}
          className="bg-[#c8932a] text-[#0a0805] px-6 py-2 rounded-lg font-bold hover:bg-[#a87820] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}
