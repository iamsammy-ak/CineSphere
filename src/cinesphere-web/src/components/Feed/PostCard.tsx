'use client';
import { useState } from 'react';
import { PostDto } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { MessageCircle, Heart, Zap, Brain, Eye, EyeOff, MoreHorizontal, Star } from 'lucide-react';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const POST_TYPE_STYLES: Record<string, { label: string; className: string }> = {
  MovieLog: { label: 'WATCHED', className: 'tag-movie-log' },
  Status:   { label: 'UPDATE',  className: 'tag-status' },
  List:     { label: 'LIST',   className: 'tag-list' },
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5,6,7,8,9,10].map(n => (
        <Star
          key={n}
          size={14}
          style={{
            color: n <= rating ? 'var(--cs-primary)' : 'var(--cs-border)',
            fill: n <= rating ? 'var(--cs-primary)' : 'transparent',
            transition: 'color 0.1s'
          }}
        />
      ))}
      <span className="text-xs font-bold ml-1" style={{ color: 'var(--cs-primary)' }}>{rating.toFixed(1)}</span>
    </div>
  );
}

function ReactionButton({ type, count, isActive }: { type: 'Like'|'Popcorn'|'MindBlown'; count: number; isActive: boolean }) {
  const icons: Record<string, string> = { Like: '❤️', Popcorn: '🍿', MindBlown: '🧠' };
  return (
    <button
      className="flex items-center gap-1 text-sm py-1.5 px-3 rounded-full transition-all"
      style={{
        background: isActive ? 'rgba(245,197,24,0.15)' : 'transparent',
        color: isActive ? 'var(--cs-primary)' : 'var(--cs-muted)',
        border: `1px solid ${isActive ? 'rgba(245,197,24,0.3)' : 'var(--cs-border)'}`,
      }}
    >
      <span>{icons[type]}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}

export default function PostCard({ post }: { post: PostDto }) {
  const queryClient = useQueryClient();
  const [revealSpoiler, setRevealSpoiler] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const toggleReaction = useMutation({
    mutationFn: ({ postId, type }: { postId: string; type: string }) =>
      api.post('/reactions/toggle', { postId, type }),
    onMutate: async ({ postId, type }) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previous = queryClient.getQueryData(['feed', 1]);
      queryClient.setQueryData(['feed', 1], (old: any) => {
        if (!old) return old;
        const posts = old.posts.map((p: any) => p.postId === postId ? { ...p, reactionCount: p.reactionCount + 1 } : p);
        return { ...old, posts };
      });
      return { previous };
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['feed'] }),
  });

  const typeStyle = POST_TYPE_STYLES[post.postType] ?? { label: post.postType.toUpperCase(), className: 'tag' };
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });


  return (
    <article className="post-enter rounded-2xl border overflow-hidden" style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)' }}>
      {/* Card Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.userId}`}>
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[var(--cs-border)] hover:border-[var(--cs-primary)] transition-colors" style={{ background: 'var(--cs-card)' }}>
              {post.userAvatarUrl ? (
                <img src={post.userAvatarUrl} alt={post.userDisplayName} className="avatar w-full h-full" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold" style={{ color: 'var(--cs-primary)' }}>
                  {post.userDisplayName[0].toUpperCase()}
                </div>
              )}
            </div>
          </Link>
          <div>
            <Link href={`/profile/${post.userId}`} className="no-underline">
              <p className="text-sm font-semibold hover:underline" style={{ color: 'var(--cs-text)' }}>{post.userDisplayName}</p>
            </Link>
            <p className="text-xs mt-0.5" style={{ color: 'var(--cs-muted)' }}>{timeAgo}</p>
          </div>
        </div>
        <span className={`tag ${typeStyle.className}`}>{typeStyle.label}</span>
      </div>


      {/* Card Body */}
      <div className="px-5 pb-3">
        {/* Movie Info */}
        {post.movie && (
          <div className="flex gap-3 mb-3 rounded-xl overflow-hidden" style={{ background: 'var(--cs-card)', border: '1px solid var(--cs-border)' }}>
            {post.movie.posterPath && (
              <img
                src={post.movie.posterPath}
                alt={post.movie.title}
                className="w-20 h-28 object-cover object-center flex-shrink-0"
              />
            )}
            <div className="p-3 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--cs-text)' }}>{post.movie.title}</h3>
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--cs-muted)' }}>{post.movie.overview}</p>
              </div>
              <div className="mt-2">
                <StarRating rating={(post as any).rating ?? 0} />
              </div>
            </div>
          </div>
        )}

        {/* Review / Content */}
        {post.content && (
          <div className={`text-sm leading-relaxed mb-2 ${post.isSpoiler && !revealSpoiler ? 'spoiler-blur' : ''}`} style={{ color: 'var(--cs-text)' }}>
            {post.isSpoiler && !revealSpoiler && (
              <div className="absolute flex items-center gap-2" style={{ color: 'var(--cs-muted)' }}>
                <EyeOff size={14} /> spoiler
              </div>
            )}
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {post.isSpoiler && (
          <button
            onClick={() => setRevealSpoiler(!revealSpoiler)}
            className="flex items-center gap-1.5 text-xs py-1.5 px-3 rounded-full mb-2"
            style={{ background: 'rgba(248,81,73,0.1)', color: 'var(--cs-danger)', border: '1px solid rgba(248,81,73,0.2)' }}
          >
            {revealSpoiler ? <EyeOff size={12} /> : <Eye size={12} />}
            {revealSpoiler ? 'Hide spoiler' : 'Reveal spoiler'}
          </button>
        )}
      </div>


      {/* Card Footer — Actions */}
      <div className="flex items-center gap-2 px-5 pb-4 flex-wrap border-t pt-3 mt-1" style={{ borderColor: 'var(--cs-border)' }}>
        <ReactionButton type="Like" count={post.reactionCount} isActive={false} />
        <ReactionButton type="Popcorn" count={0} isActive={false} />
        <ReactionButton type="MindBlown" count={0} isActive={false} />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm py-1.5 px-3 rounded-full"
          style={{ color: 'var(--cs-muted)', border: '1px solid var(--cs-border)' }}
        >
          <MessageCircle size={14} />
          {post.commentCount > 0 && post.commentCount}
        </button>
      </div>


      {/* Inline Comments */}
      {showComments && (
        <div className="px-5 pb-4 border-t" style={{ borderColor: 'var(--cs-border)' }}>
          <InlineCommentForm postId={post.id} />
        </div>
      )}
    </article>
  );
}

function InlineCommentForm({ postId }: { postId: string }) {
  const [text, setText] = useState('');
  const queryClient = useQueryClient();
  const submitComment = useMutation({
    mutationFn: (text: string) => api.post('/comments', { postId, text }),
    onSuccess: () => { setText(''); queryClient.invalidateQueries({ queryKey: ['feed'] }); },
  });
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (!text.trim()) return; submitComment.mutate(text); }}
      className="mt-3 flex gap-2"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write a comment..."
        rows={1}
        className="flex-1 resize-none text-sm px-4 py-2 rounded-xl border"
        style={{ borderColor: 'var(--cs-border)', background: 'var(--cs-card)', color: 'var(--cs-text)' }}
      />
      <button
        type="submit"
        disabled={!text.trim() || submitComment.isPending}
        className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
      >
        {submitComment.isPending ? '...' : 'Post'}
      </button>
    </form>
  );
}
