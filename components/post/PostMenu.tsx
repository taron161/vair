'use client';

import { useRef, useEffect } from 'react';

interface PostMenuProps {
  menuOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export default function PostMenu({ menuOpen, onToggle, onEdit, onDelete, isDeleting }: PostMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onToggle();
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen, onToggle]);

  return (
    <div className="relative flex-shrink-0" ref={menuRef}>
      <button
        onClick={onToggle}
        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center justify-center cursor-pointer"
      >
        <span className="text-lg leading-none">⋯</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-10 w-44 bg-zinc-800 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50">
          <button
            onClick={onEdit}
            className="block w-full text-left px-4 py-3 text-white/80 text-sm hover:bg-white/10 transition-colors border-b border-white/5 cursor-pointer"
          >
            ✏️ Редактировать
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="block w-full text-left px-4 py-3 text-red-400 text-sm hover:bg-white/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? 'Удаление...' : '🗑️ Удалить'}
          </button>
        </div>
      )}
    </div>
  );
}