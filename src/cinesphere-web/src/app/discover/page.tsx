'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/Layout/Navbar';
import { Star, Film, TrendingUp, Users } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';

export default function DiscoverPage() {
  const { isAuthenticated } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ['discover'],
    queryFn: () => api.get('/discover').then(r => r.data),
    enabled: isAuthenticated,
  });

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-5xl mx-auto pt-20 px-4 pb-16">
        <h1 className="text-4xl font-black mb-2" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
          Discover<span style={{ color: 'var(--cs-primary)' }}> 🎬</span>
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--cs-muted)' }}>Trending films and active cinephiles this week</p>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Films in database', value: data?.totalFilmsInDb ?? 0, icon: Film, color: 'var(--cs-primary)' },
            { label: 'Rising stars', value: data?.popularUsers?.length ?? 0, icon: Users, color: 'var(--cs-text)' },
            { label: 'Trending films', value: data?.trendingFilms?.length ?? 0, icon: TrendingUp, color: '#e50914' },
            { label: 'This week', value: '🔥', icon: null, color: 'var(--cs-text)' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card py-5 text-center">
              {Icon && <Icon size={20} className="mx-auto mb-2" style={{ color }} />}
              <p className="text-2xl font-black" style={{ color: 'var(--cs-text)' }}>{value}</p>
              <p className="text-xs" style={{ color: 'var(--cs-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><div className="loading-spinner" /></div>
        ) : (
          <>
            {/* Trending Films */}
            {data?.trendingFilms?.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-black mb-4" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
                  <TrendingUp size={20} className="inline mr-2" /> Trending This Week
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {data.trendingFilms.map((movie: any) => (
                    <Link key={movie.id} href={`/movie/${movie.id}`} className="no-underline group">
                      <div className="rounded-xl overflow-hidden border transition-all hover:-translate-y-1" style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)' }}>
                        {movie.posterPath ? (
                          <img src={movie.posterPath} alt={movie.title} className="w-full aspect-[2/3] object-cover" />
                        ) : (
                          <div className="w-full aspect-[2/3] flex items-center justify-center text-3xl" style={{ color: 'var(--cs-border)', background: 'var(--cs-card)' }}>🎬</div>
                        )}
                        <div className="p-2.5">
                          <p className="text-xs font-semibold leading-tight line-clamp-2" style={{ color: 'var(--cs-text)' }}>{movie.title}</p>
                          {movie.voteCount && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Star size={11} style={{ color: 'var(--cs-primary)', fill: 'var(--cs-primary)' }} />
                              <span className="text-xs" style={{ color: 'var(--cs-muted)' }}>{movie.voteCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Popular Users */}
            {data?.popularUsers?.length > 0 && (
              <div>
                <h2 className="text-xl font-black mb-4" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
                  <Users size={20} className="inline mr-2" /> Active Cinephiles
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {data.popularUsers.map((user: any) => (
                    <Link key={user.userId} href={`/profile/${user.userId}`} className="no-underline">
                      <div className="card py-4 flex items-center gap-3 hover:border-[var(--cs-primary)] transition-colors">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ background: 'var(--cs-card)', color: 'var(--cs-primary)' }}>
                          {user.displayName?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--cs-text)' }}>{user.displayName}</p>
                          <p className="text-xs" style={{ color: 'var(--cs-muted)' }}>@{user.userId.substring(0,8)}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(!data?.trendingFilms?.length && !data?.popularUsers?.length) && (
              <div className="text-center py-16">
                <Film size={56} className="mx-auto mb-4" style={{ color: 'var(--cs-border)' }} />
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--cs-text)' }}>Nothing trending yet</h3>
                <p className="text-sm" style={{ color: 'var(--cs-muted)' }}>Be the first to log some films!</p>
                <Link href="/search" className="btn-primary no-underline mt-4 inline-block">Discover films</Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
