'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useUploadState } from '@/hooks/useUploadState';

interface UploadContextType {
  uploading: boolean;
  setUploading: (v: boolean) => void;
  editorFiles: File[] | null;
  setEditorFiles: (files: File[] | null) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadContext = createContext<UploadContextType>({
  uploading: false,
  setUploading: () => {},
  editorFiles: null,
  setEditorFiles: () => {},
  handleFileSelect: () => {},
});

export function UploadProvider({ children }: { children: ReactNode }) {
  const uploadState = useUploadState();

  return (
    <UploadContext.Provider value={uploadState}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  return useContext(UploadContext);
}