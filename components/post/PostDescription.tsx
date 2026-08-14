'use client';

interface PostDescriptionProps {
  description: string;
  hashtags: string[];
  expanded: boolean;
  truncatedDesc: string;
  visibleTags: string[];
  hiddenTagsCount: number;
  onToggle: () => void;
}

export default function PostDescription({ 
  description, 
  hashtags, 
  expanded, 
  truncatedDesc, 
  visibleTags, 
  hiddenTagsCount, 
  onToggle 
}: PostDescriptionProps) {
  return (
    <div
      onClick={onToggle}
      className="cursor-pointer select-none transition-all duration-300 ease-in-out"
      style={{
        maxHeight: expanded ? '500px' : hashtags.length > 0 ? '90px' : '60px',
        overflow: 'hidden',
      }}
    >
      {description && (
        <p className="text-white/90 text-sm leading-relaxed mb-1">
          {expanded ? description : truncatedDesc}
        </p>
      )}

      {hashtags.length > 0 && (
        <p className="text-emerald-300 text-xs leading-relaxed break-words mb-1">
          {(expanded ? hashtags : visibleTags).map((tag, i) => (
            <span key={i} className="mr-1.5">
              {tag}
            </span>
          ))}
          {!expanded && hiddenTagsCount > 0 && (
            <span className="text-white/50">... +{hiddenTagsCount}</span>
          )}
        </p>
      )}
    </div>
  );
}