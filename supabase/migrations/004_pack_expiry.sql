-- Add pack expiry tracking to customers table
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS pack_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pack_credits_lapsed INTEGER NOT NULL DEFAULT 0;
