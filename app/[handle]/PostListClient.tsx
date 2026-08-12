'use client';

import PostCard from '@/components/PostCard';

interface Media {
  id: string;
  url: string;
  type: string;
  order: number;
}

interface Post {
  id: string;
  caption: string | null;
  createdAt: string;
  media: Media[];
}

export default function PostListClient({ posts }: { posts: Post[] }) {
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}