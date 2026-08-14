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
  media: { id: string; url: string; type: string; order: number }[];
}

export default function PostEditorWrapper() {
  const { editorFiles, setEditorFiles, setUploading, uploading } = useUpload();
  const router = useRouter();
  const [editData, setEditData] = useState<EditData | null>(null);
  const { compressImage } = useImageCompression();

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const customEvent = e as CustomEvent;
      setEditData(customEvent.detail);
    };

    window.addEventListener('edit-post', handleEdit);
    return () => window.removeEventListener('edit-post', handleEdit);
  }, []);

  const handleCreateSave = async (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => {
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

  const handleEditSave = async (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => {
    if (!editData) return;

    setUploading(true);

    const fullCaption = [data.caption, data.hashtags].filter(Boolean).join('\n');

    await supabase
      .from('Post')
      .update({ caption: fullCaption || null, updatedAt: new Date().toISOString() })
      .eq('id', editData.postId);

    await new Promise((r) => setTimeout(r, 500));

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
    />
  );
}