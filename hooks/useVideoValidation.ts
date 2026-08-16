'use client';

export function useVideoValidation() {
  const MAX_VIDEO_SIZE = 30 * 1024 * 1024; // 30 МБ

  const validateVideo = (file: File): { valid: boolean; error?: string } => {
    if (file.type.startsWith('video/') && file.size > MAX_VIDEO_SIZE) {
      return {
        valid: false,
        error: `Видео "${file.name}" слишком большое. Максимум 30 МБ`,
      };
    }
    return { valid: true };
  };

  const validateAllVideos = (files: File[]): { valid: boolean; error?: string } => {
    for (const file of files) {
      const result = validateVideo(file);
      if (!result.valid) {
        return result;
      }
    }
    return { valid: true };
  };

  const hasVideo = (files: File[]): boolean => {
    return files.some((f) => f.type.startsWith('video/'));
  };

  return {
    validateVideo,
    validateAllVideos,
    hasVideo,
  };
}