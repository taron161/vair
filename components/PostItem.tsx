'use client';

import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const center = viewportHeight * 0.45;
      const distance = Math.abs(rect.top + rect.height / 2 - center);
      const maxDistance = viewportHeight * 0.6;
      
      if (distance < maxDistance) {
        const normalized = 1 - distance / maxDistance;
        setScale(1 + normalized * 0.03);
      } else {
        setScale(1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="overflow-hidden">
      <motion.div
        ref={ref}
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="border-b border-white/5 pb-4 px-4"
        style={{ transformOrigin: 'center center' }}
      >
        <FanGallery photos={post.media}/>
      </motion.div>
    </div>
  );
}