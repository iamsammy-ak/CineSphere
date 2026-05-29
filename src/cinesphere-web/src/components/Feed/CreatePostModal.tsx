'use client';
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { X, Search, Loader2, Star, Calendar, RotateCcw } from 'lucide-react';

const RATING_LABELS: Record<number, string> = {
  1: '🤮 Appalling', 2: '😕 Awful', 3: '😒 Bad', 4: '❌ Dislike', 5: '😐 Meh',
  6: '👍 Like', 7: '😊 Good', 8: '😄 Great', 9: '🌟 Superb', 10: '💯 Masterpiece'
};

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'log' | 'status'>('log');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [watchedDate, setWatchedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isRewatch, setIsRewatch] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [statusText, setStatusText] = useState('');

  const search = useQuery({
    queryKey: ['movie-search', searchQuery],
    queryFn: () => api.get('/movies/search', { params: { query: searchQuery } })
      .then(r => (r.data?.results ?? []) as any[]),
    enabled: searchQuery.length > 1,
    staleTime: 60_000,
  });

  const submitPost = useMutation({
    mutationFn: (payload: any) => {
      const endpoint = mode === 'log' ? '/posts/movie-log' : '/posts/status';
      return api.post(endpoint, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
      onClose();
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to post. Are you logged in?');
    },
  });

  const handleSubmit = () => {
    if (mode === 'log') {
      if (!selectedMovie || rating === 0) return;
      submitPost.mutate({
        tmdbMovieId: selectedMovie.id,
        rating,
        watchedDate,
        isRewatch,
        content: review || null,
        isSpoiler,
      });
    } else {
      if (!statusText.trim()) return;
      submitPost.mutate({ content: statusText });
    }
  };

  const isDisabled = mode === 'log' ? (!selectedMovie || rating === 0) : !statusText.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)', animation: 'fadeIn 0.2s ease' }}
      onClick={onClose}
    >
      <div className="w-full max-w-lg rounded-2xl border overflow-hidden max-h-[92vh] flex flex-col"
        style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)', animation: 'slideUp 0.3s cubic-bezier(0.22,1,0.36,1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--cs-border)' }}>
          <h2 className="text-xl font-black" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.06em' }}>
            Log & Share
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--cs-card)] transition-colors" style={{ color: 'var(--cs-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex border-b" style={{ borderColor: 'var(--cs-border)' }}>
          {(['log', 'status'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-3 text-sm font-semibold transition-all"
              style={{
                borderBottom: mode === m ? '3px solid var(--cs-primary)' : '3px solid transparent',
                color: mode === m ? 'var(--cs-primary)' : 'var(--cs-muted)',
                background: mode === m ? 'rgba(245,197,24,0.05)' : 'transparent',
              }}
            >
              {m === 'log' ? '🎬  Log a film' : '💬  Status update'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {mode === 'log' ? (
            <>
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--cs-muted)' }}>Search for a film</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--cs-muted)' }} />
                  <input type="text" value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSelectedMovie(null); }}
                    placeholder="Type a movie title..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm"
                  />
                </div>

                {search.isFetching && (
                  <div className="flex items-center gap-2 mt-3 text-sm" style={{ color: 'var(--cs-muted)' }}>
                    <Loader2 size={13} style={{ animation: 'spin 0.7s linear infinite' }} />
                    Searching TMDB...
                  </div>
                )}

                {search.data?.length > 0 && !selectedMovie && (
                  <div className="mt-2 rounded-xl overflow-hidden border max-h-56 overflow-y-auto" style={{ borderColor: 'var(--cs-border)', background: 'var(--cs-card)' }}>
                    {search.data.map((movie: any) => (
                      <button key={movie.id}
                        onClick={() => { setSelectedMovie(movie); setSearchQuery(movie.title); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--cs-surface)] transition-colors text-left"
                      >
                        {movie.posterPath && <img src={movie.posterPath} alt="" className="w-9 h-13 object-cover rounded" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--cs-text)' }}>{movie.title}</p>
                          {movie.overview && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--cs-muted)' }}>{movie.overview}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {selectedMovie && (
                  <div className="mt-3 p-4 rounded-xl flex items-center gap-3" style={{ background: 'var(--cs-card)', border: '1px solid rgba(245,197,24,0.25)' }}>
                    {selectedMovie.posterPath && <img src={selectedMovie.posterPath} alt="" className="w-14 h-20 object-cover rounded-lg flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold leading-tight" style={{ color: 'var(--cs-primary)' }}>{selectedMovie.title}</p>
                      <p className="text-xs mt-1" style={{ color: 'var(--cs-muted)' }}>ID: {selectedMovie.id}</p>
                    </div>
                    <button onClick={() => { setSelectedMovie(null); setSearchQuery(''); }}
                      className="p-2 rounded-lg hover:bg-[var(--cs-surface)] transition-colors flex-shrink-0" style={{ color: 'var(--cs-muted)' }}>
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold mb-3 block" style={{ color: 'var(--cs-muted)' }}>Your rating</label>
                <div className="flex items-center gap-1 flex-wrap">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} onClick={() => setRating(n)}
                      className="p-0.5 hover:scale-125 transition-transform"
                      title={`${n}/10`}
                    >
                      <Star size={26}
                        style={{
                          color: n <= rating ? 'var(--cs-primary)' : 'var(--cs-border)',
                          fill: n <= rating ? 'var(--cs-primary)' : 'transparent',
                          transition: 'all 0.1s',
                        }}
                      />
                    </button>
                  ))}
                  <div className="ml-3">
                    <span className="text-sm font-bold" style={{ color: 'var(--cs-primary)' }}>
                      {rating > 0 ? `${rating}/10` : '—'}
                    </span>
                    {rating > 0 && (
                      <span className="text-xs ml-2" style={{ color: 'var(--cs-muted)' }}>{RATING_LABELS[rating]}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-end gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold mb-1.5 flex items-center gap-1" style={{ color: 'var(--cs-muted)' }}>
                    <Calendar size={12} /> Watched on
                  </label>
                  <input type="date" value={watchedDate} onChange={e => setWatchedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer pb-2.5 select-none" style={{ color: isRewatch ? 'var(--cs-primary)' : 'var(--cs-muted)' }}>
                  <input type="checkbox" checked={isRewatch} onChange={e => setIsRewatch(e.target.checked)} className="w-4 h-4 accent-[var(--cs-primary)]" />
                  <RotateCcw size={14} /> Rewatch
                </label>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold" style={{ color: 'var(--cs-muted)' }}>Short review (optional)</label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: 'var(--cs-muted)' }}>
                    <input type="checkbox" checked={isSpoiler} onChange={e => setIsSpoiler(e.target.checked)} className="w-3.5 h-3.5 accent-[var(--cs-accent)]" />
                    ⚠️ Spoiler?
                  </label>
                </div>
                <textarea value={review} onChange={e => setReview(e.target.value)}
                  rows={4}
                  placeholder={`What's unforgettable about this film?\nOptionally mark as spoiler`}
                  className="w-full px-4 py-3 rounded-xl border text-sm resize-none"
                  style={{ borderColor: 'var(--cs-border)', background: 'var(--cs-card)', color: 'var(--cs-text)' }}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: 'var(--cs-muted)' }}>What's on your mind?</label>
              <textarea value={statusText} onChange={e => setStatusText(e.target.value)}
                rows={5}
                placeholder="Share a film thought, a cinema trip, a recommendation..."
                className="w-full px-4 py-3 rounded-xl border text-sm resize-none"
                style={{ borderColor: 'var(--cs-border)', background: 'var(--cs-card)', color: 'var(--cs-text)' }}
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--cs-border)' }}>
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button onClick={handleSubmit} disabled={isDisabled || submitPost.isPending}
            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-40">
            {submitPost.isPending && <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />}
            {submitPost.isPending ? 'Posting...' : 'Post to feed'}
          </button>
        </div>
      </div>
    </div>
  );
}
