'use client';

import { motion } from 'framer-motion';

interface AppFooterProps {
  uploading: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function AppFooter({ uploading, onFileSelect }: AppFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
      <div className="w-full max-w-[460px] bg-zinc-900/95 backdrop-blur-lg border-t border-white/10 px-4 py-1.5 flex items-center justify-between">
        <div className="w-10 h-10" />

        <label className="relative w-12 h-12 flex items-center justify-center cursor-pointer active:scale-90 transition-transform">
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onFileSelect}
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
                    <rect
                      key={i}
                      x={22 + i * 2}
                      y={6}
                      width="12"
                      height="36"
                      rx="3"
                      fill="white"
                      opacity={0.15 + i * 0.12}
                      transform={`rotate(${angle}, 30, 42)`}
                    />
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
                      <rect
                        key={i}
                        x={22 + i * 2}
                        y={6}
                        width="12"
                        height="36"
                        rx="3"
                        fill="white"
                        opacity={0.15 + i * 0.12}
                        transform={`rotate(${angle}, 30, 42)`}
                      />
                    );
                  })}
                </svg>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-emerald-400/30 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <span className="text-white text-lg font-bold leading-none">+</span>
                </div>
              </div>
            </>
          )}
        </label>

        <div className="w-10 h-10" />
      </div>
    </div>
  );
}