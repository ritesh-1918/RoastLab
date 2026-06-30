import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogoMark } from '@/components/logo';
import { UserButton } from '@clerk/nextjs';
import { LayoutDashboard, FileText, User, CreditCard } from 'lucide-react';
import { getUserAudits } from '@/lib/db';
import { ReportsList } from '@/components/dashboard/reports-list';

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
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <LogoMark size={24} />
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: '-0.04em', color: '#FAFAFA' }}>ROAST<span style={{ color: '#E8334A' }}>LAB</span></span>
          </Link>
          <span style={{ color: '#27273A', fontSize: 18 }}>/</span>
          <span style={{ fontSize: 13, color: '#8B8BA3', fontWeight: 500 }}>Reports</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <a href="/dashboard#quick-audit" style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: '#8B8BA3', textDecoration: 'none', padding: '6px 10px', borderRadius: 6, border: '1px solid #27273A' }}>
            New audit
          </a>
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
          <ReportsList audits={audits} />
        </main>
      </div>
    </div>
  );
}
