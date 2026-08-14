'use client';

import { useState } from 'react';
import Cropper from 'react-easy-crop';
import CropperModal from '@/components/avatar/CropperModal';

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

    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);

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
    <CropperModal onClose={onClose}>
      <h2 className="text-white font-semibold mb-4">Изменить аватар</h2>

      {!image ? (
        <button
          onClick={() => document.getElementById('avatar-input')?.click()}
          className="w-full py-12 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-emerald-400/50 hover:text-white/80 transition-colors cursor-pointer"
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
              className="flex-1 py-2 rounded-xl bg-emerald-400 text-black font-semibold hover:bg-emerald-300 transition-colors cursor-pointer"
            >
              Сохранить
            </button>
            <button
              onClick={() => setImage(null)}
              className="flex-1 py-2 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors cursor-pointer"
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
    </CropperModal>
  );
}