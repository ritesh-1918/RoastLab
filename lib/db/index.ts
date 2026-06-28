/**
 * Database client — Neon serverless Postgres.
 * Env var: DATABASE_URL (set automatically when you link Vercel Postgres / Neon storage)
 */

import { neon } from '@neondatabase/serverless';

export function getDb() {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type Audit = {
  id: string;
  created_at: string;
  url?: string;
  screenshot_url?: string;
  tier: 'free' | 'full';
  overall_score?: number;
  provider_used?: string;
  stripe_session_id?: string;
  paid: boolean;
};

export type Finding = {
  severity: 'critical' | 'high' | 'medium' | 'good';
  title: string;
  quote?: string;
  action: string;
};

export type DimensionResult = {
  id: string;
  audit_id: string;
  dimension: string;
  score?: number;
  summary?: string;
  findings: Finding[];
  created_at: string;
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function createAudit(params: {
  url?: string;
  screenshot_url?: string;
  tier: 'free' | 'full';
}): Promise<string> {
  const sql = getDb();
  const rows = await sql`
    INSERT INTO audits (url, screenshot_url, tier, paid)
    VALUES (${params.url ?? null}, ${params.screenshot_url ?? null}, ${params.tier}, ${params.tier === 'free'})
    RETURNING id
  `;
  return (rows[0] as { id: string }).id;
}

export async function saveDimensionResult(params: {
  audit_id: string;
  dimension: string;
  score: number;
  summary: string;
  findings: Finding[];
}): Promise<void> {
  const sql = getDb();
  await sql`
    INSERT INTO dimension_results (audit_id, dimension, score, summary, findings)
    VALUES (${params.audit_id}, ${params.dimension}, ${params.score}, ${params.summary}, ${JSON.stringify(params.findings)})
  `;
}

export async function updateAuditScore(id: string, score: number, provider: string): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE audits SET overall_score = ${score}, provider_used = ${provider} WHERE id = ${id}
  `;
}

export async function markAuditPaid(id: string, sessionId: string): Promise<void> {
  const sql = getDb();
  await sql`
    UPDATE audits SET paid = true, tier = 'full', stripe_session_id = ${sessionId} WHERE id = ${id}
  `;
}

export async function getAuditWithDimensions(id: string): Promise<{
  audit: Audit;
  dimensions: DimensionResult[];
} | null> {
  const sql = getDb();
  const audits = await sql`SELECT * FROM audits WHERE id = ${id}`;
  if (!audits.length) return null;

  const dims = await sql`
    SELECT * FROM dimension_results WHERE audit_id = ${id} ORDER BY created_at ASC
  `;

  return {
    audit: audits[0] as Audit,
    dimensions: dims as DimensionResult[],
  };
}
