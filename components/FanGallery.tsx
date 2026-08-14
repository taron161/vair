'use client';

import { useFanGallery } from '@/hooks/useFanGallery';
import { motion, AnimatePresence } from 'framer-motion';

interface Photo {
  id: string;
  url: string;
  caption?: string | null;
  type: string;
}

interface FanGalleryProps {
  photos: Photo[];
  isInView?: boolean;
}

export default function FanGallery({ photos, isInView = false }: FanGalleryProps) {
  const {
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
  } = useFanGallery(photos);

  const expandedPhoto = photos.find(p => p.id === expandedId);

  return (
    <>
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
          let scale = 0.85;
          let zIndex = index;

          const total = sortedPhotos.length;

          if (sortedPhotos.length === 1) {
            xOffset = 0;
            rotate = 0;
            scale = isInView ? 1 : 0.85;
            zIndex = 1;
          } else if (currentActive && isInView) {
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
            xOffset = 0;
            zIndex = index;
          }

          return (
            <motion.div
              key={photo.id}
              className="absolute cursor-pointer origin-bottom select-none"
              style={{
                width: isActive && isInView ? '260px' : '150px',
                height: isActive && isInView ? '370px' : '260px',
                transformOrigin: 'bottom center',
                zIndex: zIndex,
              }}
              animate={{
                x: xOffset,
                rotate: rotate,
                scale: scale,
                y: isActive && isInView ? -10 : 0,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              onClick={() => handleClick(photo)}
            >
              <div className={`w-full h-full rounded-2xl overflow-hidden border transition-all relative ${
                isVideo 
                  ? 'border-purple-500/20' 
                  : 'border-emerald-400/20'
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

      <AnimatePresence>
        {expandedPhoto && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBackdropClick}
          >
            <motion.div
              className="relative flex items-center justify-center"
              style={{ width: '100%', maxWidth: '460px' }}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleFullscreenSwipe(e, expandedPhoto.id)}
            >
              {expandedPhoto.type === 'video' ? (
                <video
                  src={expandedPhoto.url}
                  className="w-full rounded-xl"
                  style={{ aspectRatio: '260 / 370', objectFit: 'cover' }}
                  controls
                  autoPlay
                  loop
                />
              ) : (
                <img
                  src={expandedPhoto.url}
                  alt=""
                  className="w-full rounded-xl"
                  style={{ aspectRatio: '260 / 370', objectFit: 'cover' }}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}