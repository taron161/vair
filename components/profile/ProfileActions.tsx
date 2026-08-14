'use client';

interface ProfileActionsProps {
  onEditAvatar: () => void;
  onEditName: () => void;
  onSettings: () => void;
  onLogout: () => void;
}

export default function ProfileActions({ onEditAvatar, onEditName, onSettings, onLogout }: ProfileActionsProps) {
  return (
    <div className="space-y-1">
      <button
        onClick={onEditAvatar}
        className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-white/80 text-sm hover:bg-white/10 transition-colors cursor-pointer"
      >
        📷 Изменить аватар
      </button>

      <button
        onClick={onEditName}
        className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-white/80 text-sm hover:bg-white/10 transition-colors cursor-pointer"
      >
        ✏️ Изменить имя
      </button>

      <button
        onClick={onSettings}
        className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-white/80 text-sm hover:bg-white/10 transition-colors cursor-pointer"
      >
        ⚙️ Настройки
      </button>

      <button
        onClick={onLogout}
        className="w-full text-left px-4 py-3 rounded-xl bg-white/5 text-red-400 text-sm hover:bg-white/10 transition-colors cursor-pointer"
      >
        🚪 Выйти
      </button>
    </div>
  );
}