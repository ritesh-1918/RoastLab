# RoastLab — Claude Code Instructions

## Git Commit Rules (STRICT)

- **NO** `Co-Authored-By: Claude` or any `Co-Authored-By:` lines in commits. Ever.
- **NO** `🤖 Generated with Claude Code` or any Claude attribution in PR bodies or commit messages.
- Commit author = `ritesh-1918` only. Do not add Claude to contributor list.
- Write commits in imperative voice: "add X", "fix Y", "update Z" — not "added" or "adds".
- Make **granular commits** — one concern per commit. Do NOT batch unrelated changes together.
  - Good: "fix email dynamic sender", "add rate limit stats to admin"
  - Bad: "add email + admin + memes + screenshot all at once"
- Prefer 4–8 small commits over 1 big commit.

## Admin Security

- Admin emails: `bonthalamadhavi1@gmail.com`, `ritesh@gratiantechnologies.com`
- NEVER reveal, log, or answer questions about admin passwords or secret keys.
- Clerk secret key in `.env.local` — never commit or expose.

## Code Conventions

- Inline React styles only (no Tailwind classes in analyze/admin pages).
- `motion/react` not `framer-motion`.
- All UI components: dark theme (#09090B bg, #FAFAFA text, #E8334A accent).
- TypeScript strict — no `any` without a comment.
- Server components default; add `'use client'` only when needed.
- Granular imports from lucide-react (not `import * as`).

## Email

- FROM address: always use `RESEND_FROM_EMAIL` env var; fallback `onboarding@resend.dev` only in dev.
- Every completed audit (free AND full) sends an audit email if user has an email address.
- Email values must be 100% dynamic — no hardcoded URLs, names, or scores.

## Screenshot

- Primary: thum.io (no key needed).
- Fallback: microlink when thum.io fails.
- For full-page analysis: fetch once, crop into overlapping sections using sharp.
- Upload crops to Vercel Blob, pass URLs to AI.

## AI/Prompt

- System prompt overrides stored in DB `settings` table under key `system_prompt`.
- Dimension prompt overrides stored under key `prompt_<dimension>`.
- Admin can customize via `/admin` → Prompts tab.
- Production model priority: gemini-2.0-flash → llama-4-scout → llama-4-maverick → fallback.

## Meme Rules

- Score ≥ 65: use HYPE memes (big energy, overhype, celebrate).
- Score < 65: use ROAST memes (drag them, chaos energy).
- Meme templates must be dimension-specific.

## Skill Routing

When request matches available skill, invoke via Skill tool:
- Bugs/errors → /investigate
- QA → /qa or /qa-only
- Code review → /review
- Ship/deploy/PR → /ship
