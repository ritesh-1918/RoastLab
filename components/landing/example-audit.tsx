'use client';
import { motion } from 'framer-motion';
import { BorderTrail } from '@/components/ui/border-trail';
import { AlertCircle, TrendingUp, Eye } from 'lucide-react';

const findings = [
  {
    severity: 'critical',
    color: '#FF4D1C',
    bg: 'rgba(255,77,28,0.10)',
    icon: AlertCircle,
    title: 'Headline buries the offer',
    quote: '"Revolutionizing the way you work"',
    action: 'Rewrite H1 to state who it\'s for and what changes',
  },
  {
    severity: 'high',
    color: '#FF9F0A',
    bg: 'rgba(255,159,10,0.10)',
    icon: TrendingUp,
    title: 'CTA competes with 3 nav links',
    quote: '"Get Started, Sign In, Learn More — all equal visual weight"',
    action: 'One primary CTA, rest tertiary or removed from hero',
  },
  {
    severity: 'good',
    color: '#34C759',
    bg: 'rgba(52,199,89,0.10)',
    icon: Eye,
    title: 'Form microcopy is clear',
    quote: 'Placeholder text names the format ("https://") and error states are inline',
    action: 'No action needed',
  },
];

export function ExampleAudit() {
  return (
    <section className="px-4 py-24 overflow-hidden" aria-label="Example audit">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--ember)' }}
          >
            Example output
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            This is what your roast looks like
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            Specific quotes from your actual page. One clear action each. No vague advice.
          </p>
        </div>

        {/* Audit card mockup */}
        <motion.div
          className="relative mx-auto max-w-2xl rounded-2xl border overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'rgba(255,77,28,0.2)',
          }}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <BorderTrail
            style={{
              boxShadow:
                '0px 0px 40px 20px rgba(255,77,28,0.3), 0 0 80px 40px rgba(0,0,0,0.5)',
            }}
            size={80}
            transition={{ repeat: Infinity, duration: 6, ease: 'linear' }}
          />

          {/* Card header */}
          <div
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ background: 'var(--ember-dim)', border: '1px solid rgba(255,77,28,0.2)' }}
              >
                ✍
              </div>
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Copywriting
                </div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  yoursite.com
                </div>
              </div>
            </div>
            <div
              className="text-2xl font-extrabold tabular-nums tracking-tight"
              style={{ color: '#FF9F0A' }}
            >
              49<span style={{ fontSize: '14px', color: 'var(--text-dim)', fontWeight: 400 }}>/100</span>
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ height: '3px', background: 'var(--bg-hover)' }}>
            <motion.div
              style={{ height: '100%', background: '#FF9F0A', borderRadius: '9999px' }}
              initial={{ width: '0%' }}
              whileInView={{ width: '49%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Findings */}
          <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
            {findings.map((f, i) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.title}
                  className="flex gap-4 p-5"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: f.bg }}
                  >
                    <Icon size={13} style={{ color: f.color }} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="text-sm font-semibold mb-1"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {f.title}
                    </div>
                    <div
                      className="text-xs italic mb-1.5 leading-relaxed"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {f.quote}
                    </div>
                    <div className="text-xs font-medium" style={{ color: f.color }}>
                      → {f.action}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
