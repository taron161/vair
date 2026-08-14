'use client';

import { motion } from 'framer-motion';

export default function AnimatedLogo() {
  return (
    <div className="flex justify-center mb-8">
      <div className="relative w-40 h-32">
        {/* Две карточки */}
        <motion.div
          className="absolute w-16 h-24 rounded-lg bg-[#18181b] z-0"
          style={{ left: '25%', top: '15%', transformOrigin: 'bottom center' }}
          animate={{ rotate: [-10, -10, -20, -20, -10, -10] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', times: [0, 0.3, 0.35, 0.65, 0.7, 1] }}
        />
        <motion.div
          className="absolute w-16 h-24 rounded-lg bg-[#18181b] z-0"
          style={{ right: '25%', top: '15%', transformOrigin: 'bottom center' }}
          animate={{ rotate: [10, 10, 20, 20, 10, 10] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'linear', times: [0, 0.3, 0.35, 0.65, 0.7, 1], delay: 0.15 }}
        />

        {/* Веер и буква V */}
        <svg
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          width="70"
          height="70"
          viewBox="0 0 70 70"
          fill="none"
        >
          <path d="M35 45 L10 12 Q35 5 60 12 Z" stroke="#ffffff" strokeWidth="1" strokeLinejoin="round" opacity="0.6"/>
          <path d="M35 45 L25 10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
          <path d="M35 45 L45 10" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
          <path d="M35 42 L18 8" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
          <path d="M35 42 L52 8" stroke="#34d399" strokeWidth="5" strokeLinecap="round"/>
        </svg>

        {/* Надпись VAIR */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 z-20">
          <span className="text-[#34d399] text-sm font-bold tracking-[4px]">VAIR</span>
        </div>
      </div>
    </div>
  );
}