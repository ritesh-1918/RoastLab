'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';
import { ScoreBadge } from '@/components/ui/score-badge';
import { TierBadge } from '@/components/ui/tier-badge';
import { relativeTime } from '@/lib/utils';
import type { AuditRow } from '@/lib/db';

const FILTERS = ['All', 'Free', 'Full report'] as const;
type Filter = typeof FILTERS[number];

export function ReportsList({ audits }: { audits: AuditRow[] }) {
  const [filter, setFilter] = useState<Filter>('All');
  const [search, setSearch] = useState('');

  const filtered = audits.filter(a => {
    const matchesTier =
      filter === 'All' ? true :
      filter === 'Free' ? a.tier === 'free' :
      a.tier === 'full';
    const matchesSearch = search === '' || a.url.toLowerCase().includes(search.toLowerCase());
    return matchesTier && matchesSearch;
  });

  return (
    <>
      <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 4px' }}>Reports</h1>
          <p style={{ fontSize: 13, color: '#8B8BA3', margin: 0 }}>All your past audit reports</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111117', border: '1px solid #27273A', borderRadius: 8, padding: '0 12px', height: 36 }}>
          <Search size={13} style={{ color: '#4A4A62' }} />
          <input
            type="search"
            placeholder="Search reports..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#FAFAFA', width: 180 }}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #1E1E28', paddingBottom: 0 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              fontSize: 13,
              fontWeight: filter === f ? 600 : 500,
              color: filter === f ? '#FAFAFA' : '#8B8BA3',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 14px',
              borderBottom: filter === f ? '2px solid #E8334A' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ border: '1px dashed #27273A', borderRadius: 16, padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#4A4A62', margin: 0 }}>
            {audits.length === 0 ? 'No reports yet.' : 'No reports match this filter.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((a) => {
            const dimCount = Array.isArray(a.dimensions) ? a.dimensions.length : 0;
            return (
              <Link
                key={a.id}
                href={`/analyze?id=${a.id}`}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#111117', border: '1px solid #1E1E28', textDecoration: 'none' }}
              >
                <ScoreBadge score={a.score} size="md" showGrade />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.url}</p>
                  <p style={{ fontSize: 12, color: '#4A4A62', margin: 0 }}>{relativeTime(a.created_at)} · {dimCount} dims</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <TierBadge tier={a.tier} />
                  <ArrowRight size={12} style={{ color: '#4A4A62' }} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
