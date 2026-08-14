'use client';

import { useRouter } from 'next/navigation';
import { useUpload } from '@/lib/UploadContext';
import PostEditor from '@/components/PostEditor';
import { supabase } from '@/lib/supabase';

export default function PostEditorWrapper() {
  const { editorFiles, setEditorFiles, setUploading, uploading } = useUpload();
  const router = useRouter();

  if (!editorFiles) return null;

  const compressImage = async (file: File, maxWidth: number = 1200): Promise<File> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(img.src);

        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            resolve(file);
            return;
          }
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        }, 'image/jpeg', 0.8);
      };
      img.onerror = () => resolve(file);
    });
  };

  const handleSave = async (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => {
    setUploading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    const formData = new FormData();
    const orderedMedia = [...data.media];
    const cover = orderedMedia.splice(data.coverIndex, 1);
    const reordered = [...cover, ...orderedMedia];

    for (let i = 0; i < reordered.length; i++) {
      let file = reordered[i];
      if (file.type.startsWith('image/') && !file.type.includes('gif')) {
        file = await compressImage(file);
      }
      formData.append('files', file);
    }

    formData.append('userId', user.id);
    formData.append('caption', data.caption);
    formData.append('hashtags', data.hashtags);

    let res: Response | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) break;
      } catch (err) {
        console.error(`Attempt ${attempt + 1} failed:`, err);
      }
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }

    setUploading(false);

    if (res?.ok) {
      setEditorFiles(null);

      const { data: profile } = await supabase
        .from('Profile')
        .select('handle')
        .eq('userId', user.id)
        .single();

      if (profile) {
        router.push(`/${profile.handle}`);
      }
    }
  };

  return (
    <PostEditor
      files={editorFiles}
      onSave={handleSave}
      onCancel={() => {
        if (!uploading) setEditorFiles(null);
      }}
      uploading={uploading}
    />
  );
}