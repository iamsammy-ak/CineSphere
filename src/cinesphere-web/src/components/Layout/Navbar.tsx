'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useState } from 'react';
import Cookies from 'js-cookie';

const navLinks = [
  { href: '/', label: 'Feed', icon: '🏠' },
  { href: '/search', label: 'Films', icon: '🎬' },
  { href: '/profile', label: 'Profile', icon: '👤' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, displayName, clearAuth } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    Cookies.remove('accessToken');
    clearAuth();
    window.location.href = '/login';
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--cs-border)] bg-[var(--cs-surface)]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">🎬</span>
          <span className="text-xl font-bold" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.05em', color: 'var(--cs-primary)' }}>
            CINE<span className="text-[var(--cs-text)]">SPHERE</span>
          </span>
        </Link>

        {/* Nav Links */}
        {isAuthenticated ? (
          <div className="flex items-center gap-1">
            {navLinks.map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="no-underline flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: pathname === href ? 'var(--cs-primary)' : 'var(--cs-muted)',
                  background: pathname === href ? 'rgba(245,197,24,0.08)' : 'transparent',
                }}
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost text-sm py-1.5 px-4 no-underline">Log in</Link>
            <Link href="/register" className="btn-primary text-sm no-underline">Sign up</Link>
          </div>
        )}

        {/* User Menu */}
        {isAuthenticated && (
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--cs-border)] hover:border-[var(--cs-primary)] transition-colors"
                style={{ background: 'var(--cs-card)' }}
              >
                {displayName ? (
                  <span className="text-sm font-bold flex items-center justify-center h-full" style={{ color: 'var(--cs-primary)' }}>
                    {displayName[0].toUpperCase()}
                  </span>
                ) : (
                  <span className="text-sm">👤</span>
                )}
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-10 w-44 rounded-xl border border-[var(--cs-border)] overflow-hidden"
                  style={{ background: 'var(--cs-surface)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', zIndex: 100 }}
                >
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--cs-card)] transition-colors"
                    style={{ color: 'var(--cs-danger)' }}
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
