import type { Metadata } from 'next'
import './globals.css'

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
        <div className="flex justify-center min-h-screen">
          <div className="w-full max-w-[460px] bg-zinc-900 flex flex-col min-h-screen">
            {children}
          </div>
        </div>
      </body>
    </html>
  )
}