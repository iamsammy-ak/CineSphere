'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/store';
import axios from 'axios';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5001/api/auth/login', form);
      const token = data?.token || data?.accessToken || data;
      if (token) {
        setAuth({ userId: data.userId || data.sub || 'unknown', displayName: data.displayName || data.email, userName: data.userName || '', accessToken: token });
        window.location.href = '/';
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--cs-bg)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl border border-[var(--cs-border)]" style={{ background: 'var(--cs-surface)' }}>
        <div className="text-center mb-8">
          <Link href="/" className="no-underline">
            <div className="text-4xl mb-2">🎬</div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.05em' }}>
              <span style={{ color: 'var(--cs-primary)' }}>CINE</span><span>SPHERE</span>
            </h1>
          </Link>
          <p className="mt-2 text-sm" style={{ color: 'var(--cs-muted)' }}>Welcome back to your film world</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cs-muted)' }}>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-3 rounded-lg border text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cs-muted)' }}>Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-lg border text-sm pr-12"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 opacity-50 hover:opacity-100" style={{ color: 'var(--cs-muted)' }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--cs-danger)', border: '1px solid rgba(248,81,73,0.2)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {loading && <Loader2 size={16} className="animate-spin" />}
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--cs-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium no-underline" style={{ color: 'var(--cs-primary)' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
