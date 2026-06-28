import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, FileText, User, CreditCard, ExternalLink, Search, ArrowRight } from 'lucide-react';
import { getUserAudits } from '@/lib/db';

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

export default async function ReportsPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const audits = await getUserAudits(user.id, 50);

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
          <span style={{ fontSize: 13, color: '#8B8BA3', fontWeight: 500 }}>Reports</span>
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
            const active = href === '/dashboard/reports';
            return (
              <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? '#FAFAFA' : '#8B8BA3', textDecoration: 'none', padding: '9px 12px', borderRadius: 8, background: active ? '#16161E' : 'transparent', border: active ? '1px solid #27273A' : '1px solid transparent' }}>
                <Icon size={15} style={{ color: active ? '#E8334A' : 'inherit' }} />
                {label}
              </Link>
            );
          })}
        </aside>

        <main style={{ flex: 1, padding: '32px', maxWidth: 900 }}>
          <div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 4px' }}>Reports</h1>
              <p style={{ fontSize: 13, color: '#8B8BA3', margin: 0 }}>All your past audit reports</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#111117', border: '1px solid #27273A', borderRadius: 8, padding: '0 12px', height: 36 }}>
              <Search size={13} style={{ color: '#4A4A62' }} />
              <input type="search" placeholder="Search reports..." style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#FAFAFA', width: 180 }} />
            </div>
          </div>

          {/* Filter tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #1E1E28', paddingBottom: 0 }}>
            {['All', 'Free', 'Full report'].map((f, i) => (
              <button key={f} style={{ fontSize: 13, fontWeight: i === 0 ? 600 : 500, color: i === 0 ? '#FAFAFA' : '#8B8BA3', background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px 14px', borderBottom: i === 0 ? '2px solid #E8334A' : '2px solid transparent', marginBottom: -1 }}>
                {f}
              </button>
            ))}
          </div>

          {audits.length === 0 ? (
            <div style={{ border: '1px dashed #27273A', borderRadius: 16, padding: '80px 24px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#16161E', border: '1px solid #27273A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FileText size={22} style={{ color: '#4A4A62' }} />
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#8B8BA3', margin: '0 0 8px' }}>No reports yet</p>
              <p style={{ fontSize: 13, color: '#4A4A62', margin: '0 0 24px' }}>Analyze your first landing page to see reports here.</p>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#E8334A', color: '#fff', borderRadius: 8, fontSize: 13, fontWeight: 700, textDecoration: 'none', letterSpacing: '-0.01em' }}>
                Run first audit <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {audits.map((a) => {
                const scoreColor = a.score >= 70 ? '#32D74B' : a.score >= 45 ? '#FFD60A' : '#FF2D55';
                const dimCount = Array.isArray(a.dimensions) ? a.dimensions.length : 0;
                const date = new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                return (
                  <Link key={a.id} href={`/analyze?url=${encodeURIComponent(a.url)}&tier=${a.tier}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: '#111117', border: '1px solid #1E1E28', textDecoration: 'none' }}
                  >
                    <div style={{ width: 48, height: 48, borderRadius: 10, background: `${scoreColor}15`, border: `1px solid ${scoreColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: scoreColor, flexShrink: 0 }}>
                      {a.score}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#FAFAFA', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.url}</p>
                      <p style={{ fontSize: 12, color: '#4A4A62', margin: 0 }}>{date} · {dimCount} dimensions · {a.tier} roast</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: a.tier === 'full' ? '#E8334A18' : '#27273A', color: a.tier === 'full' ? '#E8334A' : '#8B8BA3', fontWeight: 600 }}>
                        {a.tier}
                      </span>
                      <ArrowRight size={12} style={{ color: '#4A4A62' }} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
