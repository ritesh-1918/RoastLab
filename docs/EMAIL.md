# Email System

RoastLab sends transactional emails via [Resend](https://resend.com).

## Setup

1. Create account at resend.com
2. Get API key → add to `RESEND_API_KEY` env var
3. Set `RESEND_FROM_EMAIL` (default: `roastlab@resend.dev` on free tier)

For custom domain: Resend Dashboard → Domains → Add Domain → verify DNS.

## Email Types

### Audit Report Email

Sent automatically after every completed audit to signed-in users.

**Trigger:** `lib/email.ts:sendAuditEmail()` called from `app/api/analyze/route.ts`

**Contents:**
- Overall score + verdict
- Each dimension score + summary
- "View Full Report" CTA
- "Re-roast" CTA

**Template:** Dark theme, red accent, RoastLab branding

### Welcome Email

`lib/email.ts:sendWelcomeEmail()` — written but not yet triggered automatically. Can be called from:
- Clerk webhook on `user.created` event
- First dashboard visit detection

## Delivery Tracking

Resend webhook at `/api/webhooks/resend` receives delivery events.

**Setup:** Resend Dashboard → Webhooks → Add `https://getroastlab.vercel.app/api/webhooks/resend`

**Events tracked:** `email.bounced`, `email.complained`

## Clerk OTP / Verification Emails

Custom branding for Clerk's authentication emails (OTP, magic link, etc.) is done in:
**Clerk Dashboard → Customization → Emails**

Paste custom HTML template matching RoastLab's dark theme. Cannot be configured via code.
