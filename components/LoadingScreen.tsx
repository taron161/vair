'use client';

import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div className="text-center">
        {/* Анимированный веер */}
        <motion.div
          className="relative w-20 h-20 mx-auto mb-6"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <svg viewBox="0 0 60 60" className="w-20 h-20">
            {[0, 1, 2, 3, 4].map((i) => {
              const angle = (i - 2) * 14;
              return (
                <motion.rect
                  key={i}
                  x={22 + i * 2}
                  y={6}
                  width="12"
                  height="36"
                  rx="3"
                  fill="white"
                  initial={{ opacity: 0.1 }}
                  animate={{ opacity: [0.1, 0.3, 0.1] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    delay: i * 0.15,
                  }}
                  transform={`rotate(${angle}, 30, 42)`}
                />
              );
            })}
          </svg>
        </motion.div>

        {/* Название */}
        <motion.h1
          className="text-white text-3xl font-bold tracking-wider"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          VAIR
        </motion.h1>

        {/* Подпись */}
        <motion.p
          className="text-white/30 text-sm mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          разверни момент
        </motion.p>
      </div>
    </div>
  );
}