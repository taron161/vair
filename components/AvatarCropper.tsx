'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Cropper from 'react-easy-crop';

interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AvatarCropperProps {
  onSave: (file: File) => void;
  onClose: () => void;
}

export default function AvatarCropper({ onSave, onClose }: AvatarCropperProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleSave = () => {
    if (!image || !croppedAreaPixels) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        256,
        256
      );

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
          onSave(file);
        }
      }, 'image/jpeg', 0.85);
    };
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[400px] bg-zinc-800 rounded-2xl p-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-white font-semibold mb-4">Изменить аватар</h2>

          {!image ? (
            <button
              onClick={() => document.getElementById('avatar-input')?.click()}
              className="w-full py-12 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-emerald-400/50 hover:text-white/80 transition-colors"
            >
              📷 Выбрать фото
            </button>
          ) : (
            <div>
              <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                  showGrid
                  cropShape="round"
                />
              </div>

              <div className="flex items-center gap-3 mt-4">
                <span className="text-white/50 text-xs">🔍</span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.01}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 accent-emerald-400"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 py-2 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition-colors"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setImage(null)}
                  className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                >
                  Выбрать другое
                </button>
              </div>
            </div>
          )}

          <input
            id="avatar-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}