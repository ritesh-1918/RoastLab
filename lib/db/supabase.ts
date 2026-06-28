import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Server-side client with full access (service role). Use only in API routes. */
export function createServerClient() {
  return createClient(supabaseUrl, supabaseServiceKey);
}

/** Browser-safe client for reading public data. */
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}

export type Audit = {
  id: string;
  created_at: string;
  url?: string;
  screenshot_path?: string;
  tier: 'free' | 'full';
  overall_score?: number;
  provider_used?: string;
  stripe_session_id?: string;
  paid: boolean;
};

export type DimensionResult = {
  id: string;
  audit_id: string;
  dimension: string;
  score?: number;
  summary?: string;
  findings: Finding[];
  created_at: string;
};

export type Finding = {
  severity: 'critical' | 'high' | 'medium' | 'good';
  title: string;
  quote?: string;
  action: string;
};
