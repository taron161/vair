export interface LikeData {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

export interface CommentData {
  id: string;
  postId: string;
  userId: string;
  text: string;
  createdAt: string;
}

export interface Media {
  id: string;
  url: string;
  type: string;
  order: number;
  fullUrl?: string;
}

export interface PostWithRelations {
  id: string;
  caption: string | null;
  createdAt: string;
  userId?: string;
  media: Media[];
  likes: LikeData[];
  comments: CommentData[];
}

export interface ScoredPost {
  id: string;
  caption: string | null;
  createdAt: string;
  userId?: string;
  media: Media[];
  score: number;
}

export function calculateScore(post: PostWithRelations): number {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  const likes = post.likes || [];
  const comments = post.comments || [];

  const likesCount = likes.length;
  const commentsCount = comments.length;

  const lastDayLikes = likes.filter((l) => {
    return now - new Date(l.createdAt).getTime() < dayInMs;
  }).length;

  const lastDayComments = comments.filter((c) => {
    return now - new Date(c.createdAt).getTime() < dayInMs;
  }).length;

  const postAge = now - new Date(post.createdAt).getTime();
  const ageHours = Math.max(1, postAge / (1000 * 60 * 60));

  return (
    (lastDayLikes * 10) +
    (lastDayComments * 20) +
    (likesCount / ageHours) +
    (commentsCount / ageHours) +
    (1000 / ageHours)
  );
}

export function sortPostsByScore(posts: PostWithRelations[]): ScoredPost[] {
  return posts
    .map((post) => ({
      id: post.id,
      caption: post.caption,
      createdAt: post.createdAt,
      userId: post.userId,
      media: (post.media || []).sort((a, b) => a.order - b.order),
      score: calculateScore(post),
    }))
    .sort((a, b) => b.score - a.score);
}