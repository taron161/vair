'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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
  const [uploading, setUploading] = useState(false);
  const [editorFiles, setEditorFiles] = useState<File[] | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;
    setEditorFiles(Array.from(files));
    e.target.value = '';
  };

  return (
    <UploadContext.Provider value={{ uploading, setUploading, editorFiles, setEditorFiles, handleFileSelect }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  return useContext(UploadContext);
}