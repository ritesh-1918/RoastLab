import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';
import {
  getAllAudits, getAdminStats, getApiUsageStats,
  getEmailLogs, getAllSettings,
} from '@/lib/db';
import {
  ArrowLeft, ExternalLink, Users, BarChart3, Zap,
  Mail, Activity, Settings, AlertTriangle, TrendingUp,
} from 'lucide-react';
import { ScoreBadge } from '@/components/ui/score-badge';
import { TierBadge } from '@/components/ui/tier-badge';
import { relativeTime } from '@/lib/utils';
import { AdminPromptsPanel } from '@/components/admin/prompts-panel';

const ADMIN_EMAILS = ['ritesh@gratiantechnologies.com', 'bonthalamadhavi1@gmail.com'];

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const email = user.emailAddresses[0]?.emailAddress?.toLowerCase() ?? '';
  if (!ADMIN_EMAILS.includes(email)) redirect('/dashboard');

  const [audits, stats, apiStats, emailLogs, settings] = await Promise.all([
    getAllAudits(200),
    getAdminStats(),
    getApiUsageStats(),
    getEmailLogs(100),
    getAllSettings(),
  ]);

  const statCards = [
    { label: 'Total Audits', value: String(stats.totalAudits), sub: `${stats.todayAudits} today`, icon: BarChart3, color: '#E8334A' },
    { label: 'Unique Users', value: String(stats.uniqueUsers), sub: 'registered', icon: Users, color: '#5E5CE6' },
    { label: 'Avg Score', value: stats.avgScore !== null ? String(stats.avgScore) : '—', sub: 'across all audits', icon: TrendingUp, color: '#FFD60A' },
    { label: 'Emails Sent', value: String(stats.totalEmails), sub: 'audit reports', icon: Mail, color: '#32D74B' },
    { label: 'Free / Full', value: `${stats.freeAudits} / ${stats.fullAudits}`, sub: 'tier split', icon: Activity, color: '#FF9F0A' },
    { label: 'API Calls', value: String(apiStats.totalCalls), sub: `${(apiStats.totalTokensIn + apiStats.totalTokensOut).toLocaleString()} tokens`, icon: Zap, color: '#64D2FF' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#09090B', color: '#FAFAFA' }}>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #1E1E28', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, background: '#09090B' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <LogoMark size={22} />
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.04em', color: '#FAFAFA' }}>ROAST<span style={{ color: '#E8334A' }}>LAB</span></span>
          </Link>
          <span style={{ color: '#27273A', fontSize: 18 }}>/</span>
          <span style={{ fontSize: 13, color: '#E8334A', fontWeight: 700 }}>Admin</span>
          <span style={{ fontSize: 10, color: '#2E2E4E', background: '#1A1A28', border: '1px solid #27273A', padding: '2px 7px', borderRadius: 99, fontFamily: 'monospace' }}>{email}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#8B8BA3', textDecoration: 'none', padding: '5px 10px', borderRadius: 6, border: '1px solid #27273A' }}>
            <ArrowLeft size={11} /> Dashboard
          </Link>
          <UserButton />
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px 80px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', margin: '0 0 4px' }}>Admin Dashboard</h1>
          <p style={{ fontSize: 13, color: '#4A4A62', margin: 0 }}>Full platform visibility — all stats, users, API usage, prompts</p>
        </div>

        {/* Stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 40 }}>
          {statCards.map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 12, padding: '18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 9, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={16} style={{ color }} />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A62', margin: '0 0 3px' }}>{label}</p>
                <p style={{ fontSize: 26, fontWeight: 900, letterSpacing: '-0.04em', color: '#FAFAFA', margin: '0 0 1px' }}>{value}</p>
                <p style={{ fontSize: 10, color: '#3A3A52', margin: 0 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* API usage by provider */}
        {apiStats.byProvider.length > 0 && (
          <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 14, overflow: 'hidden', marginBottom: 32 }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #1E1E28', display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={14} style={{ color: '#64D2FF' }} />
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>API Usage by Provider / Model</h2>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E1E28' }}>
                    {['Provider', 'Model', 'Calls', 'Tokens In', 'Tokens Out', 'Total Tokens'].map(h => (
                      <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A62' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {apiStats.byProvider.map((p, i) => (
                    <tr key={i} style={{ borderBottom: i < apiStats.byProvider.length - 1 ? '1px solid #16161E' : 'none' }}>
                      <td style={{ padding: '9px 16px', color: '#FAFAFA', fontWeight: 600 }}>{p.provider}</td>
                      <td style={{ padding: '9px 16px', color: '#8B8BA3', fontFamily: 'monospace', fontSize: 11 }}>{p.model}</td>
                      <td style={{ padding: '9px 16px', color: '#64D2FF', fontWeight: 700 }}>{p.calls.toLocaleString()}</td>
                      <td style={{ padding: '9px 16px', color: '#8B8BA3' }}>{(p.tokens_in ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '9px 16px', color: '#8B8BA3' }}>{(p.tokens_out ?? 0).toLocaleString()}</td>
                      <td style={{ padding: '9px 16px', color: '#FFD60A', fontWeight: 700 }}>{((p.tokens_in ?? 0) + (p.tokens_out ?? 0)).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Audits */}
        <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 14, overflow: 'hidden', marginBottom: 32 }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #1E1E28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BarChart3 size={14} style={{ color: '#E8334A' }} />
              <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>All Audits</h2>
            </div>
            <span style={{ fontSize: 11, color: '#4A4A62' }}>{audits.length} records</span>
          </div>
          {audits.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#4A4A62', fontSize: 13 }}>
              <AlertTriangle size={24} style={{ color: '#FFD60A', marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
              No audits yet. Set DATABASE_URL to start saving.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E1E28' }}>
                    {['Score', 'URL', 'User', 'Tier', 'Dims', 'Date'].map(h => (
                      <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A62', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                    <th style={{ padding: '9px 16px', width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {audits.map((a, i) => {
                    const dimCount = Array.isArray(a.dimensions) ? a.dimensions.length : 0;
                    return (
                      <tr key={a.id} style={{ borderBottom: i < audits.length - 1 ? '1px solid #16161E' : 'none' }}>
                        <td style={{ padding: '9px 16px', whiteSpace: 'nowrap' }}><ScoreBadge score={a.score} size="sm" /></td>
                        <td style={{ padding: '9px 16px', maxWidth: 260 }}>
                          <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#FAFAFA' }}>{a.url}</span>
                        </td>
                        <td style={{ padding: '9px 16px' }}>
                          <span style={{ fontSize: 10, color: '#4A4A62', fontFamily: 'monospace' }}>{a.user_id.slice(0, 14)}…</span>
                        </td>
                        <td style={{ padding: '9px 16px' }}><TierBadge tier={a.tier} /></td>
                        <td style={{ padding: '9px 16px', color: '#8B8BA3', textAlign: 'center' }}>{dimCount}</td>
                        <td style={{ padding: '9px 16px', color: '#4A4A62', whiteSpace: 'nowrap', fontSize: 11 }}>{relativeTime(a.created_at)}</td>
                        <td style={{ padding: '9px 16px' }}>
                          {a.url !== 'screenshot-upload' && (
                            <Link href={`/analyze?url=${encodeURIComponent(a.url)}&tier=${a.tier}`} target="_blank" style={{ color: '#4A4A62' }}>
                              <ExternalLink size={11} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Email logs */}
        {emailLogs.length > 0 && (
          <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 14, overflow: 'hidden', marginBottom: 32 }}>
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #1E1E28', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Mail size={14} style={{ color: '#32D74B' }} />
                <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Emails Sent</h2>
              </div>
              <span style={{ fontSize: 11, color: '#4A4A62' }}>{emailLogs.length} records</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E1E28' }}>
                    {['To', 'Subject', 'Score', 'Tier', 'Sent'].map(h => (
                      <th key={h} style={{ padding: '9px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#4A4A62' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emailLogs.map((e, i) => (
                    <tr key={e.id} style={{ borderBottom: i < emailLogs.length - 1 ? '1px solid #16161E' : 'none' }}>
                      <td style={{ padding: '9px 16px', color: '#FAFAFA' }}>{e.email}</td>
                      <td style={{ padding: '9px 16px', maxWidth: 300 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#8B8BA3', fontSize: 11 }}>{e.subject}</span>
                      </td>
                      <td style={{ padding: '9px 16px' }}>
                        <span style={{ fontWeight: 700, color: e.score >= 65 ? '#32D74B' : e.score >= 40 ? '#FFD60A' : '#FF2D55' }}>{e.score}</span>
                      </td>
                      <td style={{ padding: '9px 16px' }}><TierBadge tier={e.tier} /></td>
                      <td style={{ padding: '9px 16px', color: '#4A4A62', fontSize: 11, whiteSpace: 'nowrap' }}>{relativeTime(e.sent_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Prompt customization */}
        <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', borderBottom: '1px solid #1E1E28', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Settings size={14} style={{ color: '#BF5AF2' }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>AI Prompt Customization</h2>
            <span style={{ fontSize: 10, color: '#4A4A62', background: '#1A1A28', border: '1px solid #27273A', padding: '2px 7px', borderRadius: 99 }}>live overrides</span>
          </div>
          <AdminPromptsPanel settings={settings} />
        </div>
      </main>
    </div>
  );
}
