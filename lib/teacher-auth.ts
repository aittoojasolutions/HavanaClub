import { scrypt, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'

const scryptAsync = promisify(scrypt)

// ── Password hashing (scrypt, no extra packages) ──────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const hash = (await scryptAsync(password, salt, 64)) as Buffer
  return `${salt}:${hash.toString('hex')}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  try {
    const [salt, hash] = stored.split(':')
    const derivedHash = (await scryptAsync(password, salt, 64)) as Buffer
    const storedHash = Buffer.from(hash, 'hex')
    return timingSafeEqual(derivedHash, storedHash)
  } catch {
    return false
  }
}

// ── Session tokens ────────────────────────────────────────────────────────────

import { createHash } from 'crypto'

export function generateSessionToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000 // 30 days
export const COOKIE_NAME = 'teacher_session'
