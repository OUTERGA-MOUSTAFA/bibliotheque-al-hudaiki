'use client';

import { useEffect } from 'react';
import { useRouter } from '@/navigation';
import { auth } from '@/lib/auth';

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    if (adminOnly && !auth.isAdmin()) {
      router.replace('/');
    }
  }, [router, adminOnly]);

  if (!auth.isAuthenticated()) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
      </div>
    );
  }

  return <>{children}</>;
}