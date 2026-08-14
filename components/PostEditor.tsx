'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface MediaItem {
  file?: File;
  preview: string;
  type: 'image' | 'video';
  url?: string;
}

interface PostEditorProps {
  files?: File[];
  onSave: (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => void;
  onCancel: () => void;
  uploading?: boolean;
  initialCaption?: string;
  initialHashtags?: string;
  editMode?: boolean;
  editMedia?: { id: string; url: string; type: string; order: number }[];
}

export default function PostEditor({ 
  files = [], 
  onSave, 
  onCancel, 
  uploading = false, 
  initialCaption = '', 
  initialHashtags = '',
  editMode = false,
  editMedia = []
}: PostEditorProps) {
  const [media, setMedia] = useState<MediaItem[]>(() => {
    if (editMode && editMedia.length > 0) {
      return editMedia.map(item => ({
        preview: item.url,
        type: item.type === 'video' ? 'video' as const : 'image' as const,
        url: item.url,
      }));
    }
    return files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      type: file.type.startsWith('video') ? 'video' as const : 'image' as const,
    }));
  });

  const [coverIndex, setCoverIndex] = useState(0);
  const [caption, setCaption] = useState(initialCaption);
  const [hashtags, setHashtags] = useState(initialHashtags);

  const handleSave = () => {
    if (uploading) return;

    // Форматируем теги
    const tagsFromField = hashtags
      .split(/[\s,;]+/)
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

    const tagsFromCaption = caption
      .split(/\s+/)
      .filter(word => word.startsWith('#'))
      .map(tag => tag.trim());

    const allTags = [...tagsFromField, ...tagsFromCaption]
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .join(' ');

    const cleanCaption = caption
      .split(/\s+/)
      .filter(word => !word.startsWith('#'))
      .join(' ');

    if (editMode) {
      onSave({ media: [], coverIndex, caption: cleanCaption, hashtags: allTags });
      return;
    }

    const filesArray = media.map((m) => m.file).filter((f): f is File => !!f);
    onSave({ media: filesArray, coverIndex, caption: cleanCaption, hashtags: allTags });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex justify-center">
      <div className="w-full max-w-[460px] bg-zinc-900 flex flex-col h-full relative">
        {/* Шапка */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <button onClick={onCancel} disabled={uploading} className="text-white/60 text-sm hover:text-white disabled:opacity-50 cursor-pointer">
            Отмена
          </button>
          <h2 className="text-white font-semibold">{editMode ? 'Редактировать пост' : 'Новый пост'}</h2>
          <button onClick={handleSave} disabled={uploading} className="text-emerald-400 text-sm font-semibold hover:text-emerald-300 disabled:opacity-50 cursor-pointer">
            {uploading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>

        {/* Выбор обложки */}
        {!editMode && media.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-white/50 text-xs mb-2">Выберите обложку:</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {media.map((item, index) => (
                <motion.button
                  key={index}
                  onClick={() => setCoverIndex(index)}
                  disabled={uploading}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all cursor-pointer ${
                    coverIndex === index ? 'border-emerald-400 scale-110' : 'border-white/10 opacity-60'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {item.type === 'video' ? (
                    <video src={item.preview} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={item.preview} className="w-full h-full object-cover" alt="" />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* Превью в режиме редактирования */}
        {editMode && media.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-white/50 text-xs mb-2">Фото поста:</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {media.map((item, index) => (
                <div key={index} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                  {item.type === 'video' ? (
                    <video src={item.preview} className="w-full h-full object-cover" muted />
                  ) : (
                    <img src={item.preview} className="w-full h-full object-cover" alt="" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Превью веера */}
        {!editMode && media.length > 0 && (
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
                    animate={{ x: offset, rotate: isCover ? 0 : offset * 0.3, scale: isCover ? 1.15 : 0.8 }}
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
        )}

        {/* Описание */}
        <div className="px-4 py-3">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Добавьте описание..."
            maxLength={500}
            rows={3}
            disabled={uploading}
            className="w-full bg-white/5 text-white placeholder-white/30 rounded-xl px-4 py-3 resize-none focus:outline-none focus:bg-white/10 text-sm disabled:opacity-50"
          />
          <p className="text-white/30 text-xs text-right mt-1">{caption.length}/500</p>
        </div>

        {/* Хештеги */}
        <div className="px-4">
          <input
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#хештеги"
            disabled={uploading}
            className="w-full bg-white/5 text-emerald-300 placeholder-white/20 rounded-xl px-4 py-3 focus:outline-none focus:bg-white/10 text-sm disabled:opacity-50"
          />
        </div>

        {/* Загрузчик */}
        {uploading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
            <div className="relative w-24 h-20 mb-3">
              <motion.div
                className="absolute w-12 h-16 rounded-md bg-[#18181b] z-0"
                style={{ left: '20%', top: '15%', transformOrigin: 'bottom center' }}
                animate={{ rotate: [-10, -10, -20, -20, -10, -10] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear', times: [0, 0.3, 0.35, 0.65, 0.7, 1] }}
              />
              <motion.div
                className="absolute w-12 h-16 rounded-md bg-[#18181b] z-0"
                style={{ right: '20%', top: '15%', transformOrigin: 'bottom center' }}
                animate={{ rotate: [10, 10, 20, 20, 10, 10] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: 'linear', times: [0, 0.3, 0.35, 0.65, 0.7, 1], delay: 0.1 }}
              />

              <svg
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                width="60"
                height="60"
                viewBox="0 0 70 70"
                fill="none"
              >
                <path d="M35 45 L10 12 Q35 5 60 12 Z" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" opacity="0.6"/>
                <path d="M35 45 L25 10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
                <path d="M35 45 L45 10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
                <path d="M35 42 L18 8" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
                <path d="M35 42 L52 8" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
              </svg>

              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-20">
                <span className="text-[#34d399] text-xs font-bold tracking-[3px]">VAIR</span>
              </div>
            </div>
            <p className="text-white/70 text-sm mt-2">Сохраняем...</p>
          </div>
        )}
      </div>
    </div>
  );
}