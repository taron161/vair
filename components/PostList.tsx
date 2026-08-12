'use client';

import dynamic from 'next/dynamic';

const FanGallery = dynamic(() => import('@/components/FanGallery'), {
  ssr: false,
});

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

interface PostListProps {
  posts: Post[];
}

export default function PostList({ posts }: PostListProps) {
  return (
    <div className="space-y-6 pb-4">
      {posts.map((post) => (
        <div key={post.id} className="border-b border-white/5 pb-4">
          <FanGallery photos={post.media}/>
        </div>
      ))}
    </div>
  );
}