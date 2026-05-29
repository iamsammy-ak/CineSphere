'use client';
import { useState } from 'react';
import { PostDto, MovieLogPostDto } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { MessageCircle, Eye, EyeOff, Star } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { ReactionType } from '@/lib/enums';
import { useAuthStore } from '@/lib/store';

const POST_TYPE_STYLES: Record<string, { label: string; cls: string }> = {
  MovieLog: { label: 'WATCHED', cls: 'tag-movie-log' },
  Status:   { label: 'UPDATE',  cls: 'tag-status' },
  List:     { label: 'LIST',   cls: 'tag-list' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <Star key={n} size={13} style={{ color: n <= rating ? 'var(--cs-primary)' : 'var(--cs-border)', fill: n <= rating ? 'var(--cs-primary)' : 'transparent' }} />
      ))}
      <span className="text-xs font-bold ml-1.5" style={{ color: 'var(--cs-primary)' }}>{rating.toFixed(1)}</span>
    </div>
  );
}

export default function PostCard({ post }: { post: PostDto }) {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [revealSpoiler, setRevealSpoiler] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [activeReaction, setActiveReaction] = useState<string | null>(null);

  const toggleReaction = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) =>
      api.post('/reactions/toggle', { postId, type }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  const handleReaction = (type: string) => {
    if (!isAuthenticated) return;
    setActiveReaction(prev => prev === type ? null : type);
    toggleReaction.mutate({ postId: post.id, type });
  };

  const typeStyle = POST_TYPE_STYLES[post.postType] ?? { label: post.postType.toUpperCase(), cls: 'tag' };
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  const logPost = post as unknown as MovieLogPostDto;

  return (
    <article className="post-enter rounded-2xl border overflow-hidden" style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)' }}>
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.userId}`} className="no-underline flex-shrink-0">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 transition-colors hover:border-[var(--cs-primary)]" style={{ borderColor: 'var(--cs-border)', background: 'var(--cs-card)' }}>
              {post.userAvatarUrl ? (
                <img src={post.userAvatarUrl} alt={post.userDisplayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold" style={{ color: 'var(--cs-primary)', fontSize: '0.9rem' }}>
                  {post.userDisplayName[0]?.toUpperCase() ?? '?'}
                </div>
              )}
            </div>
          </Link>
          <div>
            <Link href={`/profile/${post.userId}`} className="no-underline">
              <p className="text-sm font-semibold hover:underline" style={{ color: 'var(--cs-text)' }}>{post.userDisplayName}</p>
            </Link>
            <p className="text-xs" style={{ color: 'var(--cs-muted)' }}>{timeAgo}</p>
          </div>
        </div>
        <span className={`tag ${typeStyle.cls}`}>{typeStyle.label}</span>
      </div>

      <div className="px-5 pb-4">
        {post.movie && (
          <div className="flex gap-3 mb-4 rounded-xl overflow-hidden" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)' }}>
            {post.movie.posterPath && (
              <img src={post.movie.posterPath} alt={post.movie.title}
                className="w-20 h-28 object-cover object-center flex-shrink-0"
                style={{ background: 'var(--cs-border)' }}
              />
            )}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--cs-text)' }}>
                  {post.movie.title}
                </h3>
                {post.movie.overview && (
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--cs-muted)' }}>
                    {post.movie.overview}
                  </p>
                )}
              </div>
              {logPost.rating > 0 && (
                <div className="mt-2">
                  <StarRating rating={logPost.rating} />
                  {logPost.isRewatch && (
                    <span className="text-xs mt-1 inline-flex items-center gap-1" style={{ color: 'coral' }}>🔁 Rewatch</span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {post.content && (
          <div className={`text-sm leading-relaxed mb-3 ${post.isSpoiler && !revealSpoiler ? 'spoiler-blur' : ''}`}
            style={{ color: 'var(--cs-text)', position: 'relative' }}>
            {post.isSpoiler && !revealSpoiler && (
              <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.01)', zIndex: 1 }} />
            )}
            <p style={{ whiteSpace: 'pre-wrap' }}>{post.content}</p>
          </div>
        )}

        {post.isSpoiler && (
          <button
            onClick={() => setRevealSpoiler(v => !v)}
            className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-full mb-3 transition-all"
            style={{ background: 'rgba(248,81,73,0.08)', color: 'var(--cs-danger)', border: '1px solid rgba(248,81,73,0.15)' }}
          >
            {revealSpoiler ? <EyeOff size={12} /> : <Eye size={12} />}
            {revealSpoiler ? 'Hide spoiler' : 'Reveal spoiler'}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 px-5 pb-4 flex-wrap border-t pt-3" style={{ borderColor: 'var(--cs-border)' }}>
        <button onClick={() => handleReaction('Like')}
          className="flex items-center gap-1.5 text-sm py-1.5 px-3 rounded-full transition-all"
          style={{
            background: activeReaction === 'Like' ? 'rgba(245,197,24,0.12)' : 'transparent',
            color: activeReaction === 'Like' ? 'var(--cs-primary)' : 'var(--cs-muted)',
            border: `1px solid ${activeReaction === 'Like' ? 'rgba(245,197,24,0.25)' : 'var(--cs-border)'}`,
          }}>
          ❤️ {post.reactionCount > 0 && post.reactionCount}
        </button>
        <button onClick={() => handleReaction('Popcorn')}
          className="flex items-center gap-1.5 text-sm py-1.5 px-3 rounded-full transition-all"
          style={{
            background: activeReaction === 'Popcorn' ? 'rgba(245,197,24,0.12)' : 'transparent',
            color: activeReaction === 'Popcorn' ? 'var(--cs-primary)' : 'var(--cs-muted)',
            border: `1px solid ${activeReaction === 'Popcorn' ? 'rgba(245,197,24,0.25)' : 'var(--cs-border)'}`,
          }}>
          🍿
        </button>
        <button onClick={() => handleReaction('MindBlown')}
          className="flex items-center gap-1.5 text-sm py-1.5 px-3 rounded-full transition-all"
          style={{
            background: activeReaction === 'MindBlown' ? 'rgba(245,197,24,0.12)' : 'transparent',
            color: activeReaction === 'MindBlown' ? 'var(--cs-primary)' : 'var(--cs-muted)',
            border: `1px solid ${activeReaction === 'MindBlown' ? 'rgba(245,197,24,0.25)' : 'var(--cs-border)'}`,
          }}>
          🧠
        </button>
        <button onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-sm py-1.5 px-3 rounded-full"
          style={{ color: 'var(--cs-muted)', border: '1px solid var(--cs-border)' }}>
          <MessageCircle size={14} />
          {post.commentCount > 0 && <span>{post.commentCount}</span>}
        </button>
      </div>

      {showComments && (
        <div className="px-5 pb-4 border-t" style={{ borderColor: 'var(--cs-border)' }}>
          <CommentSection postId={post.id} />
        </div>
      )}
    </article>
  );
}

function CommentSection({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();
  const submit = useMutation({
    mutationFn: (text: string) => api.post('/comments', { postId, text }),
    onSuccess: () => { setText(''); queryClient.invalidateQueries({ queryKey: ['feed'] }); },
    onError: () => alert('Failed to post comment. Make sure you are logged in.'),
  });
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; submit.mutate(text); }} className="mt-4 flex gap-3">
      <textarea
        value={text} onChange={e => setText(e.target.value)}
        placeholder="Write a comment..."
        rows={1}
        className="flex-1 resize-none text-sm px-4 py-2.5 rounded-xl border"
        style={{ borderColor: 'var(--cs-border)', background: 'var(--cs-card)', color: 'var(--cs-text)' }}
      />
      <button type="submit" disabled={!text.trim() || submit.isPending}
        className="btn-primary px-5 py-2 text-sm self-end disabled:opacity-40">
        {submit.isPending ? '...' : 'Post'}
      </button>
    </form>
  );
}
