/**
 * Neon Postgres client.
 * DATABASE_URL must be set via Vercel Storage → Neon → copy POSTGRES_URL.
 * Schema auto-creates on first call.
 */

import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

function getDb() {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
    return null;
  }
  if (!_sql) {
    _sql = neon(process.env.DATABASE_URL);
  }
  return _sql;
}

export async function initSchema() {
  const sql = getDb();
  if (!sql) return;
  await sql`
    CREATE TABLE IF NOT EXISTS audits (
      id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      user_id     TEXT        NOT NULL,
      url         TEXT        NOT NULL,
      score       INTEGER     NOT NULL,
      tier        TEXT        NOT NULL DEFAULT 'free',
      dimensions  JSONB       NOT NULL DEFAULT '[]'::JSONB,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS audits_user_id_idx ON audits(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS audits_created_at_idx ON audits(created_at DESC)`;
}

export interface AuditRow {
  id: string;
  user_id: string;
  url: string;
  score: number;
  tier: string;
  dimensions: object[];
  created_at: string;
}

export async function saveAudit(opts: {
  userId: string;
  url: string;
  score: number;
  tier: string;
  dimensions: object[];
}): Promise<string | null> {
  const sql = getDb();
  if (!sql) return null;
  try {
    await initSchema();
    const rows = await sql`
      INSERT INTO audits (user_id, url, score, tier, dimensions)
      VALUES (${opts.userId}, ${opts.url}, ${opts.score}, ${opts.tier}, ${JSON.stringify(opts.dimensions)}::JSONB)
      RETURNING id
    ` as unknown as { id: string }[];
    return rows[0]?.id ?? null;
  } catch (e) {
    console.error('[db] saveAudit error:', e);
    return null;
  }
}

export async function getUserAudits(userId: string, limit = 20): Promise<AuditRow[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    await initSchema();
    const rows = await sql`
      SELECT id, user_id, url, score, tier, dimensions, created_at
      FROM audits
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    ` as unknown as AuditRow[];
    return rows;
  } catch (e) {
    console.error('[db] getUserAudits error:', e);
    return [];
  }
}

export async function getUserStats(userId: string) {
  const sql = getDb();
  if (!sql) return { count: 0, avgScore: null as number | null };
  try {
    await initSchema();
    const rows = await sql`
      SELECT COUNT(*)::INT AS count, ROUND(AVG(score))::INT AS avg_score
      FROM audits
      WHERE user_id = ${userId}
    ` as unknown as { count: number; avg_score: number | null }[];
    const r = rows[0];
    return { count: r.count ?? 0, avgScore: r.avg_score };
  } catch (e) {
    console.error('[db] getUserStats error:', e);
    return { count: 0, avgScore: null };
  }
}

export async function getAllAudits(limit = 50): Promise<AuditRow[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    await initSchema();
    const rows = await sql`
      SELECT id, user_id, url, score, tier, dimensions, created_at
      FROM audits
      ORDER BY created_at DESC
      LIMIT ${limit}
    ` as unknown as AuditRow[];
    return rows;
  } catch (e) {
    console.error('[db] getAllAudits error:', e);
    return [];
  }
}

export async function getGlobalStats() {
  const sql = getDb();
  if (!sql) return { totalAudits: 0, avgScore: null as number | null, uniqueUsers: 0 };
  try {
    await initSchema();
    const rows = await sql`
      SELECT
        COUNT(*)::INT AS total_audits,
        ROUND(AVG(score))::INT AS avg_score,
        COUNT(DISTINCT user_id)::INT AS unique_users
      FROM audits
    ` as unknown as { total_audits: number; avg_score: number | null; unique_users: number }[];
    const r = rows[0];
    return { totalAudits: r.total_audits ?? 0, avgScore: r.avg_score, uniqueUsers: r.unique_users ?? 0 };
  } catch (e) {
    console.error('[db] getGlobalStats error:', e);
    return { totalAudits: 0, avgScore: null, uniqueUsers: 0 };
  }
}
