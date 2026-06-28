# Database Schema

RoastLab uses Neon Postgres (serverless) via `@neondatabase/serverless`.

## Tables

### `audits`

Stores every completed audit.

```sql
CREATE TABLE IF NOT EXISTS audits (
  id          SERIAL PRIMARY KEY,
  user_id     TEXT NOT NULL,
  url         TEXT NOT NULL,
  score       INTEGER NOT NULL,
  tier        TEXT NOT NULL DEFAULT 'free',
  dimensions  JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audits_user_id ON audits (user_id);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits (created_at DESC);
```

### Schema Notes

- `user_id` — Clerk user ID (format: `user_XXXXXXXXX`)
- `url` — full URL audited, or `"screenshot"` for screenshot-only audits
- `score` — 0–100 overall weighted score
- `tier` — `free`, `pro`, or `full`
- `dimensions` — JSONB array of `DimensionResult[]` (full AI output)

## Access Patterns

| Query | Function | Notes |
|-------|----------|-------|
| Get user's audits | `getUserAudits(userId, limit?)` | Ordered by `created_at DESC` |
| Get user's stats | `getUserStats(userId)` | Count + avg score |
| Get all audits | `getAllAudits(limit?)` | Admin only |
| Get global stats | `getGlobalStats()` | Admin only |
| Save new audit | `saveAudit(data)` | Called after every audit |

## Connection

Uses the **pooler** endpoint (`DATABASE_URL`) for serverless/edge functions. The **unpooled** endpoint (`DATABASE_URL_UNPOOLED`) is available for migrations.

Schema is auto-created on first call to `initSchema()` in `lib/db.ts`.
