import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files600 = formData.getAll('files600') as File[]
    const files1200 = formData.getAll('files1200') as File[]
    const videoFiles = formData.getAll('files') as File[]
    const userId = formData.get('userId') as string
    const caption = formData.get('caption') as string
    const hashtagsRaw = formData.get('hashtags') as string

    const totalFiles = files600.length + videoFiles.length

    if (!totalFiles || !userId) {
      return NextResponse.json({ error: 'Нет файлов или пользователя' }, { status: 400 })
    }

    if (totalFiles > 7) {
      return NextResponse.json({ error: 'Максимум 7 файлов в одном посте' }, { status: 400 })
    }

    let formattedHashtags = ''
    if (hashtagsRaw) {
      formattedHashtags = hashtagsRaw
        .split(/[\s,;]+/)
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`)
        .join(' ')
    }

    const fullCaption = [caption || '', formattedHashtags].filter(Boolean).join('\n')

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const postId = crypto.randomUUID()

    const uploadedFiles: { url: string; fullUrl?: string; type: 'photo' | 'video'; order: number }[] = []

    // Фото
    for (let i = 0; i < files600.length; i++) {
      const file600 = files600[i]
      const file1200 = files1200[i]

      if (!file600 || file600.size === 0) continue

      const fileExt = file600.name.split('.').pop() || 'jpg'
      const fileName600 = `${userId}/${postId}/${i}-600.${fileExt}`
      const fileName1200 = `${userId}/${postId}/${i}-1200.${fileExt}`

      const { error: upload600Error } = await supabase
        .storage
        .from('photos')
        .upload(fileName600, file600)

      if (upload600Error) {
        return NextResponse.json({ error: upload600Error.message }, { status: 500 })
      }

      let fullUrl: string | undefined

      if (file1200 && file1200.size > 0) {
        const { error: upload1200Error } = await supabase
          .storage
          .from('photos')
          .upload(fileName1200, file1200)

        if (upload1200Error) {
          await supabase.storage.from('photos').remove([fileName600])
          return NextResponse.json({ error: upload1200Error.message }, { status: 500 })
        }

        const { data: urlData1200 } = supabase
          .storage
          .from('photos')
          .getPublicUrl(fileName1200)
        fullUrl = urlData1200.publicUrl
      }

      const { data: urlData600 } = supabase
        .storage
        .from('photos')
        .getPublicUrl(fileName600)

      uploadedFiles.push({
        url: urlData600.publicUrl,
        fullUrl,
        type: 'photo',
        order: uploadedFiles.length,
      })
    }

    // Видео
    for (let i = 0; i < videoFiles.length; i++) {
      const file = videoFiles[i]

      if (!file || file.size === 0) continue

      const fileExt = file.name.split('.').pop() || 'mp4'
      const fileName = `${userId}/${postId}/${i}.${fileExt}`

      const { error: uploadError } = await supabase
        .storage
        .from('photos')
        .upload(fileName, file)

      if (uploadError) {
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      const { data: urlData } = supabase
        .storage
        .from('photos')
        .getPublicUrl(fileName)

      uploadedFiles.push({
        url: urlData.publicUrl,
        type: 'video',
        order: uploadedFiles.length,
      })
    }

    // Проверяем, что все файлы загружены
    if (uploadedFiles.length !== totalFiles) {
      // Удаляем загруженные файлы
      const filesToRemove: string[] = [];
      for (const file of uploadedFiles) {
        const fileName = file.url.split('/').slice(-2).join('/');
        filesToRemove.push(fileName);
        if (file.fullUrl) {
          const fullFileName = file.fullUrl.split('/').slice(-2).join('/');
          filesToRemove.push(fullFileName);
        }
      }
      if (filesToRemove.length > 0) {
        await supabase.storage.from('photos').remove(filesToRemove);
      }
      return NextResponse.json({ error: 'Не все файлы загружены' }, { status: 400 });
    }

    // Создаём пост
    const { error: postError } = await supabase
      .from('Post')
      .insert({
        id: postId,
        userId: userId,
        caption: fullCaption || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 500 })
    }

    // Создаём записи Media
    for (const file of uploadedFiles) {
      const { error: mediaError } = await supabase
        .from('Media')
        .insert({
          id: crypto.randomUUID(),
          postId: postId,
          url: file.url,
          fullUrl: file.fullUrl,
          type: file.type,
          order: file.order,
          createdAt: new Date().toISOString(),
        })

      if (mediaError) {
        await supabase.from('Post').delete().eq('id', postId)
        return NextResponse.json({ error: mediaError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, postId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}