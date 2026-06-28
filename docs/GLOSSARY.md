# RoastLab Glossary

Terms used throughout the codebase and UI.

## Audit

A single analysis run of a URL. Produces a score per dimension plus findings. Stored in the `audits` table.

## Dimension

One of 9 criteria the AI evaluates:

| Key | Label | What it checks |
|-----|-------|---------------|
| `visual_design` | Visual Design | Color, typography, spacing, hierarchy |
| `copywriting` | Copywriting | Headlines, body copy, tone, clarity |
| `cta` | CTA | Call-to-action clarity, placement, urgency |
| `ux_flow` | UX Flow | Navigation, user journey, friction |
| `accessibility` | Accessibility | WCAG compliance, contrast, labels |
| `trust_signals` | Trust Signals | Social proof, security indicators |
| `mobile_experience` | Mobile | Responsiveness, touch targets |
| `performance` | Performance | Load time, Core Web Vitals signals |
| `seo` | SEO | Meta tags, structure, crawlability |

## Finding

An individual problem or praise within a dimension. Has a severity: `critical`, `high`, `medium`, or `good`.

## Score

0–100 integer per dimension and overall (weighted average). Thresholds:
- 85+ Elite
- 75+ Good
- 65+ Decent
- 50+ Average
- 35+ Bad
- 20+ Disaster
- <20 Crime scene

## Tier

Which set of dimensions a user gets:
- `free` — 3 dimensions (visual_design, copywriting, cta)
- `pro` — 9 dimensions
- `full` — 9 dimensions + deep crawl (Jina + subpages)

## Deep Crawl

Jina AI Reader extracts semantic text from the URL, then subpages are crawled for additional context. Premium/full only.

## Roast

The overall experience of an audit. Named "roast" in the UI to set tone expectations.

## Admin

Users in the `ADMIN_EMAILS` env var. Get `full` tier access automatically and can see the `/admin` dashboard.
