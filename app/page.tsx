import { prisma } from '@/lib/prisma'
import FanGallery from '@/components/FanGallery'

export default async function Home() {
  const photos = await prisma.photo.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[460px] min-h-screen bg-zinc-900 flex flex-col">
        {/* Шапка */}
        <header className="px-4 py-3 border-b border-white/10">
          <h1 className="text-white text-xl font-bold">VAIR</h1>
        </header>

        {/* Контент */}
        <div className="flex-1 flex items-center justify-center">
          {photos.length === 0 ? (
            <p className="text-white/50 text-lg">Пока нет фотографий. Добавь первую!</p>
          ) : (
            <FanGallery photos={photos} />
          )}
        </div>

        {/* Нижняя навигация (заглушка) */}
        <nav className="px-4 py-3 border-t border-white/10">
          <p className="text-white/50 text-sm text-center">🏠</p>
        </nav>
      </div>
    </main>
  )
}