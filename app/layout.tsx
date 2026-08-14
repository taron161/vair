import type { Metadata } from 'next'
import './globals.css'
import { UploadProvider } from '@/lib/UploadContext'
import AppFooter from '@/components/AppFooter'
import PostEditorWrapper from '@/components/PostEditorWrapper'

export const metadata: Metadata = {
  title: 'VAIR',
  description: 'Фото в формате веера',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="bg-black">
        <UploadProvider>
          <div className="flex justify-center min-h-screen">
            <div className="w-full max-w-[460px] bg-zinc-900 flex flex-col min-h-screen">
              {children}
              <AppFooter />
              <PostEditorWrapper />
            </div>
          </div>
        </UploadProvider>
      </body>
    </html>
  )
}