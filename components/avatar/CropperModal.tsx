'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CropperModalProps {
  children: React.ReactNode;
  onClose: () => void;
}

export default function CropperModal({ children, onClose }: CropperModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-[400px] bg-zinc-800 rounded-2xl p-4"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}