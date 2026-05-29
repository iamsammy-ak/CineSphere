'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/Layout/Navbar';
import { Search, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useDebounce } from '@/lib/useDebounce';

export default function UserSearchPage() {
  const { isAuthenticated, userId } = useAuthStore();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 400);
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ['user-search', debouncedQuery],
    queryFn: () => api.get('/users/search', { params: { query: debouncedQuery } }).then(r => r.data),
    enabled: debouncedQuery.length > 1,
  });

  const followMutation = useMutation({
    mutationFn: (targetId: string) => api.post('/follows', { targetUserId: targetId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-search'] }),
  });

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto pt-24 px-4 pb-16">
        <h1 className="text-3xl font-black mb-6" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
          Find <span style={{ color: 'var(--cs-primary)' }}>Cinephiles</span>
        </h1>
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--cs-muted)' }} />
          <input type="text" value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or username..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border text-base"
          />
        </div>

        {isLoading && <div className="flex justify-center py-10"><div className="loading-spinner" /></div>}

        {users?.length > 0 && (
          <div className="space-y-3">
            {users.map((user: any) => (
              <div key={user.userId} className="card flex items-center gap-4">
                <Link href={`/profile/${user.userId}`} className="flex items-center gap-3 flex-1 no-underline">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0" style={{ background: 'var(--cs-card)', color: 'var(--cs-primary)' }}>
                    {user.displayName?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ color: 'var(--cs-text)' }}>{user.displayName}</p>
                    <p className="text-xs" style={{ color: 'var(--cs-muted)' }}>@{user.userId.substring(0,8)}</p>
                  </div>
                </Link>
                <button
                  onClick={() => followMutation.mutate(user.userId)}
                  className="flex items-center gap-2 text-sm flex-shrink-0"
                  style={{
                    background: user.isFollowing ? 'rgba(63,185,80,0.1)' : 'var(--cs-primary)',
                    color: user.isFollowing ? 'var(--cs-success)' : '#000',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '8px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {user.isFollowing ? <UserCheck size={15} /> : <UserPlus size={15} />}
                  {user.isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        )}

        {debouncedQuery && !isLoading && !users?.length && (
          <div className="text-center py-12" style={{ color: 'var(--cs-muted)' }}>
            <p className="text-sm">No users found</p>
          </div>
        )}

        {!debouncedQuery && (
          <div className="text-center py-12" style={{ color: 'var(--cs-muted)' }}>
            <p className="text-sm">Type to search for other cinephiles</p>
          </div>
        )}
      </div>
    </div>
  );
}
