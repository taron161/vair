'use client';

import { useState } from 'react';
import { uploadToBlob } from '@/lib/blob';

export function useUploadWithProgress() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState('');

  const animateProgress = (targetPercent: number, duration: number = 300) => {
    return new Promise((resolve) => {
      setUploadProgress((prev) => {
        const startTime = Date.now();
        const startPercent = prev;

        const updateProgress = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(1, elapsed / duration);
          const currentPercent = startPercent + (targetPercent - startPercent) * progress;

          setUploadProgress(Math.round(currentPercent));

          if (progress < 1) {
            requestAnimationFrame(updateProgress);
          } else {
            resolve(null);
          }
        };

        requestAnimationFrame(updateProgress);
        return prev;
      });
    });
  };

  const uploadWithProgress = async (
    files: { path: string; file: File }[],
    onProgress?: (percent: number) => void
  ): Promise<boolean> => {
    let allSuccess = true;
    const fileStep = 90 / files.length;

    for (let i = 0; i < files.length; i++) {
      const { path, file } = files[i];

      setUploadStage(`Загрузка файла ${i + 1} из ${files.length}...`);

      try {
        await uploadToBlob(path, file);
      } catch (err) {
        console.error('Upload error:', err);
        allSuccess = false;
        break;
      }

      const targetPercent = Math.round((i + 1) * fileStep);
      await animateProgress(targetPercent, 300);
      if (onProgress) onProgress(targetPercent);
    }

    if (allSuccess) {
      await animateProgress(100, 300);
      setUploadStage('Завершено');
    }

    return allSuccess;
  };

  return {
    uploadProgress,
    setUploadProgress,
    uploadStage,
    setUploadStage,
    uploadWithProgress,
    animateProgress,
  };
}