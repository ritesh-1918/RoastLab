"use client";

import { motion } from "motion/react";
import { Globe, Cpu, ListChecks } from "lucide-react";

const steps = [
  {
    icon: Globe,
    step: "01",
    title: "Drop your URL",
    desc: "Paste any live URL. We crawl the page content and capture a screenshot — no setup needed.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI roasts it",
    desc: "Vision AI tears through 9 dimensions simultaneously. Real quotes from your page. No hallucinations.",
  },
  {
    icon: ListChecks,
    step: "03",
    title: "Fix what matters",
    desc: "Get a ranked hit-list — most damaging issues first. Each with a concrete one-line fix.",
  },
];

export function HowItWorks() {
  return (
    <section style={{ padding: '96px 24px' }} id="how-it-works" aria-label="How it works">
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ textAlign: 'center', marginBottom: 60 }}
        >
          <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#E8334A', marginBottom: 14, margin: '0 0 14px' }}>
            How it works
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', margin: '0 0 12px' }}>
            From URL to verdict in 60 seconds
          </h2>
          <p style={{ fontSize: 15, color: '#8B8BA3', margin: 0 }}>
            No signup, no setup, no waiting.
          </p>
        </motion.div>

        {/* Steps */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4 }}
                style={{
                  background: '#111117',
                  border: '1px solid #1E1E28',
                  borderRadius: 20,
                  padding: '28px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0,
                  transition: 'border-color 200ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#27273A'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = '#1E1E28'; }}
              >
                {/* Step + icon */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'rgba(232,51,74,0.08)', border: '1px solid rgba(232,51,74,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <Icon size={20} style={{ color: '#E8334A' }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4A4A62' }}>
                    Step {s.step}
                  </span>
                </div>

                <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA', margin: '0 0 10px' }}>
                  {s.title}
                </h3>
                <p style={{ fontSize: 13, color: '#8B8BA3', lineHeight: 1.65, margin: 0 }}>
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
