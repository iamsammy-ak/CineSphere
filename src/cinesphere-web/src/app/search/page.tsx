'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import { Search, Loader2, Star, Plus } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import Link from 'next/link';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { isAuthenticated } = useAuthStore();

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['movie-search', debouncedQuery, page],
    queryFn: () => api.get('/movies/search', { params: { query: debouncedQuery, page } }).then(r => r.data),
    enabled: debouncedQuery.length > 1,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setDebouncedQuery(query);
  };

  const handleLog = (movie: any) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    router.push(`/?log=${movie.id}&title=${encodeURIComponent(movie.title)}`);
  };

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto pt-24 px-4 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
            Find Your Next <span style={{ color: 'var(--cs-primary)' }}>Film</span>
          </h1>
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: 'var(--cs-muted)' }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search films by title..."
              className="w-full pl-14 pr-6 py-4 rounded-2xl border text-base"
            />
            <button type="submit" className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 py-2 px-5">
              Search
            </button>
          </form>
        </div>

        {isFetching && (
          <div className="flex justify-center py-12"><div className="loading-spinner" /></div>
        )}

        {data?.results?.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {data.results.map((movie: any) => (
                <div key={movie.id} className="group rounded-xl overflow-hidden border transition-all hover:-translate-y-1 hover:shadow-lg" style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)' }}>
                  <div className="relative">
                    {movie.posterPath ? (
                      <img src={movie.posterPath} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                    ) : (
                      <div className="w-full aspect-[2/3] flex items-center justify-center" style={{ background: 'var(--cs-card)', color: 'var(--cs-border)' }}>
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleLog(movie)}
                        className="flex items-center gap-2 py-2 px-4 rounded-full text-sm font-bold"
                        style={{ background: 'var(--cs-primary)', color: '#000' }}
                      >
                        <Plus size={14} /> Log
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold leading-tight line-clamp-2" style={{ color: 'var(--cs-text)' }}>{movie.title}</p>
                    {movie.voteCount && (
                      <div className="flex items-center gap-1 mt-1.5">
                        <Star size={12} style={{ color: 'var(--cs-primary)', fill: 'var(--cs-primary)' }} />
                        <span className="text-xs" style={{ color: 'var(--cs-muted)' }}>{movie.voteCount} votes</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost text-sm py-2 px-4 disabled:opacity-30">← Previous</button>
              <span className="text-sm" style={{ color: 'var(--cs-muted)' }}>Page {page} of {data.totalPages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages} className="btn-ghost text-sm py-2 px-4 disabled:opacity-30">Next →</button>
            </div>
          </>
        )}

        {debouncedQuery && !isFetching && data?.results?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl mb-2">🔍</p>
            <h3 className="text-lg font-semibold mb-1" style={{ color: 'var(--cs-muted)' }}>No films found</h3>
            <p className="text-sm" style={{ color: 'var(--cs-muted)' }}>Try a different search term</p>
          </div>
        )}

        {!debouncedQuery && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎬</p>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--cs-text)' }}>What will you watch next?</h3>
            <p className="text-sm" style={{ color: 'var(--cs-muted)' }}>Search the world's largest film database</p>
          </div>
        )}
      </div>
    </div>
  );
}
