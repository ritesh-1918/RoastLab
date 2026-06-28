# RoastLab — Dev Handoff

> AI-powered landing page audit. Users upload a screenshot or paste a URL → AI analyzes across 9 dimensions → streamed results → paywall for full report.

## Architecture

```
Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
Supabase (Postgres + Storage)   ← audit records + screenshots
Stripe Checkout (INR)           ← ₹2,499 one-time per full audit
5-provider AI fallback chain    ← OpenRouter×2 → Groq×2 → Gemini
microlink.io                    ← free URL→screenshot (100/day)
Vercel                          ← hosting, auto-deploy from main
```

### AI Fallback Chain
`OpenRouter-1` → `OpenRouter-2` → `Groq-1` → `Groq-2` → `Gemini`
Auto-retries on 429/5xx. Configured in `lib/ai/providers.ts`.

### Audit Flow
1. User uploads screenshot or pastes URL (`/`)
2. `POST /api/analyze` streams SSE events per dimension
3. Each completed dimension persists to `dimension_results` table
4. After free 3 dimensions → paywall card shown
5. `POST /api/stripe` creates Checkout session (₹2,499 INR)
6. Stripe webhook `POST /api/stripe/webhook` marks audit `paid=true`
7. Full report at `/report/[auditId]`

---

## Completed Features

- [x] Landing page (Hero, HowItWorks, ExampleAudit, AuditDimensions, Pricing, Footer)
- [x] Design tokens (dark-first, ember accent `#FF4D1C`, violet-biased surfaces)
- [x] framer-motion animations, BorderTrail, animated counter
- [x] AI backend: 9-dimension vision analysis with dimension-specific prompts
- [x] 5-provider fallback chain (OpenRouter×2, Groq×2, Gemini)
- [x] SSE streaming API (`/api/analyze`)
- [x] Supabase schema + migration file
- [x] Supabase Storage for screenshot uploads
- [x] microlink.io URL→screenshot (free tier)
- [x] Stripe Checkout (INR ₹2,499, test mode)
- [x] Stripe webhook handler (marks audit paid)
- [x] Audit fetch API (`/api/audit/[id]`)
- [x] Deployed to Vercel + GitHub auto-deploy enabled
- [x] All 7 env vars set on Vercel

---

## Remaining Tasks (Priority Order)

### P0 — Blocking (nothing works without these)
1. **Supabase project** — create project, run migration, add env vars
   - See "Supabase Setup" section below
2. **Stripe webhook secret** — get from Stripe Dashboard after creating webhook
   - Add as `STRIPE_WEBHOOK_SECRET` env var

### P1 — Core UX (product is incomplete without)
3. **`/analyze` page** — the actual analysis UI (progress screen with streaming results)
   - Shows each dimension card appearing as SSE events arrive
   - "Fix These First" section after 3 free dimensions
   - Paywall card to unlock full report
4. **`/report/[id]` page** — full report view
   - All dimension cards, score rings, findings list
   - Share button, PDF export

### P2 — Polish
5. Stripe live mode keys (swap test → live after testing)
6. Custom domain
7. URL screenshot upgrade (paid microlink or ScreenshotOne for higher limits)
8. Email receipt / report delivery

---

## Known Issues / Gotchas

| Issue | Notes |
|---|---|
| Supabase env vars are empty | App will crash on analyze until filled |
| Stripe webhook secret missing | Payments won't unlock audits until filled |
| Gemini key format `AQ.xxx` | Untested — may need different auth format for Google AI Studio |
| microlink 100/day limit | Fine for demo; upgrade to paid for production |
| Groq vision models | `llama-3.2-11b-vision-preview` may be deprecated — check Groq docs |

---

## Important Files

| File | Purpose |
|---|---|
| `lib/ai/providers.ts` | 5-provider fallback chain — edit to add/swap keys |
| `lib/ai/analyze.ts` | 9-dimension prompts + structured output parser |
| `app/api/analyze/route.ts` | SSE streaming endpoint |
| `app/api/stripe/route.ts` | Stripe Checkout session creation |
| `app/api/stripe/webhook/route.ts` | Stripe webhook → mark audit paid |
| `app/api/audit/[id]/route.ts` | Fetch audit + dimensions by ID |
| `lib/db/supabase.ts` | Supabase client + TypeScript types |
| `lib/screenshot.ts` | microlink URL→screenshot |
| `supabase/migrations/20240101000000_initial_schema.sql` | DB schema |
| `app/globals.css` | Design tokens (colors, spacing, motion) |

---

## Environment Variables

### Local (`.env.local`)
```
OPENROUTER_KEY_1=sk-or-v1-...
OPENROUTER_KEY_2=sk-or-v1-...
GROQ_KEY_1=gsk_...
GROQ_KEY_2=gsk_...
GEMINI_API_KEY=AQ....

STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...     ← fill after Stripe webhook setup

NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Vercel (already set)
AI keys (5) + Stripe keys (2) are already set via `vercel env add`.
**Still need to add:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_WEBHOOK_SECRET`.

---

## Supabase Setup (do this next)

```bash
# 1. Get access token from https://supabase.com/dashboard/account/tokens
# 2. Login
supabase login --token YOUR_ACCESS_TOKEN

# 3. Create new project (interactive)
supabase projects create roastlab --org-id YOUR_ORG_ID --region ap-south-1 --db-password YOUR_DB_PASSWORD

# 4. Link project
cd "C:\Projects\Software Projects\RoastLab"
supabase link --project-ref YOUR_PROJECT_REF

# 5. Push schema
supabase db push

# 6. Create storage bucket (screenshots)
# Either via Dashboard UI or add to migration

# 7. Get keys from Dashboard → Settings → API
# Add to .env.local and Vercel:
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

## Stripe Webhook Setup

```
Dashboard → Developers → Webhooks → Add endpoint
URL: https://roastlab-sooty.vercel.app/api/stripe/webhook
Events: checkout.session.completed

Copy "Signing secret" → add as STRIPE_WEBHOOK_SECRET
vercel env add STRIPE_WEBHOOK_SECRET production
```

---

## Dev Commands

```bash
npm run dev          # local dev server
npm run build        # production build check
vercel --prod        # manual production deploy
supabase db push     # push schema changes
supabase gen types typescript --local > lib/db/types.ts  # regenerate types
```

---

## Suggested First Prompt (next session)

```
Review HANDOFF.md. Supabase is now set up — env vars are in .env.local.
Build the /analyze page and /report/[id] page.

/analyze page:
- Accepts auditId from query param (?id=xxx) OR shows upload form if no id
- Connects to GET /api/analyze SSE stream
- Shows each dimension card sliding in as stream events arrive
- Score ring animation (SVG, stroke-dashoffset math from design system)
- After free 3 dims: show "Fix These First" + paywall card
- Paywall card triggers POST /api/stripe → redirects to Stripe Checkout

/report/[id] page:
- Fetches from GET /api/audit/[id]
- Shows full report if paid=true, else shows free dims + paywall
- Share button (copy link), PDF export button (placeholder)
- Use RoastLab design tokens and framer-motion for animations
```
