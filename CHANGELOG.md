# Changelog

All notable changes to RoastLab. Format follows [Keep a Changelog](https://keepachangelog.com).

## [Unreleased]

## [0.9.0] — 2026-06-29

### Added
- Neon Postgres — audits now persist; dashboard shows real history
- Auto-email PDF report via Resend after every audit
- Admin dashboard at `/admin` — global stats + full audit log
- Forgot password page — 3-step reset flow (email → code → new pass)
- Real-time profile — photo upload + inline name edit via Clerk
- Telugu/Hindi meme stickers in audit results (memegen.link)
- Resend webhook endpoint for delivery tracking
- Deep crawl for premium users (Jina + subpage crawl)

### Changed
- AI scoring calibrated — removed "most pages deserve 25-50" bias
- Screenshot now clickable — opens full-size in new tab
- Admin full access (`bonthalamadhavi1@gmail.com`, `ritesh@gratiantechnologies.com`)

### Fixed
- Name spelling: "Pontalakoti" → "Bonthalakoti" across all files

## [0.8.0] — 2026-06-15

### Added
- Session gate — 1 free audit, then sign-in required
- Stripe integration — Pro + Full plans
- Dashboard with audit history
- PDF export — branded audit report

### Changed
- Gen Z redesign of analyze page
- 5-provider AI fallback (OpenRouter → Groq → Gemini)

## [0.1.0] — 2026-05-01

### Added
- Initial release — 9-dimension AI website audit
- Real-time SSE streaming
- Google OAuth + email/password via Clerk
- Screenshot capture via microlink.io
