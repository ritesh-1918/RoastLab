/**
 * Simple in-memory rate limiter.
 * Resets every 24h per IP. Max 5 free audits per IP per day.
 * Works on Vercel serverless (resets on cold start, but good enough for abuse prevention).
 */

const FREE_LIMIT = 5;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24h

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  let entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    store.set(ip, entry);
  }

  if (entry.count >= FREE_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: FREE_LIMIT - entry.count, resetAt: entry.resetAt };
}

export function getClientIp(req: Request): string {
  const headers = new Headers((req as Request).headers);
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}
