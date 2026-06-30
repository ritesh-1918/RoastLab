'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

export function QuickAuditInput() {
  const [url, setUrl] = useState('');
  const router = useRouter();

  function handleAnalyze() {
    const trimmed = url.trim();
    if (!trimmed) return;
    const target = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    router.push(`/analyze?url=${encodeURIComponent(target)}&tier=full`);
  }

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: '#09090B',
          border: '1px solid #27273A',
          borderRadius: 8,
          padding: '0 14px',
        }}
      >
        <span style={{ fontSize: 12, color: '#4A4A62', fontFamily: 'var(--font-geist-mono), monospace' }}>https://</span>
        <input
          type="url"
          placeholder="yoursite.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: '#FAFAFA',
            padding: '11px 0',
            fontFamily: 'var(--font-geist-mono), monospace',
          }}
        />
      </div>
      <button
        onClick={handleAnalyze}
        disabled={!url.trim()}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '0 18px',
          background: url.trim() ? '#E8334A' : '#27273A',
          color: url.trim() ? '#fff' : '#52526A',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.01em',
          minHeight: 42,
          border: 'none',
          cursor: url.trim() ? 'pointer' : 'not-allowed',
          transition: 'background 150ms',
        }}
      >
        Analyze <ArrowRight size={13} />
      </button>
    </div>
  );
}
