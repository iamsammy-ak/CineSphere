'use client';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/store';
import Navbar from '@/components/Layout/Navbar';
import api from '@/lib/api';
import Link from 'next/link';
import { Loader2, UserPlus, UserMinus, Calendar, Film, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import PostCard from '@/components/Feed/PostCard';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function ProfilePage() {
  const { userId: myId, isAuthenticated, displayName } = useAuthStore();
  const queryClient = useQueryClient();
  const [ownPosts, setOwnPosts] = useState(true);


  const profileQuery = useQuery({
    queryKey: ['profile', myId],
    queryFn: () => api.get(`/users/${myId}`).then(r => r.data).catch(() => null),
    enabled: isAuthenticated && !!myId,
  });

  const toggleFollow = useMutation({
    mutationFn: (targetId: string) => api.post('/follows', { targetUserId: targetId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });

  const postsQuery = useQuery({
    queryKey: ['user-posts', myId],
    queryFn: () => api.get(`/users/${myId}/posts`).then(r => r.data),
    enabled: isAuthenticated && !!myId && ownPosts,
  });

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-4xl mx-auto pt-20 px-4 pb-12">
        {profileQuery.isLoading ? (
          <div className="flex justify-center py-20"><div className="loading-spinner" /></div>
        ) : (
          <div>
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10">
              <div className="w-24 h-24 rounded-full overflow-hidden border-4 flex-shrink-0" style={{ borderColor: 'var(--cs-primary)', background: 'var(--cs-card)' }}>
                {profileQuery.data?.avatarUrl ? (
                  <img src={profileQuery.data.avatarUrl} alt={displayName ?? ''} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ color: 'var(--cs-primary)' }}>
                    {(displayName ?? 'U')[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-3xl font-bold mb-1" style={{ color: 'var(--cs-text)' }}>{displayName}</h1>
                <p className="text-sm mb-3" style={{ color: 'var(--cs-muted)' }}>@{profileQuery.data?.userName ?? myId}</p>
                {profileQuery.data?.bio && <p className="text-sm max-w-md" style={{ color: 'var(--cs-muted)' }}>{profileQuery.data.bio}</p>}
                <p className="text-xs mt-2" style={{ color: 'var(--cs-muted)' }}>
                  Member since {profileQuery.data?.createdAt ? formatDistanceToNow(new Date(profileQuery.data.createdAt)) : 'recently'}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Films watched', value: profileQuery.data?.filmCount ?? 0, icon: Film },
                { label: 'Followers',     value: profileQuery.data?.followersCount ?? 0, icon: UserMinus },
                { label: 'Following',    value: profileQuery.data?.followingCount ?? 0, icon: UserPlus },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="card text-center py-4">
                  <Icon size={20} className="mx-auto mb-2" style={{ color: 'var(--cs-primary)' }} />
                  <p className="text-2xl font-bold" style={{ color: 'var(--cs-text)' }}>{value}</p>
                  <p className="text-xs" style={{ color: 'var(--cs-muted)' }}>{label}</p>
                </div>
              ))}
            </div>


            {/* Posts */}
            <div>
              <h2 className="text-lg font-bold mb-4" style={{ fontFamily: 'Bebas Neue, Impact, sans-serif', letterSpacing: '0.04em' }}>
                My <span style={{ color: 'var(--cs-primary)' }}>Activity</span>
              </h2>
              {postsQuery.isLoading ? (
                <div className="flex justify-center py-10"><div className="loading-spinner" /></div>
              ) : postsQuery.data?.length > 0 ? (
                <div className="space-y-4">
                  {postsQuery.data.map((post: any) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12" style={{ color: 'var(--cs-muted)' }}>
                  <Film size={40} className="mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No activity yet — log your first film!</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
