'use client';

import { useState, useRef, useEffect, useMemo } from 'react';

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
  type: string;
  fullUrl?: string;
}

export function useFanGallery(photos: Photo[]) {
  const [activeId, setActiveId] = useState<string | null>(
    photos.length > 1 ? photos[0].id : null
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const sortedPhotos = useMemo(() => {
    if (photos.length <= 1) return photos;
    const cover = photos[0];
    const rest = photos.slice(1);
    const half = Math.floor(rest.length / 2);
    const left = rest.slice(0, half);
    const right = rest.slice(half);
    return [...left, cover, ...right];
  }, [photos]);

  const currentActive = activeId;

  useEffect(() => {
    videoRefs.current.forEach((video, id) => {
      if (id === currentActive) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentActive]);

  useEffect(() => {
    if (expandedId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [expandedId]);

  useEffect(() => {
    if (!expandedId) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        const currentIndex = sortedPhotos.findIndex(p => p.id === expandedId);
        if (currentIndex === -1) return;
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : sortedPhotos.length - 1;
        setExpandedId(sortedPhotos[nextIndex].id);
        setActiveId(sortedPhotos[nextIndex].id);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = sortedPhotos.findIndex(p => p.id === expandedId);
        if (currentIndex === -1) return;
        const nextIndex = currentIndex < sortedPhotos.length - 1 ? currentIndex + 1 : 0;
        setExpandedId(sortedPhotos[nextIndex].id);
        setActiveId(sortedPhotos[nextIndex].id);
      } else if (e.key === 'Escape') {
        setExpandedId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedId, sortedPhotos]);

  const handleClick = (photo: Photo) => {
    if (sortedPhotos.length <= 1) {
      setExpandedId(expandedId === photo.id ? null : photo.id);
      return;
    }

    if (activeId === photo.id) {
      setExpandedId(photo.id);
    } else {
      setActiveId(photo.id);
    }
  };

  const handleBackdropClick = () => {
    setExpandedId(null);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (sortedPhotos.length <= 1) return;
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffY) > Math.abs(diffX)) return;
    if (Math.abs(diffX) < 50) return;

    const currentIndex = sortedPhotos.findIndex(p => p.id === (currentActive || photos[0].id));
    let nextIndex = currentIndex;

    if (diffX > 0) {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : sortedPhotos.length - 1;
    } else {
      nextIndex = currentIndex < sortedPhotos.length - 1 ? currentIndex + 1 : 0;
    }

    setActiveId(sortedPhotos[nextIndex].id);
  };

  const handleFullscreenSwipe = (e: React.TouchEvent, photoId: string) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffY) > Math.abs(diffX)) return;
    if (Math.abs(diffX) < 50) return;

    const currentIndex = sortedPhotos.findIndex(p => p.id === photoId);
    if (currentIndex === -1) return;

    let nextIndex: number;
    if (diffX < 0) {
      nextIndex = currentIndex < sortedPhotos.length - 1 ? currentIndex + 1 : 0;
    } else {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : sortedPhotos.length - 1;
    }

    setExpandedId(sortedPhotos[nextIndex].id);
    setActiveId(sortedPhotos[nextIndex].id);
  };

  return {
    sortedPhotos,
    currentActive,
    expandedId,
    containerRef,
    videoRefs,
    handleClick,
    handleBackdropClick,
    handleTouchStart,
    handleTouchEnd,
    handleFullscreenSwipe,
  };
}