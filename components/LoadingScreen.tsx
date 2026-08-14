'use client';

import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center">
      <div className="relative w-40 h-40">
        {/* Две карточки веером */}
        <motion.div
          className="absolute w-16 h-28 rounded-lg bg-[#18181b]"
          style={{ left: '20%', top: '15%', transformOrigin: 'bottom center' }}
          animate={{ rotate: [-8, -12, -8] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-16 h-28 rounded-lg bg-[#18181b]"
          style={{ right: '20%', top: '15%', transformOrigin: 'bottom center' }}
          animate={{ rotate: [8, 12, 8] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut', delay: 0.2 }}
        />

        {/* Буква V */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ opacity: [0, 1, 1] }}
          transition={{ duration: 1, ease: 'easeOut' }}
        >
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path d="M25 35 L10 10" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
            <path d="M25 35 L40 10" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
          </svg>
        </motion.div>

        {/* Надпись VAIR */}
        <motion.div
          className="absolute left-1/2 bottom-0 -translate-x-1/2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <span className="text-[#34d399] text-sm font-bold tracking-[4px]">VAIR</span>
        </motion.div>
      </div>
    </div>
  );
}