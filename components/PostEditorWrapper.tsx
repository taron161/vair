'use client';

import { useRouter } from 'next/navigation';
import { useUpload } from '@/lib/UploadContext';
import PostEditor from '@/components/PostEditor';
import { supabase } from '@/lib/supabase';

export default function PostEditorWrapper() {
  const { editorFiles, setEditorFiles, setUploading, uploading } = useUpload();
  const router = useRouter();

  if (!editorFiles) return null;

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
      formData.append('files', reordered[i]);
    }

    formData.append('userId', user.id);
    formData.append('caption', data.caption);
    formData.append('hashtags', data.hashtags);

    const res = await fetch('/api/upload', { method: 'POST', body: formData });

    if (res.ok) {
      const { data: profile } = await supabase
        .from('Profile')
        .select('handle')
        .eq('userId', user.id)
        .single();

      setUploading(false);
      setEditorFiles(null);

      if (profile) {
        router.push(`/${profile.handle}`);
      }
    } else {
      setUploading(false);
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