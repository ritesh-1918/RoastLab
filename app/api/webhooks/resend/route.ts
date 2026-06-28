/**
 * Resend webhook endpoint.
 * Tracks email delivery events: sent, delivered, opened, bounced.
 * Set webhook URL in Resend Dashboard → Webhooks → Add Endpoint:
 *   https://getroastlab.vercel.app/api/webhooks/resend
 * Events to subscribe: email.sent, email.delivered, email.opened, email.bounced
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      type: string;
      data: { email_id: string; from: string; to: string[]; subject: string };
    };
    const { type, data } = body;

    // Log for now — extend with DB writes if needed
    console.log(`[resend-webhook] ${type} → ${data.to?.[0]} — "${data.subject}"`);

    switch (type) {
      case 'email.bounced':
        console.warn('[resend-webhook] BOUNCE:', data.to?.[0]);
        break;
      case 'email.complained':
        console.warn('[resend-webhook] SPAM complaint:', data.to?.[0]);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
}
