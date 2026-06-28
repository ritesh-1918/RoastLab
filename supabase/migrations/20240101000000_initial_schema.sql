-- RoastLab initial schema
-- Run: supabase db push

-- ─── Audits ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audits (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  url               TEXT,
  screenshot_path   TEXT,            -- Supabase Storage: screenshots/bucket
  tier              TEXT DEFAULT 'free' CHECK (tier IN ('free', 'full')),
  overall_score     INTEGER,
  provider_used     TEXT,
  stripe_session_id TEXT,
  paid              BOOLEAN DEFAULT false
);

-- ─── Dimension results ────────────────────────────────────────────────────────
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

-- ─── Row-level security (public read for reports) ─────────────────────────────
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE dimension_results ENABLE ROW LEVEL SECURITY;

-- Anyone can read any audit (reports are publicly shareable by ID)
CREATE POLICY "audits_public_read" ON audits FOR SELECT USING (true);
CREATE POLICY "dimension_results_public_read" ON dimension_results FOR SELECT USING (true);

-- Only service role can insert/update (API uses service role key)
CREATE POLICY "audits_service_insert" ON audits FOR INSERT WITH CHECK (true);
CREATE POLICY "audits_service_update" ON audits FOR UPDATE USING (true);
CREATE POLICY "dimension_results_service_insert" ON dimension_results FOR INSERT WITH CHECK (true);
