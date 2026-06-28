"use client";

import { motion } from "motion/react";
import { Upload, Zap, FileText } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Drop your page",
    desc: "Paste a URL or upload a screenshot. Works for live pages, Figma mocks, and competitor audits.",
  },
  {
    icon: Zap,
    step: "02",
    title: "AI roasts it",
    desc: "Vision AI analyzes your page across 9 dimensions simultaneously. Results stream in as each finishes.",
  },
  {
    icon: FileText,
    step: "03",
    title: "Fix what matters",
    desc: "Get a ranked list of issues with specific copy quoted from your page and one clear action each.",
  },
];

export function HowItWorks() {
  return (
    <section className="px-4 py-24" aria-label="How it works">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--ember)" }}
          >
            How it works
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            From page to verdict in 60 seconds
          </h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div
            aria-hidden="true"
            className="hidden sm:block absolute top-8 left-[calc(16.7%+16px)] right-[calc(16.7%+16px)] h-px"
            style={{ background: "var(--border-emph)" }}
          />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.step}
                className="flex flex-col items-center text-center p-6 rounded-2xl border"
                style={{
                  background: "var(--bg-card)",
                  borderColor: "var(--border-subtle)",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.45,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 relative z-10"
                  style={{
                    background: "var(--bg-hover)",
                    border: "1px solid var(--border-emph)",
                  }}
                >
                  <Icon size={22} style={{ color: "var(--ember)" }} aria-hidden="true" />
                </div>

                {/* Step number */}
                <div
                  className="text-xs font-bold uppercase tracking-widest mb-2"
                  style={{ color: "var(--text-dim)" }}
                >
                  {s.step}
                </div>

                <h3
                  className="text-base font-semibold mb-2 tracking-tight"
                  style={{ color: "var(--text-primary)" }}
                >
                  {s.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
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
