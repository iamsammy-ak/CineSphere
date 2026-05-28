'use client';

import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ displayName: '', userName: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('http://localhost:5001/api/auth/register', form);
      const token = data?.token || data?.accessToken || data;
      if (token) {
        setAuth({ userId: data.userId || 'unknown', displayName: form.displayName, userName: form.userName, accessToken: token });
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
          <p className="mt-2 text-sm" style={{ color: 'var(--cs-muted)' }}>Join the social film network</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cs-muted)' }}>Display Name</label>
              <input type="text" value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })} placeholder="Jane Doe" required className="w-full px-4 py-3 rounded-lg border text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cs-muted)' }}>Username</label>
              <input type="text" value={form.userName} onChange={(e) => setForm({ ...form, userName: e.target.value })} placeholder="janedoe" required className="w-full px-4 py-3 rounded-lg border text-sm" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cs-muted)' }}>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required className="w-full px-4 py-3 rounded-lg border text-sm" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--cs-muted)' }}>Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required className="w-full px-4 py-3 rounded-lg border text-sm pr-12" />
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
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--cs-muted)' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-medium no-underline" style={{ color: 'var(--cs-primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
