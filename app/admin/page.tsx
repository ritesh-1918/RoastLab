import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';
import { getAllAudits, getGlobalStats } from '@/lib/db';
import { ArrowLeft, ExternalLink, Users, BarChart3, Zap } from 'lucide-react';
import { ScoreBadge } from '@/components/ui/score-badge';
import { TierBadge } from '@/components/ui/tier-badge';
import { relativeTime } from '@/lib/utils';

const ADMIN_EMAIL = 'ritesh@gratiantechnologies.com';

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const email = user.emailAddresses[0]?.emailAddress?.toLowerCase() ?? '';
  if (email !== ADMIN_EMAIL) {
    redirect('/dashboard');
  }

  const [audits, globalStats] = await Promise.all([
    getAllAudits(100),
    getGlobalStats(),
  ]);

  const statCards = [
    { label: 'Total Audits', value: String(globalStats.totalAudits), icon: BarChart3, color: '#E8334A' },
    { label: 'Unique Users', value: String(globalStats.uniqueUsers), icon: Users, color: '#5E5CE6' },
    { label: 'Avg Score', value: globalStats.avgScore !== null ? String(globalStats.avgScore) : '—', icon: Zap, color: '#FFD60A' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#FAFAFA' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1E1E28', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, background: '#09090B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <LogoMark size={22} />
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.04em', color: '#FAFAFA' }}>
              ROAST<span style={{ color: '#E8334A' }}>LAB</span>
            </span>
          </Link>
          <span style={{ color: '#27273A', fontSize: 18 }}>/</span>
          <span style={{ fontSize: 13, color: '#E8334A', fontWeight: 700 }}>Admin</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8B8BA3', textDecoration: 'none', padding: '5px 10px', borderRadius: 6, border: '1px solid #27273A' }}>
            <ArrowLeft size={11} /> Dashboard
          </Link>
          <UserButton />
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px 80px' }}>
        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 4px', color: '#FAFAFA' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#4A4A62', margin: 0 }}>
            Full visibility · {email}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {statCards.map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 14, padding: '20px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A62', margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', margin: 0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* All Audits table */}
        <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #1E1E28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>All Audits</h2>
            <span style={{ fontSize: 12, color: '#4A4A62' }}>{audits.length} records</span>
          </div>

          {audits.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center', color: '#4A4A62', fontSize: 13 }}>
              No audits yet. Set DATABASE_URL to start saving.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E1E28' }}>
                    {['Score', 'URL', 'User ID', 'Tier', 'Dims', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A62', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                    <th style={{ padding: '10px 16px', width: 40 }} />
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a, i) => {
                    const scoreColor = a.score >= 70 ? '#32D74B' : a.score >= 45 ? '#FFD60A' : '#FF2D55';
                    const dimCount = Array.isArray(a.dimensions) ? a.dimensions.length : 0;
                    const date = new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    return (
                      <tr key={a.id} style={{ borderBottom: i < audits.length - 1 ? '1px solid #16161E' : 'none', transition: 'background 100ms' }}>
                        <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: scoreColor }}>{a.score}</span>
                        </td>
                        <td style={{ padding: '10px 16px', maxWidth: 300 }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#FAFAFA' }}>{a.url}</span>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: 11, color: '#4A4A62', fontFamily: 'monospace' }}>{a.user_id.slice(0, 16)}…</span>
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 5, background: a.tier === 'full' ? '#E8334A18' : '#27273A', color: a.tier === 'full' ? '#E8334A' : '#8B8BA3', fontWeight: 600 }}>
                            {a.tier}
                          </span>
                        </td>
                        <td style={{ padding: '10px 16px', color: '#8B8BA3', textAlign: 'center' }}>{dimCount}</td>
                        <td style={{ padding: '10px 16px', color: '#4A4A62', whiteSpace: 'nowrap' }}>{date}</td>
                        <td style={{ padding: '10px 16px' }}>
                          <Link href={`/analyze?url=${encodeURIComponent(a.url)}&tier=${a.tier}`} target="_blank"
                            style={{ color: '#4A4A62', display: 'flex', alignItems: 'center' }}>
                            <ExternalLink size={12} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DB setup notice if no data */}
        {audits.length === 0 && (
          <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: '#1A1A0A', border: '1px solid #FFD60A33', fontSize: 13, color: '#FFD60A', lineHeight: 1.6 }}>
            <strong>Setup needed:</strong> Go to Vercel Dashboard → Storage → Create Database → Neon Postgres.
            Copy <code style={{ fontFamily: 'monospace', background: 'rgba(255,214,10,0.1)', padding: '1px 4px', borderRadius: 3 }}>POSTGRES_URL</code> into your environment variables as <code style={{ fontFamily: 'monospace', background: 'rgba(255,214,10,0.1)', padding: '1px 4px', borderRadius: 3 }}>DATABASE_URL</code>, then redeploy.
          </div>
        )}
      </main>
    </div>
  );
}
