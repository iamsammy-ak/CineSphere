'use client';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ displayName: '', userName: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await axios.post('http://localhost:5001/api/auth/register', form);
      const token = data?.token || data?.accessToken;
      if (token) {
        setAuth({ userId: data.userId || '', displayName: form.displayName, userName: form.userName, accessToken: token });
        router.push('/');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--cs-bg)' }}>
      <div className="w-full max-w-md p-8 rounded-2xl border" style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)' }}>
        <div className="text-center mb-10">
          <Link href="/" className="no-underline">
            <p className="text-5xl mb-3">🎬</p>
            <h1 className="text-3xl font-black" style={{ fontFamily: 'Unbounded, sans-serif', letterSpacing: '0.06em' }}>
              <span style={{ color: 'var(--cs-primary)' }}>CINE</span><span style={{ color: 'var(--cs-text)' }}>SPHERE</span>
            </h1>
          </Link>
          <p className="mt-3 text-sm" style={{ color: 'var(--cs-muted)' }}>Join 10,000+ cinephiles</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cs-muted)' }}>Display name</label>
              <input type="text" value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })}
                placeholder="Jane Doe" required className="w-full px-4 py-3 rounded-xl border text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cs-muted)' }}>Username</label>
              <input type="text" value={form.userName} onChange={e => setForm({ ...form, userName: e.target.value })}
                placeholder="janedoe" required className="w-full px-4 py-3 rounded-xl border text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cs-muted)' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com" required className="w-full px-4 py-3.5 rounded-xl border text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--cs-muted)' }}>Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters" required className="w-full px-4 py-3.5 rounded-xl border text-sm pr-12" />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 transition-opacity hover:opacity-100"
                style={{ color: 'var(--cs-muted)', opacity: 0.5 }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl text-sm" style={{ background: 'rgba(248,81,73,0.08)', color: 'var(--cs-danger)', border: '1px solid rgba(248,81,73,0.15)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm disabled:opacity-50">
            {loading && <Loader2 size={15} style={{ animation: 'spin 0.7s linear infinite' }} />}
            {loading ? 'Creating account...' : 'Create free account'}
          </button>
        </form>

        <p className="text-center text-sm mt-8" style={{ color: 'var(--cs-muted)' }}>
          Already have one?{' '}
          <Link href="/login" className="font-semibold no-underline" style={{ color: 'var(--cs-primary)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
