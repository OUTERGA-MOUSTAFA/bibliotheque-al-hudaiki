'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { usePathname } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { X, SlidersHorizontal } from 'lucide-react';
import type { Category } from '@/types';

export default function BookFilters({ categories }: { categories: Category[] }) {
  const t = useTranslations('catalog');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value && value !== 'all') newParams.set(key, value);
    else newParams.delete(key);
    newParams.delete('page');
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const clearAll = () => router.push(pathname);

  const currentCat = params.get('categorie') || 'all';
  const currentLang = params.get('langue') || 'all';
  const currentAvail = params.get('disponible') || 'all';
  const currentTri = params.get('tri') || 'recent';

  const hasFilters =
    currentCat !== 'all' ||
    currentLang !== 'all' ||
    currentAvail !== 'all' ||
    currentTri !== 'recent' ||
    params.has('q');

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <SlidersHorizontal size={16} className="text-brand-600" />
          </div>
          <h2 className="font-bold text-stone-900">{t('filters')}</h2>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-semibold text-coral-600 hover:text-coral-700 flex items-center gap-1"
          >
            <X size={12} />
            مسح
          </button>
        )}
      </div>

      <div className="space-y-5">
        {/* Catégorie */}
        <FilterGroup label={t('category_filter')}>
          <RadioOption
            name="categorie"
            value="all"
            current={currentCat}
            onChange={(v) => updateFilter('categorie', v)}
            label="الكل"
          />
          {categories.map((c) => (
            <RadioOption
              key={c.id}
              name="categorie"
              value={String(c.id)}
              current={currentCat}
              onChange={(v) => updateFilter('categorie', v)}
              label={c.nom}
              count={c.books_count}
            />
          ))}
        </FilterGroup>

        {/* Langue */}
        <FilterGroup label={t('language_filter')}>
          <RadioOption
            name="langue"
            value="all"
            current={currentLang}
            onChange={(v) => updateFilter('langue', v)}
            label="الكل"
          />
          <RadioOption
            name="langue"
            value="ar"
            current={currentLang}
            onChange={(v) => updateFilter('langue', v)}
            label="العربية"
          />
          <RadioOption
            name="langue"
            value="fr"
            current={currentLang}
            onChange={(v) => updateFilter('langue', v)}
            label="Français"
          />
          <RadioOption
            name="langue"
            value="en"
            current={currentLang}
            onChange={(v) => updateFilter('langue', v)}
            label="English"
          />
        </FilterGroup>

        {/* Disponibilité */}
        <FilterGroup label={t('availability')}>
          <RadioOption
            name="disponible"
            value="all"
            current={currentAvail}
            onChange={(v) => updateFilter('disponible', v)}
            label={t('availability_options.all')}
          />
          <RadioOption
            name="disponible"
            value="true"
            current={currentAvail}
            onChange={(v) => updateFilter('disponible', v)}
            label={t('availability_options.available')}
            dot="bg-brand-500"
          />
          <RadioOption
            name="disponible"
            value="false"
            current={currentAvail}
            onChange={(v) => updateFilter('disponible', v)}
            label={t('availability_options.borrowed')}
            dot="bg-coral-500"
          />
        </FilterGroup>

        {/* Tri */}
        <FilterGroup label={t('sort')}>
          <RadioOption
            name="tri"
            value="recent"
            current={currentTri}
            onChange={(v) => updateFilter('tri', v)}
            label={t('sort_options.recent')}
          />
          <RadioOption
            name="tri"
            value="populaire"
            current={currentTri}
            onChange={(v) => updateFilter('tri', v)}
            label={t('sort_options.popular')}
          />
          <RadioOption
            name="tri"
            value="alpha"
            current={currentTri}
            onChange={(v) => updateFilter('tri', v)}
            label={t('sort_options.alpha')}
          />
        </FilterGroup>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
        {label}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function RadioOption({
  name,
  value,
  current,
  onChange,
  label,
  count,
  dot,
}: {
  name: string;
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
      onClick={() => onChange(value)}
      className={`
        w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm text-start transition
        ${isActive
          ? 'bg-brand-50 text-brand-700 font-semibold'
          : 'text-stone-600 hover:bg-stone-50'
        }
      `}
    >
      <span className="flex items-center gap-2 truncate">
        {dot && <span className={`w-2 h-2 rounded-full ${dot} shrink-0`} />}
        {!dot && (
          <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${isActive ? 'border-brand-600 bg-brand-600' : 'border-stone-300'}`}>
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
          </span>
        )}
        <span className="truncate">{label}</span>
      </span>
      {count !== undefined && (
        <span className="text-xs text-stone-400 shrink-0">{count}</span>
      )}
    </button>
  );
}