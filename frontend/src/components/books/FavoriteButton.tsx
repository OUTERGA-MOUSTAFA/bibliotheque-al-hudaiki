'use client';

import { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { api, apiErrorMessage } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from '@/navigation';

export default function FavoriteButton({
  bookId,
  initialFavorited,
  onChange,
}: {
  bookId: number;
  initialFavorited: boolean;
  onChange?: (favorited: boolean) => void;
}) {
  const t = useTranslations('book');
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  // Se resynchronise quand les détails du livre arrivent du serveur
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorited(initialFavorited);
  }, [initialFavorited]);

  const toggle = async () => {
    if (!isAuthenticated) {
      toast.error(t('login_required'));
      router.push('/login');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post(`/favorites/${bookId}`);
      setFavorited(data.favorited);
      onChange?.(data.favorited);
      toast.success(data.favorited ? t('favorite_added') : t('favorite_removed'));
    } catch (err) {
      toast.error(apiErrorMessage(err, t('error')));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-pressed={favorited}
      aria-label={favorited ? t('favorite_remove') : t('favorite')}
      title={favorited ? t('favorite_remove') : t('favorite')}
      className={`w-11 h-11 shrink-0 rounded-full border flex items-center justify-center transition ${
        favorited
          ? 'bg-coral-50 border-coral-200 text-coral-500'
          : 'bg-white border-stone-200 text-stone-400 hover:text-coral-500 hover:border-coral-200'
      }`}
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <Heart size={20} fill={favorited ? 'currentColor' : 'none'} />}
    </button>
  );
}
