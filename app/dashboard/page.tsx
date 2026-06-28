import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { LogoMark } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <header style={{
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 24px',
        height: 56,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LogoMark size={24} />
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em' }}>
            ROAST<span style={{ color: 'var(--ember)' }}>LAB</span>
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-dim)', marginLeft: 8 }}>/ Dashboard</span>
        </div>
        <UserButton />
      </header>

      <main style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px' }}>
        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 6 }}>
            Welcome back{user.firstName ? `, ${user.firstName}` : ''} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>

        {/* Plan info */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: '24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--ember)', marginBottom: 4 }}>
              Current Plan
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em' }}>Free</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>3 audits remaining</div>
          </div>
          <a
            href="/#pricing"
            style={{
              padding: '10px 20px',
              background: 'var(--ember)',
              color: '#fff',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              textDecoration: 'none',
              letterSpacing: '-0.01em',
            }}
          >
            Upgrade Plan →
          </a>
        </div>

        {/* Quick actions */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: '24px',
          marginBottom: 24,
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em' }}>
            New Audit
          </h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="url"
              placeholder="https://yoursite.com"
              style={{
                flex: 1,
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-emph)',
                borderRadius: 8,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--text-primary)',
                outline: 'none',
                fontFamily: 'var(--font-geist-mono)',
              }}
            />
            <a
              href="/"
              style={{
                padding: '10px 18px',
                background: 'var(--ember)',
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Roast it 🔥
            </a>
          </div>
        </div>

        {/* Past audits placeholder */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 16,
          padding: '24px',
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, letterSpacing: '-0.01em' }}>
            Past Audits
          </h2>
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-dim)',
            fontSize: 13,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🔥</div>
            No audits yet. Roast your first site to get started.
          </div>
        </div>
      </main>
    </div>
  );
}
