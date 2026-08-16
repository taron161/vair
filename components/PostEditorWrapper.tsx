'use client';

import { useRouter } from 'next/navigation';
import { useUpload } from '@/lib/UploadContext';
import PostEditor from '@/components/PostEditor';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useImageCompression } from '@/hooks/useImageCompression';

interface EditData {
  postId: string;
  caption: string | null;
  media: { id: string; url: string; type: string; order: number; fullUrl?: string }[];
}

export default function PostEditorWrapper() {
  const { editorFiles, setEditorFiles, setUploading, uploading } = useUpload();
  const router = useRouter();
  const [editData, setEditData] = useState<EditData | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { compressImage } = useImageCompression();

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const customEvent = e as CustomEvent;
      setEditData(customEvent.detail);
    };

    window.addEventListener('edit-post', handleEdit);
    return () => window.removeEventListener('edit-post', handleEdit);
  }, []);

  const uploadWithProgress = (formData: FormData): Promise<boolean> => {
    return new Promise((resolve) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 80);
          setUploadProgress(percent);
        }
      });

      xhr.addEventListener('load', () => {
        setUploadProgress(90);

        setTimeout(() => {
          resolve(xhr.status >= 200 && xhr.status < 300);
        }, 500);
      });

      xhr.addEventListener('error', () => {
        resolve(false);
      });

      xhr.addEventListener('abort', () => {
        resolve(false);
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const handleCreateSave = async (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => {
    if (!data.media || data.media.length === 0) {
      alert('Нет файлов для загрузки');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    const formData = new FormData();
    const orderedMedia = [...data.media];
    const cover = orderedMedia.splice(data.coverIndex, 1);
    const reordered = [...cover, ...orderedMedia];

    let hasValidFiles = false;

    for (let i = 0; i < reordered.length; i++) {
      const originalFile = reordered[i];

      if (originalFile.size === 0) continue;
      
      hasValidFiles = true;

      if (originalFile.type.startsWith('image/') && !originalFile.type.includes('gif')) {
        const file600 = await compressImage(originalFile, 600);
        const file1200 = await compressImage(originalFile, 1200);

        if (file600.size === 0 || file1200.size === 0) continue;
        
        formData.append('files600', file600);
        formData.append('files1200', file1200);
      } else {
        formData.append('files', originalFile);
      }
    }

    if (!hasValidFiles) {
      setUploading(false);
      alert('Нет файлов для загрузки');
      return;
    }

    formData.append('userId', user.id);
    formData.append('caption', data.caption);
    formData.append('hashtags', data.hashtags);

    let success = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      setUploadProgress(0);
      success = await uploadWithProgress(formData);
      if (success) break;
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }

    if (success) {
      setUploadProgress(100);

      await new Promise((r) => setTimeout(r, 300));

      setUploading(false);
      setEditorFiles(null);

      const { data: profile } = await supabase
        .from('Profile')
        .select('handle')
        .eq('userId', user.id)
        .single();

      if (profile) {
        router.push(`/${profile.handle}`);
      }
    } else {
      setUploading(false);
      alert('Ошибка загрузки. Попробуйте снова.');
    }
  };

  const handleEditSave = async (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => {
    if (!editData) return;

    setUploading(true);
    setUploadProgress(50);

    const fullCaption = [data.caption, data.hashtags].filter(Boolean).join('\n');

    await supabase
      .from('Post')
      .update({ caption: fullCaption || null, updatedAt: new Date().toISOString() })
      .eq('id', editData.postId);

    setUploadProgress(100);

    await new Promise((r) => setTimeout(r, 300));

    setUploading(false);
    setEditData(null);
    window.location.reload();
  };

  if (editData) {
    const caption = editData.caption || '';
    const desc = caption.split('\n').filter(line => !line.trim().startsWith('#')).join('\n');
    const tags = caption.split(/\s+/).filter(word => word.startsWith('#')).join(' ');

    return (
      <PostEditor
        files={[]}
        onSave={handleEditSave}
        onCancel={() => setEditData(null)}
        uploading={uploading}
        initialCaption={desc}
        initialHashtags={tags}
        editMode
        editMedia={editData.media}
        uploadProgress={uploadProgress}
      />
    );
  }

  if (!editorFiles) return null;

  return (
    <PostEditor
      files={editorFiles}
      onSave={handleCreateSave}
      onCancel={() => {
        if (!uploading) setEditorFiles(null);
      }}
      uploading={uploading}
      uploadProgress={uploadProgress}
    />
  );
}