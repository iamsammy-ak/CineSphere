'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import Navbar from '@/components/Layout/Navbar';
import { Search, Loader2, Star, Plus } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { TmdbMovieDto } from '@/lib/types';

export default function SearchPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState('');


  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['movie-search', debouncedQuery, page],
    queryFn: () => api.get('/movies/search', { params: { query: debouncedQuery, page } }).then(r => r.data),
    enabled: debouncedQuery.length > 1,
    staleTime: 60_000,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setPage(1);
    setDebouncedQuery(query.trim());
  };

  const handleLog = (movie: TmdbMovieDto) => {
    if (!isAuthenticated) { router.push('/login'); return; }
    router.push(`/?log=${movie.id}&title=${encodeURIComponent(movie.title)}`);
  };

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto pt-20 px-4 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.06em' }}>
            Find Your Next <span style={{ color: 'var(--cs-primary)' }}>Film</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--cs-muted)' }}>Powered by TMDB</p>
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mt-6">
            <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2" style={{ color: 'var(--cs-muted)' }} />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Search any film by title..."
              className="w-full pl-14 pr-36 py-4 rounded-2xl border text-base"
            />
            <button type="submit" className="btn-primary absolute right-2 top-1/2 -translate-y-1/2 py-2.5 px-6 text-sm">
              Search
            </button>
          </form>
        </div>

        {(isLoading || isFetching) && (
          <div className="flex justify-center py-16"><div className="loading-spinner" /></div>
        )}

        {data?.results?.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(data.results as TmdbMovieDto[]).map(movie => (
                <div key={movie.id}
                  className="group rounded-2xl overflow-hidden border transition-all hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer"
                  style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)' }}
                >
                  <div className="relative overflow-hidden">
                    {movie.posterPath ? (
                      <img src={movie.posterPath} alt={movie.title}
                        className="w-full aspect-[2/3] object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full aspect-[2/3] flex items-center justify-center" style={{ background: 'var(--cs-card)', color: 'var(--cs-border)' }}>
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                      <button
                        onClick={() => handleLog(movie)}
                        className="flex items-center gap-1.5 w-full py-2 px-3 rounded-lg text-sm font-bold"
                        style={{ background: 'var(--cs-primary)', color: '#000' }}
                      >
                        <Plus size={14} /> Log this film
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold leading-tight line-clamp-2" style={{ color: 'var(--cs-text)' }}>
                      {movie.title}
                    </p>
                    {movie.voteCount && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star size={12} style={{ color: 'var(--cs-primary)', fill: 'var(--cs-primary)' }} />
                        <span className="text-xs" style={{ color: 'var(--cs-muted)' }}>{movie.voteCount.toLocaleString()} votes</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 mt-10">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="btn-ghost text-sm py-2 px-5 disabled:opacity-30">← Prev</button>
              <span className="text-sm font-semibold" style={{ color: 'var(--cs-muted)' }}>
                Page {page} of {data.totalPages}
              </span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= data.totalPages}
                className="btn-ghost text-sm py-2 px-5 disabled:opacity-30">Next →</button>
            </div>
          </>
        )}

        {debouncedQuery && !isFetching && data?.results?.length === 0 && (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🔍</p>
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--cs-text)' }}>No films found</h3>
            <p className="text-sm" style={{ color: 'var(--cs-muted)' }}>Try a different title or check the spelling</p>
          </div>
        )}

        {!debouncedQuery && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-7xl mb-6">🎬</p>
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em', color: 'var(--cs-text)' }}>
              What will you watch next?
            </h3>
            <p className="text-sm" style={{ color: 'var(--cs-muted)' }}>Search the world's largest film database</p>
          </div>
        )}
      </div>
    </div>
  );
}
