'use client';

import { useState, useEffect, useRef } from 'react';
import PostCard from '@/components/PostCard';

interface Media {
  id: string;
  url: string;
  type: string;
  order: number;
  fullUrl?: string;
}

interface Post {
  id: string;
  caption: string | null;
  createdAt: string;
  media: Media[];
  userId?: string;
  score?: number;
}

interface PostListClientProps {
  posts: Post[];
  userId: string;
}

const POSTS_PER_PAGE = 5;

export default function PostListClient({ posts, userId }: PostListClientProps) {
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + POSTS_PER_PAGE, posts.length));
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [posts.length]);

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {visiblePosts.map((post) => (
        <PostCard key={post.id} post={post} userId={userId} />
      ))}
      {visibleCount < posts.length && (
        <div ref={loadMoreRef} className="flex justify-center py-4">
          <div className="w-8 h-8 border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}