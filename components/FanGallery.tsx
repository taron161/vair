'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
  type: string;
}

interface FanGalleryProps {
  photos: Photo[];
}

export default function FanGallery({ photos }: FanGalleryProps) {
  const [activeId, setActiveId] = useState<string | null>(
    photos.length > 1 ? photos[0].id : null
  );
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

  const handleClick = (photo: Photo) => {
    if (sortedPhotos.length <= 1) return;
    if (activeId === photo.id) {
      setActiveId(null);
    } else {
      setActiveId(photo.id);
    }
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480px] flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {sortedPhotos.map((photo, index) => {
        const isActive = sortedPhotos.length === 1 ? true : currentActive === photo.id;
        const isVideo = photo.type === 'video';

        let xOffset = 0;
        let rotate = 0;
        let scale = sortedPhotos.length === 1 ? 1 : 0.85;
        let zIndex = index;

        const total = sortedPhotos.length;

        if (sortedPhotos.length === 1) {
          xOffset = 0;
          rotate = 0;
          scale = 1;
          zIndex = 1;
        } else if (currentActive) {
          const activeIndex = sortedPhotos.findIndex(p => p.id === currentActive);

          if (isActive) {
            rotate = 0;
            scale = 1.02;
            zIndex = total + 1;
          } else {
            if (index < activeIndex) {
              const posFromCenter = activeIndex - index;
              xOffset = -(120 + (posFromCenter - 1) * 35);
              rotate = -10 - (posFromCenter - 1) * 4;
            } else {
              const posFromCenter = index - activeIndex;
              xOffset = 120 + (posFromCenter - 1) * 35;
              rotate = 10 + (posFromCenter - 1) * 4;
            }
            scale = 0.75;
            zIndex = total - Math.abs(index - activeIndex);
          }
        } else {
          rotate = (index - (total - 1) / 2) * 12;
          scale = 0.85;
        }

        return (
          <motion.div
            key={photo.id}
            className="absolute cursor-pointer origin-bottom select-none"
            style={{
              width: isActive ? '260px' : '150px',
              height: isActive ? '370px' : '260px',
              transformOrigin: 'bottom center',
              zIndex: zIndex,
            }}
            animate={{
              x: xOffset,
              rotate: rotate,
              scale: scale,
              y: isActive ? -10 : 0,
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={() => handleClick(photo)}
          >
            <div className={`w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 transition-all relative ${
              isVideo 
                ? 'border-purple-500/50 shadow-purple-500/30' 
                : 'border-emerald-400/30 shadow-emerald-400/10'
            }`}>
              {isVideo ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(photo.id, el);
                  }}
                  src={photo.url}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  playsInline
                  loop
                  muted={!isActive}
                />
              ) : (
                <img
                  src={photo.url}
                  alt=""
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}