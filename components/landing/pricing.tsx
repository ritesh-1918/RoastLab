'use client';

import React, { useState } from 'react';
import { ShieldCheckIcon, Check, Zap, CreditCard, Loader2 } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

const FREE_FEATURES = [
  'Visual Design roast',
  'Copywriting roast',
  'CTA roast',
  'No signup required',
  'Shareable report link',
];

const PAID_FEATURES = [
  'All 9 roast dimensions',
  '"Fix These First" priority list',
  'UX Flow + Accessibility',
  'Mobile, Performance, SEO',
  'PDF export',
  'Shareable report link',
];

function FreeCTA() {
  function scrollToHero() {
    const el = document.getElementById('hero-input');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => (el as HTMLInputElement | null)?.focus(), 600);
  }
  return (
    <button
      onClick={scrollToHero}
      className="w-full py-3 rounded-xl text-sm font-bold border transition-all"
      style={{
        background: 'transparent',
        borderColor: 'rgba(255,255,255,0.12)',
        color: '#9997BC',
        minHeight: '44px',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)';
        (e.currentTarget as HTMLElement).style.color = '#F0EFF8';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)';
        (e.currentTarget as HTMLElement).style.color = '#9997BC';
      }}
    >
      Start for free →
    </button>
  );
}

function PaidCTA() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function handleClick() {
    // Scroll to URL input — user needs to enter site URL first
    // If URL already in sessionStorage/page context we'd use it, else just scroll
    const heroInput = document.getElementById('hero-input') as HTMLInputElement | null;
    const heroVal = heroInput?.value?.trim();
    if (!heroVal) {
      // No URL entered yet — scroll to hero
      heroInput?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => heroInput?.focus(), 600);
      return;
    }
    const siteUrl = heroVal.startsWith('http') ? heroVal : `https://${heroVal}`;
    setLoading(true); setErr('');
    try {
      const res = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
      else { setErr(data.error ?? 'Payment failed'); setLoading(false); }
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'error'); setLoading(false);
    }
  }

  return (
    <div>
      <motion.button
        onClick={handleClick}
        disabled={loading}
        whileHover={loading ? {} : { scale: 1.02, y: -1 }}
        whileTap={loading ? {} : { scale: 0.98 }}
        className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
        style={{
          background: loading ? '#2A1810' : 'linear-gradient(135deg, #FF4D1C 0%, #FF6B3D 100%)',
          color: loading ? '#7E4D38' : '#fff',
          border: 'none',
          cursor: loading ? 'default' : 'pointer',
          minHeight: '44px',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(255,77,28,0.35)',
        }}
      >
        {loading
          ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }}/> Redirecting…</>
          : <><CreditCard size={15}/> 🔥 Unlock Full Report — ₹2,499</>
        }
      </motion.button>
      {err && <p style={{ margin: '6px 0 0', fontSize: 11, color: '#FF4D1C', textAlign: 'center' }}>{err}</p>}
      <p style={{ margin: '8px 0 0', fontSize: 10, color: '#4E4D6E', textAlign: 'center' }}>
        Enter your URL in the box above first, then click here
      </p>
    </div>
  );
}

