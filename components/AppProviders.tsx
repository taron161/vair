'use client';

import { UploadProvider } from '@/lib/UploadContext';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import PostEditorWrapper from '@/components/PostEditorWrapper';
import { usePathname } from 'next/navigation';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <UploadProvider>
      <div className="flex justify-center min-h-screen">
        <div className="w-full max-w-[460px] bg-zinc-900 flex flex-col min-h-screen">
          {pathname !== '/login' && <AppHeader />}
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <AppFooter />
          <PostEditorWrapper />
        </div>
      </div>
    </UploadProvider>
  );
}