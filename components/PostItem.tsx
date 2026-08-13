'use client';

import { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

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

export default function PostItem({ post }: { post: Post }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const center = viewportHeight * 0.45;
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      const maxDistance = viewportHeight * 0.5;
      
      setIsInView(distance < maxDistance);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={ref}>
      <FanGallery photos={post.media} isInView={isInView} />
    </div>
  );
}