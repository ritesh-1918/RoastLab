/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook: marks audit as paid on checkout.session.completed
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { markAuditPaid } from '@/lib/db/index';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error('[webhook] signature verify failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const auditId = session.metadata?.auditId;

    if (auditId) {
      await markAuditPaid(auditId, session.id);
      console.log(`[webhook] audit ${auditId} unlocked`);
    }
  }

  return NextResponse.json({ received: true });
}
