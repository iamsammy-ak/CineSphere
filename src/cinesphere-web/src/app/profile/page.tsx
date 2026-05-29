'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Layout/Navbar';
import api from '@/lib/api';
import Link from 'next/link';
import { Loader2, Film, Users, UserCheck, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostCard from '@/components/Feed/PostCard';
import { PostDto } from '@/lib/types';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  const { userId, displayName, isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => api.get(`/users/${userId}`).then(r => r.data),
    enabled: isAuthenticated && !!userId,
  });

  const postsQuery = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => api.get(`/users/${userId}/posts`).then(r => r.data as PostDto[]),
    enabled: isAuthenticated && !!userId,
  });

  const followMutation = useMutation({
    mutationFn: (targetId: string) => api.post('/follows', { targetUserId: targetId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const profile = profileQuery.data;
  const posts = postsQuery.data ?? [];

  if (!isAuthenticated) {
    return (
      <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-32 text-center">
          <p className="text-5xl mb-4">👤</p>
          <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--cs-text)' }}>Sign in to view your profile</h2>
          <Link href="/login" className="btn-primary no-underline px-8 py-3">Sign in</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto pt-20 px-4 pb-16">
        {profileQuery.isLoading ? (
          <div className="flex justify-center py-20"><div className="loading-spinner" /></div>
        ) : (
          <>
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 flex-shrink-0" style={{ borderColor: 'var(--cs-primary)', background: 'var(--cs-card)' }}>
                {profile?.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={displayName ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-black" style={{ color: 'var(--cs-primary)' }}>
                    {(displayName ?? 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-black mb-1" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
                  {displayName}
                </h1>
                <p className="text-sm mb-3" style={{ color: 'var(--cs-muted)' }}>@{profile?.userName ?? userId}</p>
                {profile?.bio && <p className="text-sm max-w-lg" style={{ color: 'var(--cs-text)' }}>{profile.bio}</p>}
                {profile?.createdAt && (
                  <p className="text-xs mt-3 flex items-center gap-1.5 justify-center sm:justify-start" style={{ color: 'var(--cs-muted)' }}>
                    <Calendar size={12} />
                    Member {formatDistanceToNow(new Date(profile.createdAt))} ago
                  </p>
                )}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: 'Films logged', value: profile?.filmCount ?? 0, icon: Film, color: 'var(--cs-primary)' },
                { label: 'Followers', value: profile?.followersCount ?? 0, icon: Users, color: 'var(--cs-text)' },
                { label: 'Following', value: profile?.followingCount ?? 0, icon: UserCheck, color: 'var(--cs-text)' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="card text-center py-5">
                  <Icon size={22} className="mx-auto mb-2" style={{ color }} />
                  <p className="text-3xl font-black mb-1" style={{ color: 'var(--cs-text)' }}>{value}</p>
                  <p className="text-xs" style={{ color: 'var(--cs-muted)' }}>{label}</p>
                </div>
              ))}
            </div>

            {/* Activity */}
            <div>
              <h2 className="text-xl font-black mb-5" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
                My <span style={{ color: 'var(--cs-primary)' }}>Activity</span>
              </h2>
              {postsQuery.isLoading ? (
                <div className="flex justify-center py-10"><div className="loading-spinner" /></div>
              ) : posts.length > 0 ? (
                <div className="space-y-5">
                  {posts.map((post: PostDto) => <PostCard key={post.id} post={post} />)}
                </div>
              ) : (
                <div className="card text-center py-12">
                  <Film size={44} className="mx-auto mb-4" style={{ color: 'var(--cs-border)' }} />
                  <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--cs-text)' }}>No films logged yet</h3>
                  <p className="text-sm mb-5" style={{ color: 'var(--cs-muted)' }}>Log your first film and it will show up here.</p>
                  <Link href="/search" className="btn-primary no-underline">Discover films</Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
