/**
 * POST /api/stripe
 * Body: { siteUrl: string }
 * Returns: { url: string } — Stripe Checkout URL
 * On success: redirects to /analyze?url=...&tier=full&paid=1
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const PRICE_PAISE = 249900; // ₹2,499

export async function POST(req: NextRequest) {
  try {
    const { siteUrl } = (await req.json()) as { siteUrl: string };
    if (!siteUrl) return NextResponse.json({ error: 'siteUrl required' }, { status: 400 });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://roastlab-sooty.vercel.app';
    const encoded = encodeURIComponent(siteUrl);

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'inr',
      line_items: [{
        price_data: {
          currency: 'inr',
          unit_amount: PRICE_PAISE,
          product_data: {
            name: '🔥 RoastLab — Full Roast (9 Dimensions)',
            description: 'Complete AI audit: Visual Design, UX Flow, Copywriting, Accessibility, Trust Signals, CTA, Mobile, Performance, SEO.',
          },
        },
        quantity: 1,
      }],
      metadata: { siteUrl },
      success_url: `${appUrl}/analyze?url=${encoded}&tier=full&paid=1`,
      cancel_url: `${appUrl}/analyze?url=${encoded}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Stripe error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
