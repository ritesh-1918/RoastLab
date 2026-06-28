'use client';

import { useState, useEffect } from 'react';
import { Logo } from '@/components/logo';

const NAV_LINKS = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Pricing', href: '#pricing' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  function scrollToInput(e: React.MouseEvent) {
    e.preventDefault();
    const el = document.getElementById('hero-input');
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => (el as HTMLInputElement | null)?.focus(), 600);
  }

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: `1px solid ${scrolled ? 'var(--border-subtle)' : 'transparent'}`,
        background: scrolled ? 'rgba(8,8,16,0.82)' : 'transparent',
        backdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(18px) saturate(180%)' : 'none',
        transition: 'border-color 200ms, background 200ms, backdrop-filter 200ms',
        padding: '0 20px',
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        <Logo size={26} />

        <nav
          aria-label="Main navigation"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {/* Desktop links — hidden on small screens via inline style trick */}
          <div
            style={{
              display: 'flex',
              gap: 4,
              marginRight: 12,
            }}
            className="hidden sm:flex"
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'var(--text-dim)',
                  textDecoration: 'none',
                  padding: '6px 10px',
                  borderRadius: 6,
                  transition: 'color 140ms, background 140ms',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = 'var(--text-primary)';
                  el.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLAnchorElement;
                  el.style.color = 'var(--text-dim)';
                  el.style.background = 'transparent';
                }}
              >
                {l.label}
              </a>
            ))}
          </div>

          <button
            onClick={scrollToInput}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 16px',
              borderRadius: 8,
              background: 'var(--ember)',
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 140ms, transform 100ms',
              minHeight: 36,
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ember-2)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--ember)';
            }}
          >
            Get Roasted →
          </button>
        </nav>
      </div>
    </header>
  );
}
