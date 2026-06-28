"use client";

import { useState, useCallback } from "react";

export interface AuditEntry {
  id: number;
  url: string;
  score: number;
  tier: string;
  created_at: string;
}

export interface AuditStats {
  count: number;
  avg_score: number | null;
}

export function useAuditHistory() {
  const [audits, setAudits] = useState<AuditEntry[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await window.fetch("/api/audits");
      if (!res.ok) throw new Error("Failed to load audit history");
      const data = await res.json();
      setAudits(data.audits ?? []);
      setStats(data.stats ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  return { audits, stats, loading, error, fetch };
}
