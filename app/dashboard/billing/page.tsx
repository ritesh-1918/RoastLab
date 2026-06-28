import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, FileText, User, CreditCard, ExternalLink, Check, ArrowRight } from 'lucide-react';

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

const PLANS = [
  {
    name: 'Free',
    price: '₹0',
    period: 'forever',
    features: ['3 free audits', '3 dimensions per report', 'No signup required', 'Shareable link'],
    current: true,
    cta: 'Current plan',
    ctaHref: null,
  },
  {
    name: 'Full Report',
    price: '₹2,499',
    period: 'one-time',
    features: ['All 9 dimensions', '"Fix These First" priority list', 'UX, Mobile, SEO, Performance', 'Accessibility audit', 'PDF export'],
    current: false,
    cta: 'Buy report',
    ctaHref: '/#pricing',
  },
];

export default async function BillingPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header style={{ borderBottom: '1px solid #1E1E28', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#09090B', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <LogoMark size={24} />
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.04em', color: '#FAFAFA' }}>ROAST<span style={{ color: '#E8334A' }}>LAB</span></span>
          </Link>
          <span style={{ color: '#27273A', fontSize: 18 }}>/</span>
          <span style={{ fontSize: 13, color: '#8B8BA3', fontWeight: 500 }}>Billing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#8B8BA3', textDecoration: 'none', padding: '6px 10px', borderRadius: 6, border: '1px solid #27273A' }}>
            New audit <ExternalLink size={11} />
          </Link>
          <UserButton />
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        <aside style={{ width: 220, borderRight: '1px solid #1E1E28', padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: 4, position: 'sticky', top: 60, height: 'calc(100vh - 60px)', overflowY: 'auto', flexShrink: 0 }} className="hidden md:flex">
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href === '/dashboard/billing';
            return (
              <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? '#FAFAFA' : '#8B8BA3', textDecoration: 'none', padding: '9px 12px', borderRadius: 8, background: active ? '#16161E' : 'transparent', border: active ? '1px solid #27273A' : '1px solid transparent' }}>
                <Icon size={15} style={{ color: active ? '#E8334A' : 'inherit' }} />
                {label}
              </Link>
            );
          })}
        </aside>

        <main style={{ flex: 1, padding: '32px', maxWidth: 800 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 4px' }}>Billing</h1>
            <p style={{ fontSize: 13, color: '#8B8BA3', margin: 0 }}>Plans and payment history</p>
          </div>

          {/* Current plan */}
          <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 16, padding: '24px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#E8334A', margin: '0 0 8px' }}>Current Plan</p>
              <p style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Free</p>
              <p style={{ fontSize: 13, color: '#8B8BA3', margin: '4px 0 0' }}>3 audits · 3 dimensions each</p>
            </div>
            <Link href="/#pricing" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: '#E8334A', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em' }}>
              Upgrade <ArrowRight size={13} />
            </Link>
          </div>

          {/* Plans */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16, marginBottom: 32 }}>
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                style={{
                  background: '#111117',
                  border: plan.current ? '1px solid #27273A' : '1px solid #E8334A22',
                  borderRadius: 16,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  position: 'relative',
                }}
              >
                {plan.current && (
                  <span style={{ position: 'absolute', top: 16, right: 16, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 99, background: '#27273A', color: '#8B8BA3' }}>
                    Active
                  </span>
                )}
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, margin: '0 0 8px' }}>{plan.name}</p>
                  <p style={{ fontSize: 28, fontWeight: 900, letterSpacing: '-0.03em', margin: 0 }}>
                    {plan.price}
                    <span style={{ fontSize: 13, fontWeight: 500, color: '#8B8BA3' }}> / {plan.period}</span>
                  </p>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#8B8BA3' }}>
                      <Check size={13} style={{ color: '#22C55E', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.ctaHref ? (
                  <Link href={plan.ctaHref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 16px', background: '#E8334A', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', marginTop: 'auto', letterSpacing: '-0.01em' }}>
                    {plan.cta} <ArrowRight size={13} />
                  </Link>
                ) : (
                  <button disabled style={{ padding: '10px 16px', background: '#1E1E28', color: '#4A4A62', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', marginTop: 'auto', cursor: 'not-allowed' }}>
                    {plan.cta}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Payment history */}
          <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 16, padding: '24px' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px', letterSpacing: '-0.02em' }}>Payment history</h2>
            <div style={{ textAlign: 'center', padding: '32px', color: '#4A4A62', fontSize: 13 }}>
              No payments yet.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
