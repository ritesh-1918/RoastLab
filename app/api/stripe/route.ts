/**
 * POST /api/stripe
 * Body: { plan: 'pro' | 'full', siteUrl?: string }
 * Returns: { url: string } — Stripe Checkout URL
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PLANS = {
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    mode: 'subscription' as const,
  },
  full: {
    priceId: process.env.STRIPE_PRICE_FULL!,
    mode: 'subscription' as const,
  },
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { plan: 'pro' | 'full'; siteUrl?: string };
    const { plan, siteUrl } = body;

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getroastlab.vercel.app';
    const { priceId, mode } = PLANS[plan];

    const successPath = siteUrl
      ? `/analyze?url=${encodeURIComponent(siteUrl)}&tier=${plan}&paid=1`
      : `/dashboard`;

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { plan, ...(siteUrl ? { siteUrl } : {}) },
      success_url: `${appUrl}${successPath}`,
      cancel_url: `${appUrl}/#pricing`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
