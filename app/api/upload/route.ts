import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const userId = formData.get('userId') as string
    const caption = formData.get('caption') as string
    const hashtagsRaw = formData.get('hashtags') as string

    console.log('Upload started:', { filesCount: files.length, userId })

    if (!files.length || !userId) {
      return NextResponse.json({ error: 'Нет файлов или пользователя' }, { status: 400 })
    }

    if (files.length > 7) {
      return NextResponse.json({ error: 'Максимум 7 файлов в одном посте' }, { status: 400 })
    }

    // Форматируем хештеги
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

    // Создаём пост
    const postId = crypto.randomUUID()
    console.log('Creating post:', postId)

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
      console.error('Post error:', postError)
      return NextResponse.json({ error: postError.message }, { status: 500 })
    }

    console.log('Post created successfully')

    // Загружаем файлы
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}/${postId}/${i}.${fileExt}`

      console.log('Uploading file:', fileName)

      const { error: uploadError } = await supabase
        .storage
        .from('photos')
        .upload(fileName, file)

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return NextResponse.json({ error: uploadError.message }, { status: 500 })
      }

      const { data: urlData } = supabase
        .storage
        .from('photos')
        .getPublicUrl(fileName)

      const isVideo = file.type.startsWith('video')

      const { error: mediaError } = await supabase
        .from('Media')
        .insert({
          id: crypto.randomUUID(),
          postId: postId,
          url: urlData.publicUrl,
          type: isVideo ? 'video' : 'photo',
          order: i,
          createdAt: new Date().toISOString(),
        })

      if (mediaError) {
        console.error('Media error:', mediaError)
        return NextResponse.json({ error: mediaError.message }, { status: 500 })
      }
    }

    console.log('All done!')
    return NextResponse.json({ success: true, postId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('General error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}