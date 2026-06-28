import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, FileText, User, CreditCard, ExternalLink, ArrowRight } from 'lucide-react';
import { getUserAudits, getUserStats } from '@/lib/db';
import { relativeTime, scoreColor } from '@/lib/utils';

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const firstName = user.firstName ?? '';
  const email = user.emailAddresses[0]?.emailAddress ?? '';
  const plan = ((user.publicMetadata?.plan as string) ?? 'free').toLowerCase();

  const [recentAudits, stats] = await Promise.all([
    getUserAudits(user.id, 3),
    getUserStats(user.id),
  ]);

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#FAFAFA', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <header
        style={{
          borderBottom: '1px solid #1E1E28',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#09090B',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <LogoMark size={24} />
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.04em', color: '#FAFAFA' }}>
              ROAST<span style={{ color: '#E8334A' }}>LAB</span>
            </span>
          </Link>
          <span style={{ color: '#27273A', fontSize: 18, fontWeight: 300 }}>/</span>
          <span style={{ fontSize: 13, color: '#8B8BA3', fontWeight: 500 }}>Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              fontWeight: 500,
              color: '#8B8BA3',
              textDecoration: 'none',
              padding: '6px 10px',
              borderRadius: 6,
              border: '1px solid #27273A',
            }}
          >
            New audit <ExternalLink size={11} />
          </Link>
          <UserButton />
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside
          style={{
            width: 220,
            borderRight: '1px solid #1E1E28',
            padding: '24px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            position: 'sticky',
            top: 60,
            height: 'calc(100vh - 60px)',
            overflowY: 'auto',
            flexShrink: 0,
          }}
          className="hidden md:flex"
        >
          {NAV.map(({ label, href, icon: Icon }) => {
            const active = href === '/dashboard';
            return (
              <Link
                key={href}
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  color: active ? '#FAFAFA' : '#8B8BA3',
                  textDecoration: 'none',
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: active ? '#16161E' : 'transparent',
                  border: active ? '1px solid #27273A' : '1px solid transparent',
                  transition: 'background 150ms, color 150ms',
                }}
              >
                <Icon size={15} style={{ color: active ? '#E8334A' : 'inherit' }} />
                {label}
              </Link>
            );
          })}
        </aside>

        {/* Main content */}
        <main style={{ flex: 1, padding: '32px 32px', maxWidth: 900, overflowY: 'auto' }}>
          {/* Welcome */}
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, marginBottom: 4 }}>
              {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
            </h1>
            <p style={{ fontSize: 13, color: '#8B8BA3', margin: 0 }}>{email}</p>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              marginBottom: 32,
            }}
          >
            {[
              { label: 'Audits run', value: String(stats.count), note: stats.count > 0 ? 'total audits' : 'no audits yet' },
              { label: 'Current plan', value: plan === 'pro' || plan === 'full' ? plan.charAt(0).toUpperCase() + plan.slice(1) : 'Free', note: plan === 'free' ? 'Upgrade →' : 'Active' },
              { label: 'Avg. score', value: stats.avgScore !== null ? String(stats.avgScore) : '—', note: stats.avgScore !== null ? 'out of 100' : 'No data yet' },
            ].map(({ label, value, note }) => (
              <div
                key={label}
                style={{
                  background: '#111117',
                  border: '1px solid #1E1E28',
                  borderRadius: 12,
                  padding: '20px 20px',
                }}
              >
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A62', margin: '0 0 8px' }}>
                  {label}
                </p>
                <p style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: '#FAFAFA', margin: 0 }}>{value}</p>
                <p style={{ fontSize: 12, color: '#52526A', margin: '4px 0 0' }}>{note}</p>
              </div>
            ))}
          </div>

          {/* Quick audit */}
          <div
            style={{
              background: '#111117',
              border: '1px solid #1E1E28',
              borderRadius: 16,
              padding: '24px',
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
              Run new audit
            </h2>
            <div style={{ display: 'flex', gap: 10 }}>
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: '#09090B',
                  border: '1px solid #27273A',
                  borderRadius: 8,
                  padding: '0 14px',
                }}
              >
                <span style={{ fontSize: 12, color: '#4A4A62', fontFamily: 'var(--font-geist-mono), monospace' }}>https://</span>
                <input
                  type="url"
                  placeholder="yoursite.com"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 13,
                    color: '#FAFAFA',
                    padding: '11px 0',
                    fontFamily: 'var(--font-geist-mono), monospace',
                  }}
                />
              </div>
              <Link
                href="/"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '0 18px',
                  background: '#E8334A',
                  color: '#fff',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  letterSpacing: '-0.01em',
                  minHeight: 42,
                }}
              >
                Analyze <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Recent reports */}
          <div
            style={{
              background: '#111117',
              border: '1px solid #1E1E28',
              borderRadius: 16,
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                Recent reports
              </h2>
              <Link href="/dashboard/reports" style={{ fontSize: 12, color: '#8B8BA3', textDecoration: 'none' }}>
                View all
              </Link>
            </div>

            {recentAudits.length === 0 ? (
              <div style={{ border: '1px dashed #27273A', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: '#16161E', border: '1px solid #27273A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FileText size={20} style={{ color: '#4A4A62' }} />
                </div>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#8B8BA3', margin: '0 0 6px' }}>No reports yet</p>
                <p style={{ fontSize: 12, color: '#4A4A62', margin: '0 0 20px' }}>Run your first audit to see it here</p>
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 18px', background: '#E8334A', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em' }}>
                  Roast your first page <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentAudits.map((a) => {
                  const sc = scoreColor(a.score);
                  const ago = relativeTime(a.created_at);
                  return (
                    <Link key={a.id} href={`/analyze?url=${encodeURIComponent(a.url)}&tier=${a.tier}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 10, background: '#09090B', border: '1px solid #1E1E28', textDecoration: 'none', transition: 'border-color 150ms' }}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: 8, background: `${sc}15`, border: `1px solid ${sc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: sc, flexShrink: 0 }}>
                        {a.score}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.url}</p>
                        <p style={{ fontSize: 11, color: '#4A4A62', margin: 0 }}>{ago} · {a.tier} roast</p>
                      </div>
                      <ArrowRight size={12} style={{ color: '#4A4A62', flexShrink: 0 }} />
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
