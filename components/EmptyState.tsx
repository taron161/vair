'use client';

interface EmptyStateProps {
  uploading: boolean;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function EmptyState({ uploading, onFileSelect }: EmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full px-6">
      <div className="text-center">
        <p className="text-white text-lg mb-2">У вас пока нет постов</p>
        <p className="text-white/50 text-sm mb-6">Поделитесь первым снимком!</p>
        <label className="inline-block px-6 py-3 rounded-xl bg-white text-black font-semibold cursor-pointer hover:bg-white/90 transition-colors">
          {uploading ? 'Загрузка...' : '📷 Создать пост'}
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={onFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>
    </div>
  );
}