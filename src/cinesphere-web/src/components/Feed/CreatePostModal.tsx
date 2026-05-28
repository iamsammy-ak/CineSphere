'use client';
import { useState, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { X, Search, Loader2, Star, Calendar, RotateCcw } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

interface Props { onClose: () => void; }

const RATING_LABELS = ['', '🤮 Appalling', '😕 Awful', '😒 Bad', '❌ Dislike', ' Meh', '👍 Like', '😊 Good', '😄 Great', '🌟 Superb', '💯 Masterpiece'];

export default function CreatePostModal({ onClose }: Props) {
  const { userId } = useAuthStore();
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
    queryFn: () => api.get('/movies/search', { params: { query: searchQuery } }).then(r => r.data.results),
    enabled: searchQuery.length > 1,
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
  });

  const handleSubmit = () => {
    if (mode === 'log') {
      if (!selectedMovie) return;
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
      submitPost.mutate({ content: statusText, isSpoiler: false });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border overflow-hidden max-h-[90vh] flex flex-col"
        style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--cs-border)' }}>
          <h2 className="text-lg font-bold" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
            Log & Share
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--cs-card)] transition-colors" style={{ color: 'var(--cs-muted)' }}>
            <X size={20} />
          </button>
        </div>


        {/* Mode Tabs */}
        <div className="flex border-b" style={{ borderColor: 'var(--cs-border)' }}>
          {(['log', 'status'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className="flex-1 py-3 text-sm font-medium transition-all"
              style={{
                borderBottom: mode === m ? '2px solid var(--cs-primary)' : '2px solid transparent',
                color: mode === m ? 'var(--cs-primary)' : 'var(--cs-muted)',
                background: mode === m ? 'rgba(245,197,24,0.05)' : 'transparent',
              }}>
              {m === 'log' ? '🎬 Log a film' : '💬 Status update'}
            </button>
          ))}
        </div>


        <div className="overflow-y-auto flex-1 p-6 space-y-5">
          {mode === 'log' ? (
            <>
              {/* Movie Search */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--cs-muted)' }}>Search for a film</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--cs-muted)' }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setSelectedMovie(null); }}
                    placeholder="Type a movie title..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm"
                  />
                </div>


                {/* Search Results */}
                {search.isFetching && searchQuery && (
                  <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: 'var(--cs-muted)' }}>
                    <Loader2 size={12} className="animate-spin" /> Searching...
                  </div>
                )}
                {search.data?.length > 0 && !selectedMovie && (
                  <div className="mt-2 rounded-xl overflow-hidden border max-h-48 overflow-y-auto" style={{ borderColor: 'var(--cs-border)', background: 'var(--cs-card)' }}>
                    {search.data.map((movie: any) => (
                      <button key={movie.id} onClick={() => { setSelectedMovie(movie); setSearchQuery(movie.title); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-[var(--cs-surface)] transition-colors text-left"
                      >
                        {movie.posterPath && <img src={movie.posterPath} className="w-8 h-12 object-cover rounded" style={{ background: 'var(--cs-border)' }} />}
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--cs-text)' }}>{movie.title}</p>
                          {movie.overview && <p className="text-xs mt-0.5 line-clamp-1" style={{ color: 'var(--cs-muted)' }}>{movie.overview}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {selectedMovie && (
                  <div className="mt-3 p-3 rounded-xl flex items-center gap-3" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)' }}>
                    {selectedMovie.posterPath && <img src={selectedMovie.posterPath} className="w-12 h-16 object-cover rounded" />}
                    <div className="flex-1">
                      <p className="text-sm font-bold" style={{ color: 'var(--cs-text)' }}>{selectedMovie.title}</p>
                      <button onClick={() => { setSelectedMovie(null); setSearchQuery(''); }} className="text-xs mt-1" style={{ color: 'var(--cs-danger)' }}>Remove</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Star Rating */}
              <div>
                <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--cs-muted)' }}>Your rating</label>
                <div className="flex items-center gap-2">
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n} onClick={() => setRating(n)}
                      onMouseEnter={(e) => { (e.currentTarget.querySelector('svg') as any).style.color = 'var(--cs-primary)'; }}
                      onMouseLeave={(e) => { (e.currentTarget.querySelector('svg') as any).style.color = n <= rating ? 'var(--cs-primary)' : 'var(--cs-border)'; }}
                      className="p-0.5"
                    >
                      <Star size={22} style={{ color: n <= rating ? 'var(--cs-primary)' : 'var(--cs-border)', fill: n <= rating ? 'var(--cs-primary)' : 'transparent', transition: 'color 0.1s' }} />
                    </button>
                  ))}
                  <span className="text-sm ml-2 font-medium" style={{ color: 'var(--cs-primary)' }}>{rating > 0 ? `${rating}/10` : '—'}</span>
                  {rating > 0 && <span className="text-xs" style={{ color: 'var(--cs-muted)' }}>{RATING_LABELS[rating]}</span>}
                </div>
              </div>

              {/* Date + Rewatch */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--cs-muted)' }}>Watched on</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--cs-muted)' }} />
                    <input type="date" value={watchedDate} onChange={e => setWatchedDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--cs-muted)' }}>
                    <input type="checkbox" checked={isRewatch} onChange={e => setIsRewatch(e.target.checked)} className="w-4 h-4 accent-[var(--cs-primary)]" />
                    <RotateCcw size={14} /> Rewatch
                  </label>
                </div>
              </div>

              {/* Review / Review toggle */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--cs-muted)' }}>Short review (optional)</label>
                  <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: 'var(--cs-muted)' }}>
                    <input type="checkbox" checked={isSpoiler} onChange={e => setIsSpoiler(e.target.checked)} className="w-3.5 h-3.5 accent-[var(--cs-accent)]" />
                    Spoiler?
                  </label>
                </div>
                <textarea value={review} onChange={e => setReview(e.target.value)} rows={3} placeholder="Write your thoughts... (optional)" className="w-full px-4 py-3 rounded-xl border text-sm resize-none" />
              </div>
            </>
          ) : (
            /* Status Mode */
            <div>
              <label className="text-sm font-medium mb-2 block" style={{ color: 'var(--cs-muted)' }}>What's on your mind?</label>
              <textarea value={statusText} onChange={e => setStatusText(e.target.value)} rows={4} placeholder="Share a film thought, update, or anything..." className="w-full px-4 py-3 rounded-xl border text-sm resize-none" />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: 'var(--cs-border)' }}>
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
          <button
            onClick={handleSubmit}
            disabled={
              (mode === 'log' && (!selectedMovie || rating === 0)) ||
              (mode === 'status' && !statusText.trim()) ||
              submitPost.isPending
            }
            className="btn-primary text-sm disabled:opacity-40"
          >
            {submitPost.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Post to feed'}
          </button>
        </div>
      </div>
    </div>
  );
}
