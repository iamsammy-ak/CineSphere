'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import { useAuthStore } from '@/lib/store';
import { Star, Play, Plus, Check, Calendar, MessageSquare, Heart } from 'lucide-react';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { format } from 'date-fns';

export default function MovieDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);

  const { data: movie, isLoading } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => api.get(`/movies/${id}`).then(r => r.data).catch(() => null),
    enabled: !!id,
  });

  const { data: userRatings } = useQuery({
    queryKey: ['user-ratings', id],
    queryFn: () => api.get(`/movies/${id}/ratings`).then(r => r.data).catch(() => []),
    enabled: isAuthenticated && !!id,
  });

  const { data: watchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: () => api.get('/watchlist').then(r => r.data),
    enabled: isAuthenticated,
  });

  const isInWatchlist = Array.isArray(watchlist) && watchlist.some((w: any) => w.tmdbMovieId === Number(id));

  const addToWatchlist = useMutation({
    mutationFn: () => api.post('/watchlist', {
      tmdbMovieId: Number(id),
      title: movie?.title,
      posterPath: movie?.posterPath,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['watchlist'] }),
  });

  const logMovie = useMutation({
    mutationFn: (rating: number) => api.post('/posts/movie-log', {
      tmdbMovieId: Number(id),
      rating,
      watchedDate: new Date().toISOString().split('T')[0],
      isRewatch: false,
      content: null,
      isSpoiler: false,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      router.push('/');
    },
  });

  if (isLoading) return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex justify-center pt-32"><div className="loading-spinner" /></div>
    </div>
  );

  if (!movie) return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="text-center pt-32">
        <p className="text-4xl mb-4">🎬</p>
        <p style={{ color: 'var(--cs-muted)' }}>Movie not found</p>
        <Link href="/search" className="btn-primary no-underline mt-4 inline-block">Search films</Link>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto pt-20 px-4 pb-16">
        {/* Hero */}
        <div className="flex gap-8 mb-8">
          {movie.posterPath && (
            <img src={movie.posterPath} alt={movie.title}
              className="w-48 rounded-2xl flex-shrink-0 shadow-2xl hidden sm:block"
              style={{ height: 'fit-content' }}
            />
          )}
          <div className="flex-1">
            <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
              {movie.title}
            </h1>
            {movie.releaseDate && (
              <p className="text-sm mb-4" style={{ color: 'var(--cs-muted)' }}>
                Released {format(new Date(movie.releaseDate), 'MMMM d, yyyy')}
              </p>
            )}
            {movie.overview && (
              <p className="text-base leading-relaxed mb-6" style={{ color: 'var(--cs-muted)' }}>
                {movie.overview}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={() => {
                  if (!isAuthenticated) { router.push('/login'); return; }
                  addToWatchlist.mutate();
                }}
                className={isInWatchlist ? 'btn-primary flex items-center gap-2 text-sm' : 'btn-ghost flex items-center gap-2 text-sm'}
              >
                {isInWatchlist ? <Check size={16} /> : <Plus size={16} />}
                {isInWatchlist ? 'In watchlist' : 'Watchlist'}
              </button>
            </div>

            {/* Rate this film */}
            <div className="card">
              <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--cs-muted)' }}>Rate this film</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setRating(n)}
                    onMouseEnter={(e) => {
                      const star = e.currentTarget.querySelector('svg');
                      if (star) (star as HTMLElement).style.color = 'var(--cs-primary)';
                    }}
                    onMouseLeave={(e) => {
                      const star = e.currentTarget.querySelector('svg');
                      if (star && n > rating) (star as HTMLElement).style.color = 'var(--cs-border)';
                    }}
                    className="p-0.5"
                  >
                    <Star size={28}
                      style={{
                        color: n <= rating ? 'var(--cs-primary)' : 'var(--cs-border)',
                        fill: n <= rating ? 'var(--cs-primary)' : 'transparent',
                      }}
                    />
                  </button>
                ))}
                {rating > 0 && <span className="text-sm font-bold ml-2" style={{ color: 'var(--cs-primary)' }}>{rating}/10</span>}
              </div>
              <button
                onClick={() => rating > 0 && logMovie.mutate(rating)}
                disabled={rating === 0 || logMovie.isPending}
                className="btn-primary disabled:opacity-40"
              >
                {logMovie.isPending ? 'Logging...' : 'Log and rate this film'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
