"use client";

import { motion } from "motion/react";
import { Lock } from "lucide-react";

const dimensions = [
  {
    name: "Visual Design",
    desc: "Hierarchy, contrast, whitespace, brand consistency.",
    free: true,
  },
  {
    name: "Copywriting",
    desc: "Headline clarity, value proposition, tone, and passive voice.",
    free: true,
  },
  {
    name: "CTA",
    desc: "Button copy, placement, visual weight, and competition.",
    free: true,
  },
  {
    name: "UX Flow",
    desc: "Navigation logic, cognitive load, and user journey clarity.",
    free: false,
  },
  {
    name: "Accessibility",
    desc: "WCAG contrast, alt text, focus states, and keyboard nav.",
    free: false,
  },
  {
    name: "Trust Signals",
    desc: "Social proof, logos, testimonials, and security indicators.",
    free: false,
  },
  {
    name: "Mobile Experience",
    desc: "Tap targets, viewport fit, and mobile-specific patterns.",
    free: false,
  },
  {
    name: "Performance",
    desc: "LCP, CLS, render-blocking assets, and image optimization.",
    free: false,
  },
  {
    name: "SEO",
    desc: "Title tags, meta, heading structure, and semantic HTML.",
    free: false,
  },
];

export function AuditDimensions() {
  const free = dimensions.filter((d) => d.free);
  const locked = dimensions.filter((d) => !d.free);

  return (
    <section className="px-4 py-24" aria-label="Audit dimensions">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--ember)" }}
          >
            9 dimensions
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Every angle covered
          </h2>
          <p className="text-base max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            3 dimensions free. Unlock all 9 for a complete picture.
          </p>
        </div>

        {/* Free tier */}
        <div className="mb-4">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3 px-1"
            style={{ color: "var(--text-dim)" }}
          >
            Free — always
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {free.map((d, i) => (
              <motion.div
                key={d.name}
                className="p-5 rounded-xl border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-subtle)",
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <div
                  className="text-sm font-semibold mb-1.5 tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {d.name}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {d.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Locked tier */}
        <div>
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3 px-1 flex items-center gap-2"
            style={{ color: "var(--text-dim)" }}
          >
            <Lock size={10} aria-hidden="true" />
            Full report — $29
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {locked.map((d, i) => (
              <motion.div
                key={d.name}
                className="p-5 rounded-xl border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-subtle)",
                  opacity: 0.55,
                }}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 0.55, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: 0.15 + i * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div
                  className="text-sm font-semibold mb-1.5 tracking-tight flex items-center gap-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  <Lock size={11} aria-hidden="true" style={{ color: "var(--text-dim)" }} />
                  {d.name}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: "var(--text-dim)" }}>
                  {d.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
