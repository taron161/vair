'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

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

  const uploadFile = async (path: string, file: File): Promise<{ success: boolean; error?: string }> => {
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(path, file, {
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
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

      const result = await uploadFile(path, file);

      if (!result.success) {
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