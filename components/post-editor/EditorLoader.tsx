'use client';

import { motion } from 'framer-motion';

export default function EditorLoader() {
  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
      <div className="relative w-24 h-20 mb-3">
        <motion.div
          className="absolute w-12 h-16 rounded-md bg-[#18181b] z-0"
          style={{ left: '20%', top: '15%', transformOrigin: 'bottom center' }}
          animate={{ rotate: [-10, -10, -20, -20, -10, -10] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear', times: [0, 0.3, 0.35, 0.65, 0.7, 1] }}
        />
        <motion.div
          className="absolute w-12 h-16 rounded-md bg-[#18181b] z-0"
          style={{ right: '20%', top: '15%', transformOrigin: 'bottom center' }}
          animate={{ rotate: [10, 10, 20, 20, 10, 10] }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear', times: [0, 0.3, 0.35, 0.65, 0.7, 1], delay: 0.1 }}
        />

        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          width="60"
          height="60"
          viewBox="0 0 70 70"
          fill="none"
        >
          <path d="M35 45 L10 12 Q35 5 60 12 Z" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" opacity="0.6"/>
          <path d="M35 45 L25 10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
          <path d="M35 45 L45 10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
          <path d="M35 42 L18 8" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
          <path d="M35 42 L52 8" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
        </svg>

        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-20">
          <span className="text-[#34d399] text-xs font-bold tracking-[3px]">VAIR</span>
        </div>
      </div>
      <p className="text-white/70 text-sm mt-2">Сохраняем...</p>
    </div>
  );
}