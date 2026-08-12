'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface MediaItem {
  file: File;
  preview: string;
  type: 'image' | 'video';
}

interface PostEditorProps {
  files: File[];
  onSave: (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => void;
  onCancel: () => void;
}

export default function PostEditor({ files, onSave, onCancel }: PostEditorProps) {
  const [media, setMedia] = useState<MediaItem[]>(() =>
    files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' : 'image',
    }))
  );
  const [coverIndex, setCoverIndex] = useState(0);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');

  const handleSave = () => {
    const filesArray = media.map((m) => m.file);
    onSave({ media: filesArray, coverIndex, caption, hashtags });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex justify-center">
      <div className="w-full max-w-[460px] bg-zinc-900 flex flex-col h-full">
        {/* Шапка */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button onClick={onCancel} className="text-white/60 text-sm hover:text-white">
            Отмена
          </button>
          <h2 className="text-white font-semibold">Новый пост</h2>
          <button onClick={handleSave} className="text-emerald-400 text-sm font-semibold hover:text-emerald-300">
            Сохранить
          </button>
        </div>

        {/* Выбор обложки */}
        <div className="px-4 py-3">
          <p className="text-white/50 text-xs mb-2">Выберите обложку:</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {media.map((item, index) => (
              <motion.button
                key={index}
                onClick={() => setCoverIndex(index)}
                className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                  coverIndex === index ? 'border-emerald-400 scale-110' : 'border-white/10 opacity-60'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {item.type === 'video' ? (
                  <video src={item.preview} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={item.preview} className="w-full h-full object-cover" alt="" />
                )}
                {index === 0 && (
                  <div className="absolute bottom-0 right-0 bg-emerald-400 text-black text-[10px] px-1 rounded-tl">
                    +{media.length - 1}
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Превью веера */}
        <div className="relative h-64 bg-zinc-800/50 mx-4 rounded-xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            {media.map((item, index) => {
              const isCover = index === coverIndex;
              const offset = (index - coverIndex) * 25;

              return (
                <motion.div
                  key={index}
                  className="absolute w-20 h-32 rounded-lg overflow-hidden border-2 border-white/10"
                  style={{ zIndex: isCover ? 10 : 1 }}
                  animate={{
                    x: offset,
                    rotate: isCover ? 0 : offset * 0.3,
                    scale: isCover ? 1.15 : 0.8,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  {item.type === 'video' ? (
                    <video src={item.preview} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={item.preview} className="w-full h-full object-cover" alt="" />
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Описание */}
        <div className="px-4 py-3">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Добавьте описание..."
            maxLength={500}
            rows={3}
            className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl px-4 py-3 resize-none focus:outline-none focus:bg-white/10 text-sm"
          />
          <p className="text-white/30 text-xs text-right mt-1">{caption.length}/500</p>
        </div>

        {/* Хештеги */}
        <div className="px-4">
          <input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#хештеги"
            className="w-full bg-white/5 text-emerald-300 placeholder-white/20 rounded-xl px-4 py-3 focus:outline-none focus:bg-white/10 text-sm"
          />
        </div>
      </div>
    </div>
  );
}