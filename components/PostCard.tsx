'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import PostItem from '@/components/PostItem';

interface Media {
  id: string;
  url: string;
  type: string;
  order: number;
}

interface Post {
  id: string;
  caption: string | null;
  createdAt: string;
  media: Media[];
}

export default function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [expandedDesc, setExpandedDesc] = useState(false);
  const [expandedTags, setExpandedTags] = useState(false);

  const description = post.caption?.split('\n').filter(line => !line.trim().startsWith('#')).join('\n') || '';
  const hashtags = post.caption?.split(/\s+/).filter(word => word.startsWith('#')) || [];

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    return truncated.slice(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
  };

  const truncatedDesc = truncateText(description, 50);
  const visibleTags = hashtags.slice(0, 5);
  const hiddenTagsCount = hashtags.length - 5;

  return (
    <div className="rounded-2xl bg-zinc-800/30 border border-white/5 overflow-hidden">
      {(description || hashtags.length > 0) && (
        <div className="px-4 pt-2 pb-3 border-b border-white/5 bg-white/[0.02] space-y-1.5">
          {description && (
            <div
              onClick={() => setExpandedDesc(!expandedDesc)}
              className="bg-zinc-900/60 rounded-lg px-3 py-2 cursor-pointer select-none transition-all duration-300 ease-in-out"
              style={{
                maxHeight: expandedDesc ? '500px' : '70px',
                overflow: 'hidden',
              }}
            >
              <p className="text-white/90 text-sm font-medium leading-relaxed">
                {expandedDesc ? description : truncatedDesc}
              </p>
            </div>
          )}

          {hashtags.length > 0 && (
            <div
              onClick={() => setExpandedTags(!expandedTags)}
              className="pl-2 cursor-pointer select-none transition-all duration-300 ease-in-out"
              style={{
                maxHeight: expandedTags ? '500px' : '30px',
                overflow: 'hidden',
              }}
            >
              <div className="flex flex-wrap gap-0.5">
                {(expandedTags ? hashtags : visibleTags).map((tag, i) => (
                  <span
                    key={i}
                    className="text-emerald-300 text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/60 leading-relaxed"
                  >
                    {tag}
                  </span>
                ))}
                {!expandedTags && hiddenTagsCount > 0 && (
                  <span className="text-white/50 text-[10px] px-1.5 py-0.5 rounded bg-zinc-900/60 leading-relaxed">
                    ... +{hiddenTagsCount}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <PostItem post={post} />

      <div className="px-4 py-3 flex items-center gap-5 border-t border-white/5">
        <button
          onClick={() => setLiked(!liked)}
          className={`text-lg transition-transform active:scale-90 ${liked ? 'text-red-400' : 'text-white/50'}`}
        >
          {liked ? '❤️' : '🤍'}
        </button>
        <button className="text-lg text-white/50 hover:text-blue-400 transition-colors">
          💬
        </button>
        <button className="text-lg text-white/50 hover:text-emerald-400 transition-colors">
          🔄
        </button>
      </div>
    </div>
  );
}