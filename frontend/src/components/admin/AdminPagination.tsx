'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

// Pagination des listes de l'administration (« Page 2 sur 5 », précédent / suivant)
export function AdminPagination({ page, lastPage, total, onChange }: { page: number; lastPage: number; total: number; onChange: (p: number) => void }) {
  const t = useTranslations('admin');
  const isRtl = useLocale() === 'ar';
  if (lastPage <= 1) return null;

  const bouton = 'inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-stone-200 bg-white text-sm font-medium text-stone-700 hover:bg-sand disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-label={t('pagination')}>
      <p className="text-sm text-stone-500">{t('page_of', { page, last: lastPage, total })}</p>
      <div className="flex gap-2">
        <button type="button" className={bouton} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          {isRtl ? <ChevronRight size={16} /> : <ChevronLeft size={16} />} {t('previous')}
        </button>
        <button type="button" className={bouton} disabled={page >= lastPage} onClick={() => onChange(page + 1)}>
          {t('next')} {isRtl ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>
    </nav>
  );
}

// Valeur qui ne change qu'après une pause de frappe (évite une requête par lettre)
export function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export function AdminSearch({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search size={16} className="absolute top-1/2 -translate-y-1/2 start-3 text-stone-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full h-10 ps-9 pe-3 rounded-xl border border-stone-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
    </div>
  );
}
