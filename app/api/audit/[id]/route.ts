import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/db/supabase';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = createServerClient();

  const { data: audit, error } = await db
    .from('audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !audit) {
    return NextResponse.json({ error: 'Audit not found' }, { status: 404 });
  }

  const { data: dimensions } = await db
    .from('dimension_results')
    .select('*')
    .eq('audit_id', id)
    .order('created_at', { ascending: true });

  return NextResponse.json({ audit, dimensions: dimensions ?? [] });
}
