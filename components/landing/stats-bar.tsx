'use client';
import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'motion/react';

const stats = [
  { value: '9', label: 'audit dimensions', numeric: 9 },
  { value: '~60s', label: 'average time', numeric: null },
  { value: '3', label: 'free audits', numeric: 3 },
  { value: '₹0', label: 'to get started', numeric: null },
];

function CountUp({ target, trigger }: { target: number; trigger: boolean }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let frame = 0;
    const total = 50;
    const timer = setInterval(() => {
      frame++;
      if (frame >= total) { setCount(target); clearInterval(timer); }
      else setCount(Math.round((frame / total) * target));
    }, 18);
    return () => clearInterval(timer);
  }, [trigger, target]);
  return <>{count}</>;
}

export function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section
      ref={ref}
      style={{
        borderTop: '1px solid #1E1E28',
        borderBottom: '1px solid #1E1E28',
        padding: '32px 24px',
        background: '#111117',
      }}
    >
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px 16px' }}
          className="sm:grid-cols-4"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <span style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', lineHeight: 1 }}>
                {s.numeric !== null ? (
                  <CountUp target={s.numeric} trigger={inView} />
                ) : s.value}
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A62' }}>
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
