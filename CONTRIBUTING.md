# Contributing to RoastLab

Thanks for wanting to contribute. Here's what you need to know.

## Setup

```bash
git clone https://github.com/ritesh-1918/roastlab.git
cd roastlab
npm install --legacy-peer-deps
cp .env.example .env.local   # fill in your keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Minimum set to run locally:

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | [Clerk Dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | Clerk Dashboard |
| `OPENROUTER_KEY_1` | [openrouter.ai](https://openrouter.ai) |
| `DATABASE_URL` | [Neon](https://neon.tech) — optional, audits just won't persist |
| `RESEND_API_KEY` | [Resend](https://resend.com) — optional, emails just won't send |

## Development Guidelines

- **Next.js 15 App Router** — server components by default, `"use client"` only when you need hooks/interactivity
- **TypeScript strict** — no `any` escapes without a comment explaining why
- **Tailwind CSS v4** — inline styles for component-scoped overrides, Tailwind for layout
- **motion/react** — NOT framer-motion. All animation imports from `motion/react`
- **No new dependencies** without discussion — bundle size matters

## AI Providers

The 5-provider fallback in `lib/ai/analyze.ts`:

```
openrouter-1 → openrouter-2 → groq-1 → groq-2 → gemini-1
```

Add providers by extending the `PROVIDERS` array. Each needs `.call(prompt, imageUrl)` returning `AnalysisResult`.

## Commit Style

```
feat: add X
fix: Y was broken because Z  
chore: update dependency X
refactor: rename Y to Z
docs: update README
```

No scope required. Keep first line under 72 chars.

## Pull Requests

1. Fork → branch from `main`
2. One feature or fix per PR
3. `npm run build` must pass
4. Describe what and why in the PR body

## Issues

Use the GitHub issue templates:
- **Bug report** — include URL you were auditing, error message, browser
- **Feature request** — describe the use case, not just the feature

## Questions

Open a [GitHub Discussion](https://github.com/ritesh-1918/roastlab/discussions).
