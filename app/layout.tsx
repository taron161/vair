import type { Metadata } from 'next'
import './globals.css'
import { Noto_Sans } from 'next/font/google'
import AppProviders from '@/components/AppProviders'

const notoSans = Noto_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
})

export const metadata: Metadata = {
  title: 'VAIR',
  description: 'Фото в формате веера',
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/logo-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/logo-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/logo-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/logo-180.png', sizes: '180x180', type: 'image/png' },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className={notoSans.variable}>
      <body className={`${notoSans.className} bg-black`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}