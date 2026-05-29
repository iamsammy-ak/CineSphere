'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Layout/Navbar';
import PostCard from '@/components/Feed/PostCard';
import { Loader2 } from 'lucide-react';

export default function PostDetailPage() {
  const { id } = useParams();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn: () => api.get(`/posts/${id}`).then(r => r.data),
    enabled: !!id,
  });

  if (isLoading) return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="flex justify-center pt-32"><div className="loading-spinner" /></div>
    </div>
  );

  if (isError || !post) return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="text-center pt-32">
        <p className="text-4xl mb-4">🔍</p>
        <p style={{ color: 'var(--cs-muted)' }}>Post not found</p>
      </div>
    </div>
  );

  return (
    <div style={{ background: 'var(--cs-bg)', minHeight: '100vh' }}>
      <Navbar />
      <div className="max-w-2xl mx-auto pt-20 px-4 pb-16">
        <PostCard post={post} expandedComments={true} />
      </div>
    </div>
  );
}
