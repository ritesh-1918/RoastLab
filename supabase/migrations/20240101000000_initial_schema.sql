-- RoastLab schema for Neon / Vercel Postgres
-- Run: paste into Neon SQL editor or use psql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS audits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  url               TEXT,
  screenshot_url    TEXT,
  tier              TEXT DEFAULT 'free' CHECK (tier IN ('free', 'full')),
  overall_score     INTEGER,
  provider_used     TEXT,
  stripe_session_id TEXT,
  paid              BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS dimension_results (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id   UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
  dimension  TEXT NOT NULL,
  score      INTEGER,
  summary    TEXT,
  findings   JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dimension_results_audit_id ON dimension_results(audit_id);
