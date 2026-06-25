'use client'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body style={{ background: '#0a0805', color: '#f5f0e8', fontFamily: 'sans-serif', padding: '2rem', minHeight: '100vh' }}>
        <p style={{ color: '#c8932a', fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '1rem' }}>Error</p>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>{error?.message || 'Unknown error'}</h2>
        <pre style={{ background: '#141008', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.75rem', color: '#9a8a72', overflow: 'auto', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
          {error?.stack}
        </pre>
        <button onClick={reset} style={{ background: '#c8932a', color: '#0a0805', padding: '0.5rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', cursor: 'pointer', border: 'none' }}>
          Try again
        </button>
      </body>
    </html>
  )
}
