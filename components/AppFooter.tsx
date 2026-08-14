'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useUpload } from '@/lib/UploadContext';

export default function AppFooter() {
  const pathname = usePathname();
  const [handle, setHandle] = useState<string | null>(null);
  const { uploading, handleFileSelect } = useUpload();

  useEffect(() => {
    if (typeof window === 'undefined') return

    const frame = requestAnimationFrame(() => {
      const cachedHandle = localStorage.getItem('userHandle')
      if (cachedHandle) {
        setHandle(cachedHandle)
      }
    })

    return () => cancelAnimationFrame(frame)
  }, [])

  if (pathname === '/login') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
      <div className="w-full max-w-[460px] bg-zinc-700/50 backdrop-blur-lg border-t border-white/15 px-4 py-1.5 flex items-center justify-between">
        <Link href="/feed" className={`w-10 h-10 flex items-center justify-center text-xl ${pathname === '/feed' ? 'text-white' : 'text-white/50'}`}>
          📰
        </Link>

        <Link href="/explore" className={`w-10 h-10 flex items-center justify-center text-xl ${pathname === '/explore' ? 'text-white' : 'text-white/50'}`}>
          🔍
        </Link>

        <label className="relative w-12 h-12 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? (
            <motion.div
              className="w-10 h-10 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            >
              <svg viewBox="0 0 60 60" className="w-10 h-10">
                {[0, 1, 2, 3, 4].map((i) => {
                  const angle = (i - 2) * 14;
                  return (
                    <rect key={i} x={22 + i * 2} y={6} width="12" height="36" rx="3" fill="white" opacity={0.15 + i * 0.12} transform={`rotate(${angle}, 30, 42)`} />
                  );
                })}
              </svg>
            </motion.div>
          ) : (
            <>
              <div className="w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 60 60" className="w-10 h-10">
                  {[0, 1, 2, 3, 4].map((i) => {
                    const angle = (i - 2) * 14;
                    return (
                      <rect key={i} x={22 + i * 2} y={6} width="12" height="36" rx="3" fill="white" opacity={0.15 + i * 0.12} transform={`rotate(${angle}, 30, 42)`} />
                    );
                  })}
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-emerald-400/40 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold leading-none">+</span>
                </div>
              </div>
            </>
          )}
        </label>

        <Link href="/messages" className={`w-10 h-10 flex items-center justify-center text-xl ${pathname === '/messages' ? 'text-white' : 'text-white/50'}`}>
          💬
        </Link>

        {handle ? (
          <Link
            href={`/${handle}`}
            className={`w-10 h-10 flex items-center justify-center text-xl ${pathname === `/${handle}` ? 'text-white' : 'text-white/50'}`}
          >
            👤
          </Link>
        ) : (
          <div className="w-10 h-10 flex items-center justify-center text-xl text-white/50">
            👤
          </div>
        )}
      </div>
    </div>
  );
}