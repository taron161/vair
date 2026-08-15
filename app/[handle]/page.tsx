import { notFound } from 'next/navigation';
import AppFooter from '@/components/AppFooter';
import { UploadProvider } from '@/lib/UploadContext';
import PostEditorWrapper from '@/components/PostEditorWrapper';
import ProfileHeader from '@/components/profile/ProfileHeader';
import { loadUserPosts } from '@/lib/loadUserPosts';
import PostListClient from '@/components/PostListClient';

export default async function UserProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params;
  const data = await loadUserPosts(handle);

  if (!data) notFound();

  const { profile, posts } = data;

  return (
    <UploadProvider>
      <ProfileHeader profile={profile} />
      <div className="flex-1 overflow-y-auto pt-4 pb-24">
        {posts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/50 text-sm">Нет постов</p>
          </div>
        ) : (
          <PostListClient posts={posts} userId={profile.userId} />
        )}
      </div>
      <AppFooter />
      <PostEditorWrapper />
    </UploadProvider>
  );
}