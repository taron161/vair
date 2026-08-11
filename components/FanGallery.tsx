'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface Photo {
  id: string;
  url: string;
  caption: string | null;
}

interface FanGalleryProps {
  photos: Photo[];
}

export default function FanGallery({ photos }: FanGalleryProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-[400px] flex items-center justify-center">
      {photos.map((photo, index) => {
        const angle = (index - (photos.length - 1) / 2) * 12;

        return (
          <motion.div
            key={photo.id}
            className="absolute w-44 h-72 cursor-pointer origin-bottom select-none"
            style={{
              transformOrigin: 'bottom center',
              zIndex: activeId === photo.id ? photos.length + 1 : index,
            }}
            animate={{
              rotate: angle,
              scale: activeId === photo.id ? 1.1 : 0.85,
              y: activeId === photo.id ? -20 : 0,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => setActiveId(activeId === photo.id ? null : photo.id)}
          >
          <div className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 hover:border-white/30 transition-colors relative">
            <img
              src={photo.url}
              alt={photo.caption || 'Photo'}
              className="w-full h-full object-cover select-none pointer-events-none"
              draggable={false}
            />
            {activeId === photo.id && photo.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl">
                <p className="text-white font-medium text-xs">{photo.caption}</p>
              </div>
            )}
          </div>
          </motion.div>
        );
      })}

      {!activeId && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute top-[400px] text-white/50 text-sm select-none text-center"
        >
          Нажми на фото, чтобы рассмотреть
        </motion.p>
      )}
    </div>
  );
}