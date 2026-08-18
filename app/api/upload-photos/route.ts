import { put } from '@vercel/blob'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const files600 = formData.getAll('files600') as File[]
    const files1200 = formData.getAll('files1200') as File[]
    const userId = formData.get('userId') as string

    const totalFiles = files600.length

    if (!totalFiles || !userId) {
      return NextResponse.json({ error: 'Нет файлов или пользователя' }, { status: 400 })
    }

    const mediaRecords: { url: string; fullUrl?: string; type: string; order: number }[] = []
    const postId = crypto.randomUUID()

    for (let i = 0; i < files600.length; i++) {
      const file600 = files600[i]
      const file1200 = files1200[i]

      const blob600 = await put(`${userId}/${postId}/${i}-600.jpg`, file600, {
        access: 'public',
        contentType: 'image/jpeg',
      })

      let fullUrl: string | undefined

      if (file1200 && file1200.size > 0) {
        const blob1200 = await put(`${userId}/${postId}/${i}-1200.jpg`, file1200, {
          access: 'public',
          contentType: 'image/jpeg',
        })
        fullUrl = blob1200.url
      }

      mediaRecords.push({
        url: blob600.url,
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