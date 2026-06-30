/**
 * GET /api/admin/upgrade-self
 * Admin-only: upgrades the signed-in user's Clerk plan to 'full'.
 * Protected by hardcoded admin email list.
 */

import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

const ADMIN_EMAILS = ['bonthalamadhavi1@gmail.com', 'ritesh@gratiantechnologies.com'];

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const email = user.emailAddresses[0]?.emailAddress ?? '';

  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { plan: 'full' },
  });

  return NextResponse.json({ ok: true, userId, email, plan: 'full' });
}
