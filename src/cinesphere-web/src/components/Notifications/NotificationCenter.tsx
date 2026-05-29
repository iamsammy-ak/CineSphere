'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bell, MessageCircle, UserPlus, Heart, Check } from 'lucide-react';

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get('/notifications').then(r => r.data),
    enabled: open,
  });

  const markRead = useMutation({
    mutationFn: () => api.post('/notifications/mark-read'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const TYPE_ICONS: Record<string, React.ReactNode> = {
    Follow: <UserPlus size={14} style={{ color: '#f5c518' }} />,
    Reaction: <Heart size={14} style={{ color: '#e50914' }} />,
    Comment: <MessageCircle size={14} style={{ color: '#3fb950' }} />,
  };

  const NOTIF_COLORS: Record<string, string> = {
    Follow: 'border-l-[var(--cs-primary)]',
    Reaction: 'border-l-[var(--cs-accent)]',
    Comment: 'border-l-[var(--cs-success)]',
  };

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) markRead.mutate(); }}
        className="relative p-2 rounded-lg hover:bg-[var(--cs-card)] transition-colors"
        style={{ color: 'var(--cs-muted)' }}
      >
        <Bell size={20} />
        {data?.unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
            style={{ background: 'var(--cs-accent)', color: '#fff' }}
          >
            {data.unreadCount > 9 ? '9+' : data.unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-80 rounded-2xl border overflow-hidden z-50"
          style={{ background: 'var(--cs-surface)', borderColor: 'var(--cs-border)', boxShadow: '0 16px 48px rgba(0,0,0,0.7)' }}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--cs-border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--cs-text)' }}>Notifications</h3>
            {data?.unreadCount > 0 && (
              <button onClick={() => markRead.mutate()} className="flex items-center gap-1 text-xs" style={{ color: 'var(--cs-primary)' }}>
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8"><div className="loading-spinner" /></div>
            ) : data?.items?.length > 0 ? (
              data.items.map((n: any) => (
                <Link key={n.id} href={n.postId ? `/post/${n.postId}` : '/'}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-5 py-4 border-b transition-colors hover:bg-[var(--cs-card)] border-l-4 ${NOTIF_COLORS[n.type] || 'border-l-[var(--cs-border)]'}`}
                  style={{ borderColor: 'var(--cs-border)', borderBottomColor: 'var(--cs-border)', borderLeftWidth: '3px' }}
                >
                  <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: 'var(--cs-card)' }}>
                    {TYPE_ICONS[n.type] || <Bell size={14} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: 'var(--cs-text)' }}>
                      <span className="font-semibold">{n.actorDisplayName}</span>{' '}
                      <span style={{ color: 'var(--cs-muted)' }}>{n.message}</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: 'var(--cs-muted)' }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: 'var(--cs-primary)' }} />
                  )}
                </Link>
              ))
            ) : (
              <div className="py-12 text-center">
                <Bell size={32} className="mx-auto mb-3" style={{ color: 'var(--cs-border)' }} />
                <p className="text-sm" style={{ color: 'var(--cs-muted)' }}>No notifications yet</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
