import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { getUserAudits, getUserStats } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [audits, stats] = await Promise.all([
    getUserAudits(user.id),
    getUserStats(user.id),
  ]);

  return NextResponse.json({ audits, stats });
}
