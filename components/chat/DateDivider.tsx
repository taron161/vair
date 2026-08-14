'use client';

export default function DateDivider({ dateStr }: { dateStr: string }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const dayBefore = new Date(today);
    dayBefore.setDate(today.getDate() - 2);

    if (date.toDateString() === today.toDateString()) return 'Сегодня';
    if (date.toDateString() === yesterday.toDateString()) return 'Вчера';
    if (date.toDateString() === dayBefore.toDateString()) return 'Позавчера';
    
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="flex justify-center my-4">
      <span className="px-3 py-1 rounded-full bg-zinc-700/50 text-white/60 text-[11px]">
        {formatDate(dateStr)}
      </span>
    </div>
  );
}