export function Pricing() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-24 px-4" id="pricing">
      {/* Background radial glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255,77,28,0.05) 0%, transparent 70%)',
        }}
      />

      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 px-4 py-1.5 rounded-full"
            style={{ background: 'rgba(255,77,28,0.08)', border: '1px solid rgba(255,77,28,0.2)', color: '#FF6B3D' }}>
            <Zap size={11}/> Pricing
          </div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-3" style={{ color: '#F0EFF8', letterSpacing: '-0.025em' }}>
            Simple. No subscriptions.
          </h2>
          <p className="text-sm md:text-base max-w-sm mx-auto" style={{ color: '#7E7D9A' }}>
            Pay once per audit. Instant access. No hidden fees.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">

          {/* Free card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            whileHover={reduced ? {} : { y: -4 }}
            style={{
              borderRadius: 20,
              background: 'linear-gradient(145deg, #141424 0%, #0F0F1C 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '28px 24px',
              display: 'flex', flexDirection: 'column',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ color: '#F0EFF8', fontSize: 16, fontWeight: 800, margin: 0 }}>Free Audit</h3>
              <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.06)', color: '#6E6D8E', border: '1px solid rgba(255,255,255,0.07)' }}>
                Always free
              </span>
            </div>

            <p style={{ color: '#6E6D8E', fontSize: 13, marginBottom: 20 }}>3 dimensions. No card required.</p>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, marginBottom: 24 }}>
              <span style={{ fontSize: 20, color: '#6E6D8E', lineHeight: 1.6 }}>₹</span>
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.2 }}
                viewport={{ once: true }}
                style={{ fontSize: 52, fontWeight: 900, color: '#F0EFF8', lineHeight: 0.9, letterSpacing: '-0.03em' }}
              >
                0
              </motion.span>
            </div>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {FREE_FEATURES.map((f, i) => (
                <motion.li key={f}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.3 }}
                  viewport={{ once: true }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#9997BC' }}
                >
                  <Check size={12} style={{ color: '#32D74B', flexShrink: 0 }}/>
                  {f}
                </motion.li>
              ))}
            </ul>

            <div style={{ marginTop: 'auto' }}>
              <FreeCTA />
            </div>
          </motion.div>

          {/* Paid card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            whileHover={reduced ? {} : { y: -4 }}
            style={{
              borderRadius: 20,
              background: 'linear-gradient(145deg, #1C0E08 0%, #130820 50%, #0F0F1C 100%)',
              border: '1px solid rgba(255,77,28,0.22)',
              padding: '28px 24px',
              display: 'flex', flexDirection: 'column',
              position: 'relative', overflow: 'hidden',
              boxShadow: '0 4px 32px rgba(255,77,28,0.08), 0 4px 24px rgba(0,0,0,0.4)',
            }}
          >
            {/* Animated glow pulse */}
            <motion.div
              aria-hidden="true"
              animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
                width: 280, height: 280, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,77,28,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
              }}
            />

            {/* Animated top border */}
            <motion.div
              aria-hidden="true"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 1.5 }}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                background: 'linear-gradient(90deg, transparent, #FF4D1C, transparent)',
                pointerEvents: 'none',
              }}
            />

            <div className="flex items-center justify-between mb-6" style={{ position: 'relative' }}>
              <h3 style={{ color: '#F0EFF8', fontSize: 16, fontWeight: 800, margin: 0 }}>Full Report</h3>
              <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 99, background: 'rgba(255,77,28,0.12)', color: '#FF6B3D', border: '1px solid rgba(255,77,28,0.22)' }}>
                🔥 Most complete
              </span>
            </div>

            <p style={{ color: '#7E7D9A', fontSize: 13, marginBottom: 20, position: 'relative' }}>All 9 dimensions. One-time payment.</p>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, marginBottom: 24, position: 'relative' }}>
              <span style={{ fontSize: 20, color: '#7E7D9A', lineHeight: 1.6 }}>₹</span>
              <motion.span
                initial={{ opacity: 0, scale: 0.7 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: 0.3 }}
                viewport={{ once: true }}
                style={{ fontSize: 52, fontWeight: 900, color: '#F0EFF8', lineHeight: 0.9, letterSpacing: '-0.03em' }}
              >
                2,499
              </motion.span>
            </div>

            {/* Features */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9, position: 'relative' }}>
              {PAID_FEATURES.map((f, i) => (
                <motion.li key={f}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.06, duration: 0.3 }}
                  viewport={{ once: true }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: '#B8B7D0' }}
                >
                  <Check size={12} style={{ color: '#FF4D1C', flexShrink: 0 }}/>
                  {f}
                </motion.li>
              ))}
            </ul>

            <div style={{ marginTop: 'auto', position: 'relative' }}>
              <PaidCTA />
            </div>
          </motion.div>

        </div>

        {/* Trust line */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-2 mt-6"
          style={{ color: '#3E3D5E', fontSize: 12 }}
        >
          <ShieldCheckIcon size={14}/>
          <span>Secure payment via Stripe · INR · No subscription</span>
        </motion.div>
      </div>
    </section>
  );
}
