'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 8);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  return (
    <header
      role="banner"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: scrolled ? '1px solid #1E1E28' : '1px solid transparent',
        background: scrolled ? 'rgba(9,9,11,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'border-color 180ms ease, background 180ms ease',
        padding: '0 24px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Logo size={24} />
        </Link>

        {/* Center nav */}
        <nav
          aria-label="Main navigation"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
          className="hidden md:flex"
        >
          {[
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Pricing', href: '#pricing' },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#8B8BA3',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: 6,
                transition: 'color 150ms',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#FAFAFA'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#8B8BA3'; }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {!isLoaded ? (
            <div style={{ width: 120, height: 36 }} />
          ) : isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#8B8BA3',
                  textDecoration: 'none',
                  padding: '6px 12px',
                  borderRadius: 6,
                  transition: 'color 150ms',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#FAFAFA'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = '#8B8BA3'; }}
              >
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#8B8BA3',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px 12px',
                    borderRadius: 6,
                    transition: 'color 150ms',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#FAFAFA'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#8B8BA3'; }}
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#fff',
                    background: '#E8334A',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 18px',
                    borderRadius: 8,
                    letterSpacing: '-0.01em',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#C92B3E'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#E8334A'; }}
                >
                  Get started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
