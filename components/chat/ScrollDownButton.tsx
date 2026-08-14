'use client';

interface ScrollDownButtonProps {
  onClick: () => void;
}

export default function ScrollDownButton({ onClick }: ScrollDownButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-24 right-4 w-10 h-10 rounded-full bg-emerald-400/70 backdrop-blur-sm text-black border-2 border-emerald-300/50 shadow-lg flex items-center justify-center z-10 active:scale-90 transition-transform cursor-pointer"
    >
      ↓
    </button>
  );
}