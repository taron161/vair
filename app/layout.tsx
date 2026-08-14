import type { Metadata } from 'next'
import './globals.css'
import { Noto_Sans } from 'next/font/google'
import { UploadProvider } from '@/lib/UploadContext'
import AppFooter from '@/components/AppFooter'
import PostEditorWrapper from '@/components/PostEditorWrapper'

const notoSans = Noto_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
})

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
    <html lang="ru" className={notoSans.variable}>
      <body className={`${notoSans.className} bg-black`}>
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