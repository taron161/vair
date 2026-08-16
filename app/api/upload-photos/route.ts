import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files600 = formData.getAll('files600') as File[]
    const files1200 = formData.getAll('files1200') as File[]
    const videoFiles = formData.getAll('files') as File[]
    const userId = formData.get('userId') as string

    const totalFiles = files600.length + videoFiles.length

    if (!totalFiles || !userId) {
      return NextResponse.json({ error: 'Нет файлов или пользователя' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const postId = crypto.randomUUID()

    const mediaRecords: { url: string; fullUrl?: string; type: string; order: number }[] = []
    const uploadedFileNames: string[] = []

    // Загружаем фото (600 и 1200)
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

      uploadedFileNames.push(fileName600)

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

        uploadedFileNames.push(fileName1200)

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

      mediaRecords.push({
        url: urlData600.publicUrl,
        fullUrl,
        type: 'photo',
        order: mediaRecords.length,
      })
    }

    return NextResponse.json({ success: true, mediaRecords, postId })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}