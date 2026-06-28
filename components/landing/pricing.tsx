'use client';
import React from 'react';
import { PlusIcon, ShieldCheckIcon, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { BorderTrail } from '@/components/ui/border-trail';
import { cn } from '@/lib/utils';

const FREE_FEATURES = [
  'Visual Design dimension',
  'Copywriting dimension',
  'CTA dimension',
  'No signup required',
  'Shareable report link',
];

const PAID_FEATURES = [
  'All 9 audit dimensions',
  '"Fix These First" priority list',
  'UX Flow + Accessibility',
  'Mobile, Performance, SEO',
  'PDF export',
  'Shareable report link',
];

export function Pricing() {
  return (
    <section className="relative overflow-hidden py-24 px-4" id="pricing">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl space-y-5"
        >
          <div className="flex justify-center">
            <div
              className="rounded-lg border px-4 py-1 font-mono text-xs"
              style={{ borderColor: 'var(--border-emph)', color: 'var(--text-dim)' }}
            >
              Pricing
            </div>
          </div>
          <h2
            className="text-center text-2xl font-bold tracking-tighter md:text-3xl lg:text-4xl"
            style={{ color: 'var(--text-primary)' }}
          >
            Simple. No subscriptions.
          </h2>
          <p className="text-center text-sm md:text-base" style={{ color: 'var(--text-secondary)' }}>
            Pay once per audit. Instant access. No hidden fees.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="relative mx-auto w-full max-w-2xl">
          {/* Grid background */}
          <div
            className={cn(
              'pointer-events-none absolute inset-0 -z-10 size-full',
              '[mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]',
            )}
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="w-full space-y-2"
          >
            <div
              className="grid md:grid-cols-2 relative border p-4"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-emph)',
              }}
            >
              {/* Corner markers */}
              <PlusIcon className="absolute -top-3 -left-3 size-5.5" style={{ color: 'var(--text-dim)' }} />
              <PlusIcon className="absolute -top-3 -right-3 size-5.5" style={{ color: 'var(--text-dim)' }} />
              <PlusIcon className="absolute -bottom-3 -left-3 size-5.5" style={{ color: 'var(--text-dim)' }} />
              <PlusIcon className="absolute -right-3 -bottom-3 size-5.5" style={{ color: 'var(--text-dim)' }} />

              {/* Free */}
              <div className="w-full px-4 pt-5 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="leading-none font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Free Audit
                    </h3>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--bg-hover)', color: 'var(--text-dim)', border: '1px solid var(--border-emph)' }}
                    >
                      Always free
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    3 dimensions. No card required.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-end gap-0.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-xl">₹</span>
                    <span
                      className="-mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      0
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2 mb-5">
                    {FREE_FEATURES.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Check size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--sev-good)' }} aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-semibold border transition-all"
                    style={{
                      background: 'transparent',
                      borderColor: 'var(--border-emph)',
                      color: 'var(--text-primary)',
                      minHeight: '44px',
                    }}
                  >
                    Start for free
                  </button>
                </div>
              </div>

              {/* Full Report — highlighted */}
              <div
                className="relative w-full rounded-lg border px-4 pt-5 pb-4"
                style={{ borderColor: 'rgba(255,77,28,0.25)', background: 'rgba(255,77,28,0.03)' }}
              >
                <BorderTrail
                  style={{
                    boxShadow:
                      '0px 0px 60px 30px rgba(255,77,28,0.4), 0 0 100px 60px rgba(0,0,0,0.5)',
                  }}
                  size={100}
                  className="bg-orange-500/60"
                />

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="leading-none font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      Full Report
                    </h3>
                    <div className="flex items-center gap-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: 'var(--ember-dim)',
                          color: 'var(--ember)',
                          border: '1px solid rgba(255,77,28,0.2)',
                        }}
                      >
                        Most complete
                      </span>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    All 9 dimensions. One-time payment.
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex items-end gap-0.5" style={{ color: 'var(--text-secondary)' }}>
                    <span className="text-xl">₹</span>
                    <span
                      className="-mb-0.5 text-4xl font-extrabold tracking-tighter md:text-5xl"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      2,499
                    </span>
                  </div>

                  <ul className="flex flex-col gap-2 mb-5">
                    {PAID_FEATURES.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <Check size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--ember)' }} aria-hidden="true" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: 'var(--ember)',
                      color: '#fff',
                      minHeight: '44px',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--ember-2)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = 'var(--ember)';
                    }}
                  >
                    🔥 Unlock Full Report — ₹2,499
                  </button>
                </div>
              </div>
            </div>

            <div
              className="flex items-center justify-center gap-x-2 text-sm"
              style={{ color: 'var(--text-dim)' }}
            >
              <ShieldCheckIcon className="size-4" />
              <span>Secure payment via Stripe · INR · No subscription</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
