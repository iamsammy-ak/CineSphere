'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Film } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';
import PostCard from '@/components/Feed/PostCard';
import CreatePostModal from '@/components/Feed/CreatePostModal';
import { PostDto } from '@/lib/types';

export default function FeedPage() {
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed', page],
    queryFn: () => api.get('/feed', { params: { page, pageSize: 20 } }).then(r => r.data),
    enabled: isAuthenticated,
    retry: false,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" style={{ background: 'var(--cs-bg)' }}>
        <p className="text-7xl mb-6">🎬</p>
        <h1 className="text-5xl font-black mb-4" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.06em', color: 'var(--cs-text)' }}>
          <span style={{ color: 'var(--cs-primary)' }}>CINE</span>SPHERE
        </h1>
        <p className="text-xl mb-10" style={{ color: 'var(--cs-muted)' }}>Your social film diary</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <Link href="/login" className="btn-primary no-underline px-8 py-3 text-base">Sign in</Link>
          <Link href="/register" className="btn-ghost no-underline px-8 py-3 text-base">Create account</Link>
        </div>
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
          {[
            { icon: '🎬', label: 'Log any film', desc: 'Search TMDB and record what you watch' },
            { icon: '⭐', label: 'Rate & review', desc: '10-star ratings with optional reviews' },
            { icon: '👥', label: 'Follow friends', desc: 'See what your network is watching' },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="card text-center py-6">
              <p className="text-3xl mb-2">{icon}</p>
              <p className="text-sm font-semibold mb-1" style={{ color: 'var(--cs-text)' }}>{label}</p>
              <p className="text-xs" style={{ color: 'var(--cs-muted)' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto pt-20 px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
              Your <span style={{ color: 'var(--cs-primary)' }}>Feed</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--cs-muted)' }}>Latest from the people you follow</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <span className="text-lg leading-none">+</span> Log a film
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><div className="loading-spinner" /></div>
        ) : isError ? (
          <div className="text-center py-20 card" style={{ color: 'var(--cs-danger)' }}>
            <p className="text-2xl mb-2">⚠️</p>
            <p className="text-sm">Could not load feed. Is the API running?</p>
            <p className="text-xs mt-1" style={{ color: 'var(--cs-muted)' }}>Start: <code>dotnet run --project src/CineSphere.Api</code></p>
          </div>
        ) : data?.posts?.length > 0 ? (
          <div className="space-y-5">
            {data.posts.map((post: PostDto) => (
              <PostCard key={post.id} post={post} />
            ))}
            <div className="flex items-center justify-center gap-4 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-ghost text-sm py-2 px-4 disabled:opacity-30">← Prev</button>
              <span className="text-sm font-medium" style={{ color: 'var(--cs-muted)' }}>
                {data.page} / {data.totalPages}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}
                className="btn-ghost text-sm py-2 px-4 disabled:opacity-30">Next →</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Film size={56} style={{ color: 'var(--cs-border)' }} className="mb-5" />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--cs-text)' }}>Your feed is empty</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--cs-muted)' }}>Follow filmmakers or log your first film to get started.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowCreate(true)} className="btn-primary no-underline">Log a film</button>
              <Link href="/search" className="btn-ghost no-underline">Discover films</Link>
            </div>
          </div>
        )}
      </div>
      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
