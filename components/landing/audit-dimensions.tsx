"use client";

import { motion } from "motion/react";
import { Lock } from "lucide-react";

const dimensions = [
  { name: "Visual Design", desc: "Hierarchy, contrast, whitespace, brand consistency.", tier: 'free' },
  { name: "Copywriting", desc: "Headline clarity, value proposition, tone, and passive voice.", tier: 'free' },
  { name: "CTA", desc: "Button copy, placement, visual weight, and competition.", tier: 'free' },
  { name: "UX Flow", desc: "Navigation logic, cognitive load, and user journey clarity.", tier: 'pro' },
  { name: "Accessibility", desc: "WCAG contrast, alt text, focus states, and keyboard nav.", tier: 'pro' },
  { name: "Trust Signals", desc: "Social proof, logos, testimonials, and security indicators.", tier: 'pro' },
  { name: "Mobile Experience", desc: "Tap targets, viewport fit, and mobile-specific patterns.", tier: 'full' },
  { name: "Performance", desc: "LCP, CLS, render-blocking assets, and image optimization.", tier: 'full' },
  { name: "SEO", desc: "Title tags, meta, heading structure, and semantic HTML.", tier: 'full' },
];

const TIER_LABELS: Record<string, { label: string; color: string; border: string; bg: string }> = {
  free:  { label: 'Free', color: '#22C55E', border: 'rgba(34,197,94,0.2)', bg: 'rgba(34,197,94,0.06)' },
  pro:   { label: 'Pro ₹99/mo', color: '#8B8BA3', border: '#27273A', bg: '#16161E' },
  full:  { label: 'Full ₹2,500/mo', color: '#E8334A', border: 'rgba(232,51,74,0.25)', bg: 'rgba(232,51,74,0.06)' },
};

export function AuditDimensions() {
  return (
    <section style={{ padding: '96px 24px' }} aria-label="Audit dimensions">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 52 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8334A', margin: '0 0 14px' }}>
            9 dimensions
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', margin: '0 0 12px' }}>
            Every angle. No filters.
          </h2>
          <p style={{ fontSize: 15, color: '#8B8BA3', margin: 0 }}>
            3 free forever. More with Pro and Full.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
          {dimensions.map((d, i) => {
            const tier = TIER_LABELS[d.tier];
            const locked = d.tier !== 'free';
            return (
              <motion.div
                key={d.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  padding: '20px',
                  borderRadius: 16,
                  background: '#111117',
                  border: `1px solid ${locked ? '#1E1E28' : 'rgba(34,197,94,0.15)'}`,
                  position: 'relative',
                  opacity: locked ? 0.65 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                  <h3 style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA', margin: 0 }}>
                    {d.name}
                  </h3>
                  <span style={{
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                    padding: '2px 7px', borderRadius: 99, flexShrink: 0,
                    color: tier.color, border: `1px solid ${tier.border}`, background: tier.bg,
                  }}>
                    {locked && <Lock size={8} style={{ display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />}
                    {tier.label}
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#52526A', lineHeight: 1.6, margin: 0 }}>{d.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
