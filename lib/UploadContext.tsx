'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UploadContextType {
  uploading: boolean;
  setUploading: (v: boolean) => void;
  editorFiles: File[] | null;
  setEditorFiles: (files: File[] | null) => void;
}

const UploadContext = createContext<UploadContextType>({
  uploading: false,
  setUploading: () => {},
  editorFiles: null,
  setEditorFiles: () => {},
});

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploading, setUploading] = useState(false);
  const [editorFiles, setEditorFiles] = useState<File[] | null>(null);

  return (
    <UploadContext.Provider value={{ uploading, setUploading, editorFiles, setEditorFiles }}>
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  return useContext(UploadContext);
}