'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';

export function BillingStripeButton({ plan }: { plan: 'pro' | 'full' }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleUpgrade() {
    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErr(data.error ?? 'Something went wrong');
        setLoading(false);
      }
    } catch {
      setErr('Network error — try again');
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <button
        onClick={handleUpgrade}
        disabled={loading}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '9px 18px',
          background: '#E8334A',
          color: '#fff',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 700,
          border: 'none',
          cursor: loading ? 'default' : 'pointer',
          letterSpacing: '-0.01em',
          opacity: loading ? 0.7 : 1,
          transition: 'opacity 150ms',
        }}
      >
        {loading ? (
          <><Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Redirecting…</>
        ) : (
          <>Upgrade <ArrowRight size={13} /></>
        )}
      </button>
      {err && <p style={{ fontSize: 11, color: '#E8334A', margin: 0 }}>{err}</p>}
    </div>
  );
}
