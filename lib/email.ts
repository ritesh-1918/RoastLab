/**
 * Resend email service — branded RoastLab templates.
 * All emails share the dark theme + red accent.
 */

import { Resend } from 'resend';
import { logEmail } from './db';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL ?? 'RoastLab <onboarding@resend.dev>';

const LOGO_SVG = `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="13" stroke="#E8334A" stroke-width="1.5"/><circle cx="16" cy="16" r="7" stroke="#E8334A" stroke-width="1.5"/><circle cx="16" cy="16" r="2" fill="#E8334A"/><line x1="16" y1="2" x2="16" y2="8" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/><line x1="16" y1="24" x2="16" y2="30" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/><line x1="2" y1="16" x2="8" y2="16" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/><line x1="24" y1="16" x2="30" y2="16" stroke="#E8334A" stroke-width="1.5" stroke-linecap="round"/></svg>`;

function scoreColor(s: number) {
  return s >= 70 ? '#32D74B' : s >= 45 ? '#FFD60A' : '#FF2D55';
}

function scoreVerdict(s: number) {
  if (s >= 75) return 'Actually fire 🔥';
  if (s >= 60) return 'Mid but salvageable 😐';
  if (s >= 40) return 'bestie WHAT IS THIS 💀';
  if (s >= 20) return "it's giving disaster 🚨";
  return 'Call 911 immediately ☠️';
}

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>RoastLab</title>
</head>
<body style="margin:0;padding:0;background:#09090B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#09090B;min-height:100vh;">
<tr><td align="center" style="padding:40px 16px;">
<table width="100%" style="max-width:600px;">
  <!-- Header -->
  <tr><td style="padding:0 0 32px;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="vertical-align:middle;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:10px;vertical-align:middle;">${LOGO_SVG}</td>
            <td style="vertical-align:middle;">
              <span style="font-size:18px;font-weight:900;letter-spacing:-0.04em;color:#FAFAFA;">ROAST<span style="color:#E8334A;">LAB</span></span>
            </td>
          </tr></table>
        </td>
        <td align="right" style="vertical-align:middle;">
          <span style="font-size:11px;color:#4A4A62;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Website Roaster</span>
        </td>
      </tr>
    </table>
  </td></tr>
  <!-- Content -->
  <tr><td style="background:#111117;border:1px solid #1E1E28;border-radius:16px;overflow:hidden;">
    ${content}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:24px 0 0;text-align:center;">
    <p style="margin:0 0 8px;font-size:12px;color:#4A4A62;">
      <a href="https://getroastlab.vercel.app" style="color:#E8334A;text-decoration:none;">getroastlab.vercel.app</a>
    </p>
    <p style="margin:0;font-size:11px;color:#2E2E4E;">Built by Ritesh Bonthalakoti · © 2026 RoastLab</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

interface DimResult {
  dimension: string;
  score: number;
  summary: string;
  findings?: { severity: string; title: string; action: string }[];
}

const DIM_LABELS: Record<string, string> = {
  visual_design: 'Visual Design', copywriting: 'Copywriting', cta: 'CTA',
  ux_flow: 'UX Flow', accessibility: 'Accessibility', trust_signals: 'Trust Signals',
  mobile_experience: 'Mobile', performance: 'Performance', seo: 'SEO',
};

