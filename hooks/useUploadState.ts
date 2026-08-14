'use client';

import { useState, useCallback } from 'react';

export function useUploadState() {
  const [uploading, setUploading] = useState(false);
  const [editorFiles, setEditorFiles] = useState<File[] | null>(null);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setEditorFiles(Array.from(files));
    e.target.value = '';
  }, []);

  return {
    uploading,
    setUploading,
    editorFiles,
    setEditorFiles,
    handleFileSelect,
  };
}