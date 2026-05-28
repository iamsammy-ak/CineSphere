'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { PostDto } from '@/lib/types';
import PostCard from '@/components/Feed/PostCard';
import { useAuthStore } from '@/lib/store';
import { useState } from 'react';
import Link from 'next/link';
import { Loader2, Film } from 'lucide-react';
import Navbar from '@/components/Layout/Navbar';
import CreatePostModal from '@/components/Feed/CreatePostModal';
import { formatDistanceToNow } from 'date-fns';

export default function FeedPage() {
  const { isAuthenticated } = useAuthStore();
  const [page, setPage] = useState(1);
  const [showCreate, setShowCreate] = useState(false);


  const { data, isLoading, isError } = useQuery({
    queryKey: ['feed', page],
    queryFn: () => api.get('/feed', { params: { page, pageSize: 20 } }).then(r => r.data),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center" style={{ background: 'var(--cs-bg)' }}>
        <div className="text-6xl mb-6">🎬</div>
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
          <span style={{ color: 'var(--cs-primary)' }}>CINE</span><span>SPHERE</span>
        </h1>
        <p className="text-lg mb-8" style={{ color: 'var(--cs-muted)' }}>Your social film diary</p>
        <div className="flex gap-3">
          <Link href="/login" className="btn-primary no-underline">Sign in</Link>
          <Link href="/register" className="btn-ghost no-underline">Create account</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto pt-20 px-4 pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
              Your <span style={{ color: 'var(--cs-primary)' }}>Feed</span>
            </h1>
            <p className="text-sm" style={{ color: 'var(--cs-muted)' }}>Latest from people you follow</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm">
            <span>+</span> Log a film
          </button>
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="loading-spinner" />
          </div>
        ) : isError ? (
          <div className="text-center py-16" style={{ color: 'var(--cs-danger)' }}>Failed to load feed. Check if the API is running.</div>
        ) : data?.posts?.length > 0 ? (
          <div className="space-y-4">
            {data.posts.map((post: PostDto) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-center gap-3 pt-4">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-30">
                ← Prev
              </button>
              <span className="text-sm font-medium" style={{ color: 'var(--cs-muted)' }}>
                Page {data.page} of {data.totalPages}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages} className="btn-ghost text-sm py-1.5 px-3 disabled:opacity-30">
                Next →
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Film size={48} style={{ color: 'var(--cs-border)' }} className="mb-4" />
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--cs-muted)' }}>Your feed is empty</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--cs-muted)' }}>Follow some filmmakers or log your first film to get started.</p>
            <Link href="/search" className="btn-primary no-underline">Discover films</Link>
          </div>
        )}
      </div>

      {showCreate && <CreatePostModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
