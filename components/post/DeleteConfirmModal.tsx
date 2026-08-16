'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteConfirmModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({ onConfirm, onCancel, isDeleting }: DeleteConfirmModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[150] bg-black/80 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      >
        <motion.div
          className="w-full max-w-[320px] bg-zinc-800 rounded-2xl p-5"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-white font-semibold text-lg mb-2 text-center">Удалить пост?</h3>
          <p className="text-white/50 text-sm mb-4 text-center">
            Пост будет удален.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? 'Удаление...' : 'Удалить'}
            </button>
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 py-2.5 rounded-xl bg-white/10 text-white/70 hover:bg-white/20 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Отмена
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}