'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Loader2, ArrowRight } from 'lucide-react';

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '₹0',
    period: 'forever',
    description: '3 dimensions. No card required.',
    badge: null,
    features: [
      'Visual Design roast',
      'Copywriting roast',
      'CTA roast',
      'No signup required',
      'Shareable report link',
    ],
    limit: '3 free audits',
    highlight: false,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '₹99',
    period: '/month',
    description: '15 audits per month. 3 dimensions each.',
    badge: 'Popular',
    features: [
      'Everything in Free',
      '15 audits per month',
      'Visual Design roast',
      'Copywriting roast',
      'CTA roast',
      'Priority processing',
      'Shareable report link',
    ],
    limit: '15 audits/month',
    highlight: false,
  },
  {
    id: 'full' as const,
    name: 'Full',
    price: '₹2,500',
    period: '/month',
    description: '50 audits per month. All 9 dimensions.',
    badge: 'Most complete',
    features: [
      'Everything in Pro',
      '50 audits per month',
      'All 9 roast dimensions',
      '"Fix These First" priority list',
      'UX Flow + Accessibility',
      'Mobile, Performance, SEO',
      'PDF export',
    ],
    limit: '50 audits/month',
    highlight: true,
  },
];

function PlanCard({ plan, index }: { plan: typeof PLANS[0]; index: number }) {
  const [loading, setLoading] = useState(false);
  const [siteUrl, setSiteUrl] = useState('');
  const [err, setErr] = useState('');

  async function handleSubscribe() {
    if (plan.id === 'free') {
      const el = document.getElementById('hero-input');
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => (el as HTMLInputElement | null)?.focus(), 500);
      return;
    }

    setLoading(true);
    setErr('');
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.id, siteUrl: siteUrl.trim() || undefined }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErr(data.error ?? 'Something went wrong');
        setLoading(false);
      }
    } catch {
      setErr('Network error');
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      style={{
        borderRadius: 20,
        background: plan.highlight ? 'linear-gradient(160deg, #1a0810 0%, #111117 60%)' : '#111117',
        border: plan.highlight ? '1px solid rgba(232,51,74,0.3)' : '1px solid #1E1E28',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated top border for highlighted plan */}
      {plan.highlight && (
        <motion.div
          aria-hidden="true"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 2 }}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, #E8334A, transparent)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#FAFAFA' }}>
          {plan.name}
        </h3>
        {plan.badge && (
          <span style={{
            fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            padding: '3px 8px', borderRadius: 99,
            background: plan.highlight ? 'rgba(232,51,74,0.12)' : '#1E1E28',
            color: plan.highlight ? '#E8334A' : '#8B8BA3',
            border: plan.highlight ? '1px solid rgba(232,51,74,0.25)' : '1px solid #27273A',
          }}>
            {plan.badge}
          </span>
        )}
      </div>

      {/* Price */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 44, fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', lineHeight: 1 }}>
          {plan.price}
        </span>
        <span style={{ fontSize: 14, color: '#8B8BA3', marginLeft: 4 }}>{plan.period}</span>
      </div>

      <p style={{ fontSize: 13, color: '#8B8BA3', marginBottom: 24 }}>{plan.description}</p>

      {/* Features */}
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {plan.features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: '#8B8BA3' }}>
            <Check size={13} style={{ color: plan.highlight ? '#E8334A' : '#22C55E', flexShrink: 0, marginTop: 1 }} />
            {f}
          </li>
        ))}
      </ul>

      {/* Limit chip */}
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#52526A',
        background: '#16161E', border: '1px solid #27273A',
        borderRadius: 6, padding: '4px 10px', alignSelf: 'flex-start', marginBottom: 20,
      }}>
        {plan.limit}
      </div>

      {/* Site URL input for paid plans */}
      {plan.id !== 'free' && (
        <input
          type="text"
          placeholder="Enter your website URL"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #27273A',
            background: '#09090B',
            color: '#FAFAFA',
            fontSize: 13,
            marginBottom: 12,
            outline: 'none',
          }}
        />
      )}

      {/* CTA */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            width: '100%', padding: '12px 16px', borderRadius: 10,
            border: plan.id === 'free' ? '1px solid #27273A' : 'none',
            fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em', cursor: loading ? 'default' : 'pointer',
            background: plan.highlight ? '#E8334A' : plan.id === 'free' ? 'transparent' : '#1E1E28',
            color: plan.highlight ? '#fff' : plan.id === 'free' ? '#8B8BA3' : '#FAFAFA',
            transition: 'background 150ms',
          } as React.CSSProperties}
          onMouseEnter={(e) => {
            if (loading) return;
            const el = e.currentTarget;
            if (plan.highlight) el.style.background = '#C92B3E';
            else if (plan.id !== 'free') el.style.background = '#27273A';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget;
            if (plan.highlight) el.style.background = '#E8334A';
            else if (plan.id !== 'free') el.style.background = '#1E1E28';
          }}
        >
          {loading ? (
            <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Redirecting…</>
          ) : plan.id === 'free' ? (
            <>Start for free <ArrowRight size={13} /></>
          ) : (
            <>Subscribe <ArrowRight size={13} /></>
          )}
        </button>

        {err && (
          <p style={{ fontSize: 11, color: '#E8334A', textAlign: 'center', margin: 0 }}>{err}</p>
        )}
      </div>
    </motion.div>
  );
}

export function Pricing() {
  return (
    <section id="pricing" style={{ padding: '96px 24px', position: 'relative' }}>
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: 'center', marginBottom: 56, maxWidth: 520, margin: '0 auto 56px' }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8334A', marginBottom: 14 }}>
          Pricing
        </p>
        <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', margin: '0 0 12px' }}>
          Simple. No surprises.
        </h2>
        <p style={{ fontSize: 15, color: '#8B8BA3', margin: 0 }}>
          Monthly subscriptions. Cancel anytime.
        </p>
      </motion.div>

      {/* Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16,
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {PLANS.map((plan, i) => (
          <PlanCard key={plan.id} plan={plan} index={i} />
        ))}
      </div>

      {/* Fine print */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        style={{ textAlign: 'center', marginTop: 28, fontSize: 12, color: '#4A4A62' }}
      >
        All plans billed in INR · Cancel anytime · Secure payments via Stripe
      </motion.p>
    </section>
  );
}
