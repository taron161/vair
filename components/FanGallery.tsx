'use client';

import { useState, useRef, useEffect } from 'react';
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  useEffect(() => {
    videoRefs.current.forEach((video, id) => {
      if (id === activeId) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [activeId]);

  const handleClick = (photo: Photo) => {
    setActiveId(activeId === photo.id ? null : photo.id);
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
      {photos.map((photo, index) => {
        const isActive = activeId === photo.id;
        const isVideo = photo.type === 'video';

        // Вычисляем позицию: активная в центре, остальные разъезжаются
        let xOffset = 0;
        let rotate = 0;
        let scale = 0.85;
        let zIndex = index;

        if (activeId) {
          const activeIndex = photos.findIndex(p => p.id === activeId);
          if (isActive) {
            rotate = 0;
            scale = 1.05;
            zIndex = photos.length + 1;
          } else if (index < activeIndex) {
            // Карточки слева уезжают влево
            xOffset = -80 - (activeIndex - index) * 20;
            rotate = -15 - (activeIndex - index) * 3;
            scale = 0.7;
            zIndex = index;
          } else {
            // Карточки справа уезжают вправо
            xOffset = 80 + (index - activeIndex) * 20;
            rotate = 15 + (index - activeIndex) * 3;
            scale = 0.7;
            zIndex = index;
          }
        } else {
          // Веер по умолчанию
          rotate = (index - (photos.length - 1) / 2) * 12;
          scale = 0.85;
        }

        return (
          <motion.div
            key={photo.id}
            className="absolute cursor-pointer origin-bottom select-none"
            style={{
              width: isActive ? '280px' : '160px',
              height: isActive ? '400px' : '280px',
              transformOrigin: 'bottom center',
              zIndex: zIndex,
            }}
            animate={{
              x: xOffset,
              rotate: rotate,
              scale: scale,
              y: isActive ? -30 : 0,
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
                  alt={photo.caption || 'Photo'}
                  className="w-full h-full object-cover select-none pointer-events-none"
                  draggable={false}
                />
              )}
              {isActive && photo.caption && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl">
                  <p className="text-white font-medium text-xs">{photo.caption}</p>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}