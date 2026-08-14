'use client';

import dynamic from 'next/dynamic';
import { useInView } from '@/hooks/useInView';

const FanGallery = dynamic(() => import('@/components/FanGallery'), { ssr: false });

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

interface PostItemProps {
  post: Post;
}

export default function PostItem({ post }: PostItemProps) {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref}>
      <FanGallery photos={post.media} isInView={isInView} />
    </div>
  );
}