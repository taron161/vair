'use client';

import { useRouter } from 'next/navigation';
import { useUpload } from '@/lib/UploadContext';
import PostEditor from '@/components/PostEditor';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useImageCompression } from '@/hooks/useImageCompression';
import { useVideoValidation } from '@/hooks/useVideoValidation';
import { useUploadWithProgress } from '@/hooks/useUploadWithProgress';

interface EditData {
  postId: string;
  caption: string | null;
  media: { id: string; url: string; type: string; order: number; fullUrl?: string }[];
}

export default function PostEditorWrapper() {
  const { editorFiles, setEditorFiles, setUploading, uploading } = useUpload();
  const router = useRouter();
  const [editData, setEditData] = useState<EditData | null>(null);
  const { compressImage } = useImageCompression();
  const { validateAllVideos } = useVideoValidation();
  const { uploadProgress, setUploadProgress, uploadStage, setUploadStage, uploadWithProgress, animateProgress } = useUploadWithProgress();

  useEffect(() => {
    const handleEdit = (e: Event) => {
      const customEvent = e as CustomEvent;
      setEditData(customEvent.detail);
    };

    window.addEventListener('edit-post', handleEdit);
    return () => window.removeEventListener('edit-post', handleEdit);
  }, []);

  const handleCreateSave = async (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => {
    if (!data.media || data.media.length === 0) {
      alert('Нет файлов для загрузки');
      return;
    }

    const videoCheck = validateAllVideos(data.media);
    if (!videoCheck.valid) {
      alert(videoCheck.error);
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadStage('Подготовка...');
    await animateProgress(10, 400);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploading(false);
      return;
    }

    const postId = crypto.randomUUID();
    const orderedMedia = [...data.media];
    const cover = orderedMedia.splice(data.coverIndex, 1);
    const reordered = [...cover, ...orderedMedia];

    const photos: File[] = [];
    const videos: File[] = [];

    for (const file of reordered) {
      if (file.size === 0) continue;
      if (file.type.startsWith('video/')) {
        videos.push(file);
      } else {
        photos.push(file);
      }
    }

    if (photos.length === 0 && videos.length === 0) {
      setUploading(false);
      alert('Нет файлов для загрузки');
      return;
    }

    const mediaRecords: { url: string; fullUrl?: string; type: string; order: number }[] = [];

    // 1. Загружаем фото через API
    if (photos.length > 0) {
      setUploadStage('Сжатие фото...');
      await animateProgress(25, 400);

      const formData = new FormData();

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];

        if (photo.type.startsWith('image/') && !photo.type.includes('gif')) {
          const file600 = await compressImage(photo, 600);
          const file1200 = await compressImage(photo, 1200);

          if (file600.size === 0 || file1200.size === 0) continue;

          formData.append('files600', file600);
          formData.append('files1200', file1200);
        } else {
          formData.append('files', photo);
        }
      }

      formData.append('userId', user.id);
      formData.append('caption', data.caption);
      formData.append('hashtags', data.hashtags);
      formData.append('skipPostCreation', 'true');

      setUploadStage('Загрузка фото...');
      await animateProgress(50, 400);

      const res = await fetch('/api/upload-photos', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        setUploading(false);
        alert('Ошибка загрузки фото');
        return;
      }

      const result = await res.json();
      mediaRecords.push(...result.mediaRecords);
    }

    // 2. Загружаем видео напрямую в Supabase
    if (videos.length > 0) {
      setUploadStage('Загрузка видео...');
      await animateProgress(70, 400);

      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const fileExt = video.name.split('.').pop() || 'mp4';
        const path = `${user.id}/${postId}/${i}.${fileExt}`;

        const success = await uploadWithProgress([{ path, file: video }]);

        if (!success) {
          setUploading(false);
          alert('Ошибка загрузки видео');
          return;
        }

        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path);

        mediaRecords.push({
          url: urlData.publicUrl,
          type: 'video',
          order: mediaRecords.length,
        });
      }
    }

    // 3. Создаём пост
    setUploadStage('Создание поста...');
    await animateProgress(90, 400);

    const fullCaption = [data.caption, data.hashtags].filter(Boolean).join('\n');

    const { error: postError } = await supabase
      .from('Post')
      .insert({
        id: postId,
        userId: user.id,
        caption: fullCaption || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    if (postError) {
      setUploading(false);
      alert('Ошибка создания поста');
      return;
    }

    // 4. Создаём Media записи
    for (const media of mediaRecords) {
      const { error: mediaError } = await supabase
        .from('Media')
        .insert({
          id: crypto.randomUUID(),
          postId: postId,
          url: media.url,
          fullUrl: media.fullUrl,
          type: media.type,
          order: media.order,
          createdAt: new Date().toISOString(),
        });

      if (mediaError) {
        await supabase.from('Post').delete().eq('id', postId);
        setUploading(false);
        alert('Ошибка создания медиа');
        return;
      }
    }

    setUploadStage('Готово!');
    await animateProgress(100, 400);

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
  };

  const handleEditSave = async (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => {
    if (!editData) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStage('Сохранение...');
    await animateProgress(50, 300);

    const fullCaption = [data.caption, data.hashtags].filter(Boolean).join('\n');

    await supabase
      .from('Post')
      .update({ caption: fullCaption || null, updatedAt: new Date().toISOString() })
      .eq('id', editData.postId);

    setUploadStage('Готово!');
    await animateProgress(100, 300);

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
        uploadStage={uploadStage}
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
      uploadStage={uploadStage}
    />
  );
}