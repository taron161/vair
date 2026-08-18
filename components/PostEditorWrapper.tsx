'use client';

import { useRouter } from 'next/navigation';
import { useUpload } from '@/lib/UploadContext';
import PostEditor from '@/components/PostEditor';
import { uploadToBlob } from '@/lib/blob';
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
  const { uploadProgress, setUploadProgress, uploadStage, setUploadStage, animateProgress } = useUploadWithProgress();

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

    // 1. Загружаем фото
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

    // 2. Загружаем видео
    if (videos.length > 0) {
      setUploadStage('Загрузка видео...');
      await animateProgress(70, 400);

      for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const fileExt = video.name.split('.').pop() || 'mp4';
        const path = `${user.id}/${postId}/${i}.${fileExt}`;

        try {
          const url = await uploadToBlob(path, video);
          mediaRecords.push({
            url,
            type: 'video',
            order: mediaRecords.length,
          });
        } catch (err) {
          setUploading(false);
          alert('Ошибка загрузки видео');
          return;
        }
      }
    }

    // 3. Создаём пост через API
    setUploadStage('Создание поста...');
    await animateProgress(90, 400);

    const fullCaption = [data.caption, data.hashtags].filter(Boolean).join('\n');

    const res = await fetch('/api/create-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        userId: user.id,
        caption: fullCaption,
        mediaRecords,
      }),
    });

    if (!res.ok) {
      setUploading(false);
      alert('Ошибка создания поста');
      return;
    }

    setUploadStage('Готово!');
    await animateProgress(100, 400);

    await new Promise((r) => setTimeout(r, 300));

    setUploading(false);
    setEditorFiles(null);

    // Получаем handle через API
    const profileRes = await fetch(`/api/get-handle?userId=${user.id}`);
    if (profileRes.ok) {
      const profileData = await profileRes.json();
      if (profileData.handle) {
        router.push(`/${profileData.handle}`);
      }
    }
  };

  const handleEditSave = async (data: { media: File[]; coverIndex: number; caption: string; hashtags: string }) => {
    if (!editData) return;

    setUploading(true);
    setUploadProgress(0);
    setUploadStage('Сохранение...');
    await animateProgress(50, 300);

    const fullCaption = [data.caption, data.hashtags].filter(Boolean).join('\n');

    const res = await fetch('/api/update-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: editData.postId,
        caption: fullCaption,
      }),
    });

    if (!res.ok) {
      setUploading(false);
      alert('Ошибка сохранения');
      return;
    }

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