export async function sendAuditEmail(opts: {
  to: string;
  name?: string;
  url: string;
  score: number;
  dims: DimResult[];
  tier?: string;
  userId?: string;
}): Promise<void> {
  const { to, name, url, score, dims, tier, userId } = opts;
  const sc = scoreColor(score);
  const verdict = scoreVerdict(score);
  const greeting = name ? `Hey ${name},` : 'Hey,';
  const isScreenshot = url === 'screenshot-upload';
  const displayUrl = isScreenshot ? 'your uploaded screenshot' : url;
  const fullTier = tier === 'full' ? 'Full' : 'Free';
  const dimRows = dims.map(d => {
    const c = scoreColor(d.score);
    const label = DIM_LABELS[d.dimension] ?? d.dimension;
    return `<tr>
      <td style="padding:10px 20px;border-bottom:1px solid #16161E;">
        <span style="font-size:13px;font-weight:600;color:#FAFAFA;">${label}</span>
        <p style="margin:4px 0 0;font-size:12px;color:#8B8BA3;font-style:italic;line-height:1.5;">${d.summary}</p>
      </td>
      <td style="padding:10px 20px;border-bottom:1px solid #16161E;text-align:right;white-space:nowrap;vertical-align:top;">
        <span style="font-size:18px;font-weight:900;color:${c};">${d.score}</span><span style="font-size:11px;color:#4A4A62;">/100</span>
      </td>
    </tr>`;
  }).join('');

  const content = `
    <!-- Red top accent -->
    <tr><td colspan="2" style="height:3px;background:linear-gradient(90deg,#E8334A,#FF6B3D);padding:0;"></td></tr>
    <tr><td style="padding:32px 28px 24px;">
      <p style="margin:0 0 4px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#E8334A;">YOUR ROAST REPORT</p>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:900;letter-spacing:-0.03em;color:#FAFAFA;">The verdict is in.</h1>
      <p style="margin:0;font-size:14px;color:#8B8BA3;line-height:1.6;">${greeting} We roasted <strong style="color:#FAFAFA;">${displayUrl}</strong> across ${dims.length} dimensions. ${fullTier} roast. We have notes.</p>
    </td></tr>
    <!-- Score block -->
    <tr><td style="padding:0 28px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#09090B;border:1px solid ${sc}33;border-radius:12px;">
        <tr>
          <td style="padding:20px 24px;vertical-align:middle;">
            <p style="margin:0 0 4px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#4A4A62;">OVERALL SCORE</p>
            <div style="display:flex;align-items:baseline;gap:4px;">
              <span style="font-size:64px;font-weight:900;color:${sc};letter-spacing:-0.04em;line-height:1;">${score}</span>
              <span style="font-size:16px;color:#4A4A62;">/100</span>
            </div>
            <p style="margin:8px 0 0;font-size:15px;font-weight:700;color:#FAFAFA;">${verdict}</p>
          </td>
          <td style="padding:20px 24px;text-align:right;vertical-align:middle;">
            <a href="${isScreenshot ? 'https://getroastlab.vercel.app' : `https://getroastlab.vercel.app/analyze?url=${encodeURIComponent(url)}&tier=${tier ?? 'free'}`}"
              style="display:inline-block;padding:12px 22px;background:linear-gradient(135deg,#E8334A,#FF6B3D);color:#fff;text-decoration:none;border-radius:10px;font-size:14px;font-weight:700;letter-spacing:-0.01em;">
              View Full Report →
            </a>
          </td>
        </tr>
      </table>
    </td></tr>
    <!-- Dimension scores -->
    <tr><td style="padding:0 28px 8px;">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#4A4A62;">DIMENSION BREAKDOWN</p>
    </td></tr>
    <tr><td style="padding:0 28px 28px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #1E1E28;border-radius:10px;overflow:hidden;background:#09090B;">
        ${dimRows}
      </table>
    </td></tr>
    <!-- CTA -->
    <tr><td style="padding:0 28px 32px;text-align:center;">
      <p style="margin:0 0 16px;font-size:13px;color:#4A4A62;line-height:1.6;">Fix the issues and re-roast to see your score climb.</p>
      <a href="https://getroastlab.vercel.app"
        style="display:inline-block;padding:11px 24px;border:1px solid #27273A;color:#8B8BA3;text-decoration:none;border-radius:8px;font-size:13px;font-weight:600;">
        Roast another page
      </a>
    </td></tr>`;

  const subject = isScreenshot
    ? `Your RoastLab screenshot audit — score: ${score}/100 (${fullTier})`
    : `Your RoastLab report for ${url} — score: ${score}/100 (${fullTier})`;

  await resend.emails.send({
    from: FROM,
    to,
    subject,
    html: baseLayout(`<table width="100%" cellpadding="0" cellspacing="0">${content}</table>`),
  });

  // Log sent email for admin stats (non-fatal)
  if (userId) {
    logEmail({ userId, email: to, subject, url, score, tier: tier ?? 'free' }).catch(() => {});
  }
}

export async function sendWelcomeEmail(opts: { to: string; name?: string }): Promise<void> {
  const { to, name } = opts;
  const greeting = name ? `Welcome, ${name}!` : 'Welcome aboard!';
  const content = `
    <tr><td colspan="2" style="height:3px;background:linear-gradient(90deg,#E8334A,#FF6B3D);padding:0;"></td></tr>
    <tr><td style="padding:40px 28px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">🔥</div>
      <h1 style="margin:0 0 8px;font-size:26px;font-weight:900;letter-spacing:-0.03em;color:#FAFAFA;">${greeting}</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#8B8BA3;line-height:1.7;max-width:420px;margin-left:auto;margin-right:auto;">
        Your account is live. Start by entering any website URL and we'll drag it through 9 brutal dimensions — design, copy, CTA, UX, accessibility, trust, mobile, performance, SEO.
      </p>
      <a href="https://getroastlab.vercel.app"
        style="display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#E8334A,#FF6B3D);color:#fff;text-decoration:none;border-radius:10px;font-size:15px;font-weight:700;letter-spacing:-0.01em;box-shadow:0 4px 20px rgba(232,51,74,0.3);">
        Start Roasting →
      </a>
      <p style="margin:20px 0 0;font-size:12px;color:#4A4A62;">3 free audits · No credit card needed</p>
    </td></tr>`;
  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Welcome to RoastLab 🔥 — your website roaster is ready',
    html: baseLayout(`<table width="100%" cellpadding="0" cellspacing="0">${content}</table>`),
  });
}
