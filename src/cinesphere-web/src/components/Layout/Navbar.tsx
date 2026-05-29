'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import NotificationCenter from '@/components/Notifications/NotificationCenter';

const navLinks = [
  { href: '/', label: 'Feed', icon: '🏠' },
  { href: '/search', label: 'Films', icon: '🎬' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, displayName, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    clearAuth();
    router.push('/login');
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
      style={{ background: 'rgba(22,27,34,0.92)', borderColor: 'var(--cs-border)' }}
    >
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="no-underline flex items-center gap-2">
          <span className="text-2xl" style={{ lineHeight: 1 }}>🎬</span>
          <span className="text-xl font-black" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.06em' }}>
            <span style={{ color: 'var(--cs-primary)' }}>CINE</span><span style={{ color: 'var(--cs-text)' }}>SPHERE</span>
          </span>
        </Link>

        {/* Center Nav */}
        {isAuthenticated && (
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link key={href} href={href} className="no-underline flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: pathname === href ? 'var(--cs-primary)' : 'var(--cs-muted)',
                  background: pathname === href ? 'rgba(245,197,24,0.08)' : 'transparent',
                }}
              >
                <span>{icon}</span>{label}
              </Link>
            ))}
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link href="/login" className="btn-ghost text-sm py-1.5 px-4 no-underline">Log in</Link>
              <Link href="/register" className="btn-primary text-sm no-underline">Sign up</Link>
            </>
          ) : (
            <>
              <NotificationCenter />
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: menuOpen ? 'var(--cs-primary)' : 'var(--cs-border)',
                    background: 'var(--cs-card)',
                  }}
                >
                  {displayName ? (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: 'var(--cs-primary)' }}>
                      {displayName[0].toUpperCase()}
                    </div>
                  ) : <span className="text-sm">👤</span>}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-11 w-48 rounded-2xl border overflow-hidden z-50"
                    style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.6)' }}>
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--cs-border)' }}>
                      <p className="text-sm font-semibold" style={{ color: 'var(--cs-text)' }}>{displayName}</p>
                      <p className="text-xs" style={{ color: 'var(--cs-muted)' }}>Signed in</p>
                    </div>
                    <button onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm transition-colors hover:bg-[var(--cs-card)]"
                      style={{ color: 'var(--cs-danger)' }}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
