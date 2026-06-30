import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { setSetting } from '@/lib/db';

const ADMIN_EMAILS = ['ritesh@gratiantechnologies.com', 'bonthalamadhavi1@gmail.com'];

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const email = user.emailAddresses[0]?.emailAddress?.toLowerCase() ?? '';
  if (!ADMIN_EMAILS.includes(email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json() as { key?: string; value?: string };
  const { key, value } = body;
  if (!key || typeof key !== 'string') {
    return NextResponse.json({ error: 'key required' }, { status: 400 });
  }

  await setSetting(key, value ?? '');
  return NextResponse.json({ ok: true });
}
