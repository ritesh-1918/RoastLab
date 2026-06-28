'use client';
import { motion } from 'motion/react';
import { AnimatedCounter } from '@/components/ui/animated-counter';

const stats = [
  { value: 1200, suffix: '+', label: 'pages audited' },
  { value: 9, suffix: '', label: 'audit dimensions' },
  { value: 60, suffix: 's', label: 'average time' },
  { value: 4.9, suffix: '/5', label: 'avg rating', isDecimal: true },
];

export function StatsBar() {
  return (
    <section
      className="border-y py-8 px-4"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-1)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              className="flex flex-col items-center gap-1"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="text-3xl font-extrabold tracking-tight tabular-nums"
                style={{ color: 'var(--text-primary)' }}
              >
                {s.isDecimal ? (
                  <span>{s.value}{s.suffix}</span>
                ) : (
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                )}
              </div>
              <div
                className="text-xs uppercase tracking-widest font-semibold"
                style={{ color: 'var(--text-dim)' }}
              >
                {s.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
