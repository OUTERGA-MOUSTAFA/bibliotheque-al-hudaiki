'use client';

import { useEffect } from 'react';
import { useRouter } from '@/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: {
  children: React.ReactNode;
  adminOnly?: boolean;
}) {
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login'); // Ila machi connecté, y-redirigi l'login
    }
    if (!loading && user && adminOnly && !isAdmin) {
      router.replace('/'); // Ila machi admin w bgha ydkhel l'admin, y-redirigi l'accueil
    }
  }, [user, loading, adminOnly, isAdmin, router]);

  // Ne jamais afficher, même un instant, le contenu admin à un non-admin
  if (loading || !user || (adminOnly && !isAdmin)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  return <>{children}</>;
}