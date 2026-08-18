import { put, del } from '@vercel/blob'

export async function uploadToBlob(path: string, file: File): Promise<string> {
  const blob = await put(path, file, {
    access: 'public',
  })
  return blob.url
}

export async function deleteFromBlob(url: string): Promise<void> {
  await del(url)
}