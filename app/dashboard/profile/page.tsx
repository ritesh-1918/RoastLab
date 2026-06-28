import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, FileText, User, CreditCard, ExternalLink, Mail, Calendar, Shield } from 'lucide-react';

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Reports', href: '/dashboard/reports', icon: FileText },
  { label: 'Profile', href: '/dashboard/profile', icon: User },
  { label: 'Billing', href: '/dashboard/billing', icon: CreditCard },
];

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) redirect('/sign-in');

  const email = user.emailAddresses[0]?.emailAddress ?? '—';
  const created = new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  const providers = user.externalAccounts.map(a => a.provider);

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
          <span style={{ fontSize: 13, color: '#8B8BA3', fontWeight: 500 }}>Profile</span>
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
            const active = href === '/dashboard/profile';
            return (
              <Link key={href} href={href} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: active ? 600 : 500, color: active ? '#FAFAFA' : '#8B8BA3', textDecoration: 'none', padding: '9px 12px', borderRadius: 8, background: active ? '#16161E' : 'transparent', border: active ? '1px solid #27273A' : '1px solid transparent' }}>
                <Icon size={15} style={{ color: active ? '#E8334A' : 'inherit' }} />
                {label}
              </Link>
            );
          })}
        </aside>

        <main style={{ flex: 1, padding: '32px', maxWidth: 720 }}>
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 4px' }}>Profile</h1>
            <p style={{ fontSize: 13, color: '#8B8BA3', margin: 0 }}>Manage your account details</p>
          </div>

          {/* Avatar + name */}
          <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 16, padding: '28px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#E8334A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 800, color: '#fff', flexShrink: 0, letterSpacing: '-0.03em' }}>
              {((user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '')).toUpperCase() || user.emailAddresses[0]?.emailAddress?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p style={{ fontSize: 20, fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {[user.firstName, user.lastName].filter(Boolean).join(' ') || 'Anonymous'}
              </p>
              <p style={{ fontSize: 13, color: '#8B8BA3', margin: '4px 0 0' }}>{email}</p>
            </div>
          </div>

          {/* Info fields */}
          <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 16, overflow: 'hidden', marginBottom: 16 }}>
            {[
              { icon: Mail, label: 'Email', value: email },
              { icon: Calendar, label: 'Member since', value: created },
              { icon: Shield, label: 'Connected accounts', value: providers.length > 0 ? providers.join(', ') : 'Email only' },
            ].map(({ icon: Icon, label, value }, i, arr) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 24px',
                  borderBottom: i < arr.length - 1 ? '1px solid #1E1E28' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon size={15} style={{ color: '#4A4A62' }} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#8B8BA3' }}>{label}</span>
                </div>
                <span style={{ fontSize: 13, color: '#FAFAFA', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Manage via Clerk note */}
          <div style={{ background: '#111117', border: '1px solid #1E1E28', borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA', margin: '0 0 4px' }}>Account settings</p>
              <p style={{ fontSize: 12, color: '#8B8BA3', margin: 0 }}>Update name, password, and connected accounts via the user menu</p>
            </div>
            <div>
              <UserButton showName />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
