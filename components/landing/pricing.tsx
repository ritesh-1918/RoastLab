"use client";

import { motion } from "motion/react";
import { Check } from "lucide-react";

const FREE_FEATURES = [
  "3 audit dimensions",
  "Visual Design, Copywriting, CTA",
  "No signup required",
  "Shareable report link",
];

const PAID_FEATURES = [
  "All 9 audit dimensions",
  "UX Flow, Accessibility, Trust Signals",
  "Mobile Experience, Performance, SEO",
  "Fix These First — prioritized action list",
  "PDF export",
  "Shareable report link",
];

export function Pricing() {
  return (
    <section className="px-4 py-24" aria-label="Pricing">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--ember)" }}
          >
            Pricing
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
            style={{ color: "var(--text-primary)" }}
          >
            Simple. No subscriptions.
          </h2>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Pay once per audit. No recurring fees.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Free */}
          <motion.div
            className="p-8 rounded-2xl border"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border-subtle)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--text-dim)" }}
            >
              Free
            </div>
            <div
              className="text-4xl font-extrabold tracking-tight mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              $0
            </div>
            <div
              className="text-sm mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              Always free
            </div>

            <ul className="flex flex-col gap-3 mb-8">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check
                    size={14}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--sev-good)" }}
                    aria-hidden="true"
                  />
                  <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className="w-full py-3 rounded-xl text-sm font-semibold border transition-all"
              style={{
                background: "transparent",
                borderColor: "var(--border-emph)",
                color: "var(--text-primary)",
                minHeight: "44px",
              }}
            >
              Get free audit
            </button>
          </motion.div>

          {/* Full Report */}
          <motion.div
            className="p-8 rounded-2xl border relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, var(--bg-card) 0%, rgba(255,77,28,0.04) 100%)",
              borderColor: "rgba(255,77,28,0.25)",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Popular badge */}
            <div
              className="absolute top-4 right-4 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: "var(--ember-dim)",
                color: "var(--ember)",
                border: "1px solid rgba(255,77,28,0.2)",
              }}
            >
              Most complete
            </div>

            <div
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "var(--ember)" }}
            >
              Full Report
            </div>
            <div
              className="text-4xl font-extrabold tracking-tight mb-1"
              style={{ color: "var(--text-primary)" }}
            >
              $29
            </div>
            <div
              className="text-sm mb-8"
              style={{ color: "var(--text-secondary)" }}
            >
              One-time. Per audit.
            </div>

            <ul className="flex flex-col gap-3 mb-8">
              {PAID_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check
                    size={14}
                    className="mt-0.5 shrink-0"
                    style={{ color: "var(--ember)" }}
                    aria-hidden="true"
                  />
                  <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                </li>
              ))}
            </ul>

            <button
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "var(--ember)",
                color: "#fff",
                minHeight: "44px",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--ember-2)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "var(--ember)";
              }}
            >
              🔥 Roast My Page — $29
            </button>
            <p
              className="text-xs text-center mt-3"
              style={{ color: "var(--text-dim)" }}
            >
              No subscription. Instant access.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
