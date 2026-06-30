/**
 * Neon Postgres client.
 * DATABASE_URL must be set via Vercel Storage → Neon → copy POSTGRES_URL.
 * Schema auto-creates on first call.
 */

import { neon } from '@neondatabase/serverless';

let _sql: ReturnType<typeof neon> | null = null;

function getDb() {
  // Vercel Neon integration prefixes vars with project name (roastlab_)
  const url = process.env.DATABASE_URL
    ?? process.env.roastlab_DATABASE_URL
    ?? process.env.POSTGRES_URL
    ?? process.env.roastlab_POSTGRES_URL;
  if (!url || url.trim() === '') return null;
  if (!_sql) _sql = neon(url);
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

  await sql`
    CREATE TABLE IF NOT EXISTS email_logs (
      id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      user_id     TEXT        NOT NULL,
      email       TEXT        NOT NULL,
      subject     TEXT        NOT NULL,
      url         TEXT        NOT NULL,
      score       INTEGER     NOT NULL,
      tier        TEXT        NOT NULL DEFAULT 'free',
      sent_at     TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS email_logs_user_id_idx ON email_logs(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS email_logs_sent_at_idx ON email_logs(sent_at DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS api_usage (
      id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      audit_id     TEXT,
      user_id      TEXT,
      provider     TEXT        NOT NULL,
      model        TEXT        NOT NULL,
      dimension    TEXT,
      tokens_in    INTEGER     NOT NULL DEFAULT 0,
      tokens_out   INTEGER     NOT NULL DEFAULT 0,
      latency_ms   INTEGER,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS api_usage_audit_idx ON api_usage(audit_id)`;
  await sql`CREATE INDEX IF NOT EXISTS api_usage_created_at_idx ON api_usage(created_at DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS settings (
      key         TEXT        PRIMARY KEY,
      value       TEXT        NOT NULL,
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;
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

export async function getAuditById(id: string): Promise<AuditRow | null> {
  const sql = getDb();
  if (!sql) return null;
  try {
    await initSchema();
    const rows = await sql`
      SELECT id, user_id, url, score, tier, dimensions, created_at
      FROM audits WHERE id = ${id} LIMIT 1
    ` as unknown as AuditRow[];
    return rows[0] ?? null;
  } catch (e) {
    console.error('[db] getAuditById error:', e);
    return null;
  }
}

// alias used by /api/audit/[id]
export const getAuditWithDimensions = getAuditById;

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

/* ─── Email log ─────────────────────────────────────────────────────────────── */
export async function logEmail(opts: {
  userId: string; email: string; subject: string;
  url: string; score: number; tier: string;
}): Promise<void> {
  const sql = getDb();
  if (!sql) return;
  try {
    await initSchema();
    await sql`
      INSERT INTO email_logs (user_id, email, subject, url, score, tier)
      VALUES (${opts.userId}, ${opts.email}, ${opts.subject}, ${opts.url}, ${opts.score}, ${opts.tier})
    `;
  } catch (e) {
    console.error('[db] logEmail error:', e);
  }
}

export async function getEmailLogs(limit = 100) {
  const sql = getDb();
  if (!sql) return [];
  try {
    await initSchema();
    return await sql`
      SELECT id, user_id, email, subject, url, score, tier, sent_at
      FROM email_logs ORDER BY sent_at DESC LIMIT ${limit}
    ` as unknown as { id: string; user_id: string; email: string; subject: string; url: string; score: number; tier: string; sent_at: string }[];
  } catch (e) {
    console.error('[db] getEmailLogs error:', e);
    return [];
  }
}

/* ─── API usage tracking ────────────────────────────────────────────────────── */
export async function logApiUsage(opts: {
  auditId?: string; userId?: string; provider: string; model: string;
  dimension?: string; tokensIn: number; tokensOut: number; latencyMs?: number;
}): Promise<void> {
  const sql = getDb();
  if (!sql) return;
  try {
    await initSchema();
    await sql`
      INSERT INTO api_usage (audit_id, user_id, provider, model, dimension, tokens_in, tokens_out, latency_ms)
      VALUES (${opts.auditId ?? null}, ${opts.userId ?? null}, ${opts.provider}, ${opts.model},
              ${opts.dimension ?? null}, ${opts.tokensIn}, ${opts.tokensOut}, ${opts.latencyMs ?? null})
    `;
  } catch (e) {
    console.error('[db] logApiUsage error:', e);
  }
}

export async function getApiUsageStats() {
  const sql = getDb();
  if (!sql) return { totalTokensIn: 0, totalTokensOut: 0, byProvider: [] as { provider: string; model: string; calls: number; tokens_in: number; tokens_out: number }[], totalCalls: 0 };
  try {
    await initSchema();
    const rows = await sql`
      SELECT provider, model,
             COUNT(*)::INT AS calls,
             SUM(tokens_in)::INT AS tokens_in,
             SUM(tokens_out)::INT AS tokens_out
      FROM api_usage
      GROUP BY provider, model
      ORDER BY calls DESC
    ` as unknown as { provider: string; model: string; calls: number; tokens_in: number; tokens_out: number }[];
    const totIn = rows.reduce((s, r) => s + (r.tokens_in ?? 0), 0);
    const totOut = rows.reduce((s, r) => s + (r.tokens_out ?? 0), 0);
    const totCalls = rows.reduce((s, r) => s + (r.calls ?? 0), 0);
    return { totalTokensIn: totIn, totalTokensOut: totOut, byProvider: rows, totalCalls: totCalls };
  } catch (e) {
    console.error('[db] getApiUsageStats error:', e);
    return { totalTokensIn: 0, totalTokensOut: 0, byProvider: [], totalCalls: 0 };
  }
}

/* ─── Settings (prompt customization) ──────────────────────────────────────── */
export async function getSetting(key: string): Promise<string | null> {
  const sql = getDb();
  if (!sql) return null;
  try {
    await initSchema();
    const rows = await sql`SELECT value FROM settings WHERE key = ${key}` as unknown as { value: string }[];
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const sql = getDb();
  if (!sql) return;
  try {
    await initSchema();
    await sql`
      INSERT INTO settings (key, value) VALUES (${key}, ${value})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
    `;
  } catch (e) {
    console.error('[db] setSetting error:', e);
  }
}

export async function getAllSettings(): Promise<{ key: string; value: string; updated_at: string }[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    await initSchema();
    return await sql`SELECT key, value, updated_at FROM settings ORDER BY key` as unknown as { key: string; value: string; updated_at: string }[];
  } catch {
    return [];
  }
}

export async function getAdminStats() {
  const sql = getDb();
  if (!sql) return { totalAudits: 0, uniqueUsers: 0, avgScore: null as number | null, totalEmails: 0, freeAudits: 0, fullAudits: 0, todayAudits: 0 };
  try {
    await initSchema();
    const [main, emailCount, today] = await Promise.all([
      sql`SELECT COUNT(*)::INT AS total, COUNT(DISTINCT user_id)::INT AS users,
               ROUND(AVG(score))::INT AS avg,
               COUNT(*) FILTER (WHERE tier='free')::INT AS free_count,
               COUNT(*) FILTER (WHERE tier='full')::INT AS full_count
          FROM audits` as unknown as Promise<{ total: number; users: number; avg: number | null; free_count: number; full_count: number }[]>,
      sql`SELECT COUNT(*)::INT AS cnt FROM email_logs` as unknown as Promise<{ cnt: number }[]>,
      sql`SELECT COUNT(*)::INT AS cnt FROM audits WHERE created_at > NOW() - INTERVAL '24 hours'` as unknown as Promise<{ cnt: number }[]>,
    ]);
    const r = main[0];
    return {
      totalAudits: r.total ?? 0,
      uniqueUsers: r.users ?? 0,
      avgScore: r.avg,
      totalEmails: emailCount[0]?.cnt ?? 0,
      freeAudits: r.free_count ?? 0,
      fullAudits: r.full_count ?? 0,
      todayAudits: today[0]?.cnt ?? 0,
    };
  } catch (e) {
    console.error('[db] getAdminStats error:', e);
    return { totalAudits: 0, uniqueUsers: 0, avgScore: null, totalEmails: 0, freeAudits: 0, fullAudits: 0, todayAudits: 0 };
  }
}
