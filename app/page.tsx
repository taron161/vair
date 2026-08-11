import FanGallery from '@/components/FanGallery'

const demoPhotos = [
  { id: '1', url: '/photo/photo-1.jpg', caption: 'Золотой закат' },
  { id: '2', url: '/photo/photo-2.jpg', caption: 'Утренний город' },
  { id: '3', url: '/photo/photo-3.jpg', caption: 'Лесная тропа' },
  { id: '4', url: '/photo/photo-4.jpg', caption: 'Морской бриз' },
  { id: '5', url: '/photo/photo-5.jpg', caption: 'Ночные огни' },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex justify-center">
      <div className="w-full max-w-[460px] min-h-screen bg-zinc-900 flex flex-col">
        <header className="px-4 py-3 border-b border-white/10">
          <h1 className="text-white text-xl font-bold">VAIR</h1>
        </header>

        <div className="flex-1 flex items-center justify-center">
          <FanGallery photos={demoPhotos} />
        </div>

        <nav className="px-4 py-3 border-t border-white/10">
          <p className="text-white/50 text-sm text-center">🏠</p>
        </nav>
      </div>
    </main>
  )
}