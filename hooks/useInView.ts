'use client';

import { useRef, useEffect, useState } from 'react';

export function useInView() {
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

  return { ref, isInView };
}