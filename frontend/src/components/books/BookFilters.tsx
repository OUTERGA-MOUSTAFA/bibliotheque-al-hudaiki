'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '@/navigation';
import { useTranslations } from 'next-intl';
import { X, SlidersHorizontal, Search } from 'lucide-react';
import type { Category } from '@/types';

interface BookFiltersProps {
  categories?: Category[];
}

export default function BookFilters({ categories = [] }: BookFiltersProps) {
  const t = useTranslations('catalog');
  const tBook = useTranslations('book');
  // Routeur de next-intl : garde la langue courante dans l'URL (/fr/… ou /ar/…)
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get('q') ?? '');

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value && value !== 'all') newParams.set(key, value);
    else newParams.delete(key);
    newParams.delete('page');
    const qs = newParams.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  };

  const clearAll = () => {
    setSearch('');
    router.push(pathname);
  };

  const currentCat = params.get('categorie') || 'all';
  const currentLang = params.get('langue') || 'all';
  const currentAvail = params.get('disponible') || 'all';
  const currentTri = params.get('tri') || 'recent';

  const hasFilters =
    currentCat !== 'all' || currentLang !== 'all' || currentAvail !== 'all' || currentTri !== 'recent' || params.has('q');

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <SlidersHorizontal size={16} className="text-brand-600" />
          </div>
          <h2 className="font-bold text-stone-900">{t('filters')}</h2>
        </div>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs font-semibold text-coral-600 hover:text-coral-700 flex items-center gap-1">
            <X size={12} /> {t('clear_filters')}
          </button>
        )}
      </div>

      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); updateFilter('q', search.trim()); }}
        className="relative mb-6"
      >
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('search_placeholder')}
          aria-label={t('search')}
          className="w-full h-10 ps-3 pe-10 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button type="submit" aria-label={t('search')} className="absolute inset-y-0 end-0 px-3 text-stone-500 hover:text-brand-600">
          <Search size={16} />
        </button>
      </form>

      <div className="space-y-5">
        <FilterGroup label={t('category_filter')}>
          <RadioOption value="all" current={currentCat} onChange={(v) => updateFilter('categorie', v)} label={t('all')} />
          {categories.map((c) => (
            <RadioOption key={c.id} value={String(c.id)} current={currentCat} onChange={(v) => updateFilter('categorie', v)} label={c.nom} count={c.books_count} />
          ))}
        </FilterGroup>

        <FilterGroup label={t('language_filter')}>
          <RadioOption value="all" current={currentLang} onChange={(v) => updateFilter('langue', v)} label={t('all')} />
          {(['ar', 'fr', 'en'] as const).map((l) => (
            <RadioOption key={l} value={l} current={currentLang} onChange={(v) => updateFilter('langue', v)} label={tBook(`languages.${l}`)} />
          ))}
        </FilterGroup>

        <FilterGroup label={t('availability')}>
          <RadioOption value="all" current={currentAvail} onChange={(v) => updateFilter('disponible', v)} label={t('availability_options.all')} />
          <RadioOption value="true" current={currentAvail} onChange={(v) => updateFilter('disponible', v)} label={t('availability_options.available')} dot="bg-brand-500" />
          <RadioOption value="false" current={currentAvail} onChange={(v) => updateFilter('disponible', v)} label={t('availability_options.borrowed')} dot="bg-coral-500" />
        </FilterGroup>

        <FilterGroup label={t('sort')}>
          <RadioOption value="recent" current={currentTri} onChange={(v) => updateFilter('tri', v)} label={t('sort_options.recent')} />
          <RadioOption value="populaire" current={currentTri} onChange={(v) => updateFilter('tri', v)} label={t('sort_options.popular')} />
          <RadioOption value="alpha" current={currentTri} onChange={(v) => updateFilter('tri', v)} label={t('sort_options.alpha')} />
        </FilterGroup>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">{label}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function RadioOption({
  value,
  current,
  onChange,
  label,
  count,
  dot,
}: {
  value: string;
  current: string;
  onChange: (v: string) => void;
  label: string;
  count?: number;
  dot?: string;
}) {
  const isActive = current === value;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={isActive}
      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm text-start transition ${isActive ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-stone-600 hover:bg-stone-50'}`}
    >
      <span className="flex items-center gap-2 truncate">
        {dot ? (
          <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />
        ) : (
          <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${isActive ? 'border-brand-600 bg-brand-600' : 'border-stone-300'}`}>
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </span>
        )}
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined && <span className="text-xs text-stone-400 shrink-0">{count}</span>}
    </button>
  );
}
