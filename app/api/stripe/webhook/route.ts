/**
 * POST /api/stripe/webhook
 * Verifies Stripe signature, updates Clerk user metadata on successful payment.
 */

import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

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
    const userId = session.metadata?.userId;
    const plan = (session.metadata?.plan ?? 'full') as string;

    console.log('[webhook] checkout.session.completed', session.id, { userId, plan });

    if (userId) {
      try {
        const clerk = await clerkClient();
        await clerk.users.updateUserMetadata(userId, {
          publicMetadata: { plan },
        });
        console.log('[webhook] updated Clerk metadata for', userId, '→ plan:', plan);
      } catch (e) {
        console.error('[webhook] failed to update Clerk metadata:', e);
      }
    }
  }

  return NextResponse.json({ received: true });
}
