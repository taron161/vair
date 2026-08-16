'use client';

import { useState } from 'react';

export function useUploadWithProgress() {
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadWithProgress = (formData: FormData): Promise<boolean> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.timeout = 120000;

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 95);
          setUploadProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        setUploadProgress(100);

        setTimeout(() => {
          resolve(xhr.status >= 200 && xhr.status < 300);
        }, 1000);
      });

      xhr.addEventListener('error', () => {
        resolve(false);
      });

      xhr.addEventListener('abort', () => {
        resolve(false);
      });

      xhr.addEventListener('timeout', () => {
        resolve(false);
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  return {
    uploadProgress,
    setUploadProgress,
    uploadWithProgress,
  };
}