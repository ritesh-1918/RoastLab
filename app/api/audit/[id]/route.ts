import { NextRequest, NextResponse } from 'next/server';
import { getAuditWithDimensions } from '@/lib/db/index';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const result = await getAuditWithDimensions(id);

  if (!result) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  return NextResponse.json(result);
}
