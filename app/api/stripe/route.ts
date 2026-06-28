/**
 * POST /api/stripe
 * Creates a Stripe Checkout session for unlocking a full audit.
 * Body: { auditId: string }
 * Returns: { url: string } — redirect to Stripe Checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const FULL_AUDIT_PRICE_INR = 249900; // ₹2,499 in paise (Stripe INR uses paise)

export async function POST(req: NextRequest) {
  try {
    const { auditId } = (await req.json()) as { auditId: string };

    if (!auditId) {
      return NextResponse.json({ error: 'auditId required' }, { status: 400 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://roastlab-sooty.vercel.app';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      currency: 'inr',
      line_items: [
        {
          price_data: {
            currency: 'inr',
            unit_amount: FULL_AUDIT_PRICE_INR,
            product_data: {
              name: '🔥 RoastLab Full Report',
              description:
                'Complete landing page audit across 9 dimensions: Visual Design, UX Flow, Copywriting, Accessibility, Trust Signals, CTA, Mobile Experience, Performance, SEO.',
            },
          },
          quantity: 1,
        },
      ],
      metadata: { auditId },
      success_url: `${appUrl}/report/${auditId}?upgraded=1`,
      cancel_url: `${appUrl}/report/${auditId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[stripe]', err);
    const message = err instanceof Error ? err.message : 'Stripe error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
