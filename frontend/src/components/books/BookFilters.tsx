'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { usePathname } from '@/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';
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

  const hasFilters =
    params.has('q') ||
    params.has('categorie') ||
    params.has('langue') ||
    params.has('disponible') ||
    params.has('tri');

  return (
    <div className="space-y-6 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`font-bold text-lg text-stone-900 ${locale === 'ar' ? 'font-arabic-tech' : ''}`}>
          {t('filters')}
        </h2>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
          >
            <X size={14} />
            {t('clear_filters')}
          </Button>
        )}
      </div>

      {/* Catégorie */}
      <div className="space-y-2">
        <Label className="text-stone-700">{t('category_filter')}</Label>
        <Select
          value={params.get('categorie') || 'all'}
          onValueChange={(v) => updateFilter('categorie', v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('availability_options.all')}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Langue */}
      <div className="space-y-2">
        <Label className="text-stone-700">{t('language_filter')}</Label>
        <Select
          value={params.get('langue') || 'all'}
          onValueChange={(v) => updateFilter('langue', v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('availability_options.all')}</SelectItem>
            <SelectItem value="ar">العربية</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Disponibilité */}
      <div className="space-y-2">
        <Label className="text-stone-700">{t('availability')}</Label>
        <Select
          value={params.get('disponible') || 'all'}
          onValueChange={(v) => updateFilter('disponible', v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('availability_options.all')}</SelectItem>
            <SelectItem value="true">{t('availability_options.available')}</SelectItem>
            <SelectItem value="false">{t('availability_options.borrowed')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tri */}
      <div className="space-y-2">
        <Label className="text-stone-700">{t('sort')}</Label>
        <Select
          value={params.get('tri') || 'recent'}
          onValueChange={(v) => updateFilter('tri', v)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">{t('sort_options.recent')}</SelectItem>
            <SelectItem value="populaire">{t('sort_options.popular')}</SelectItem>
            <SelectItem value="alpha">{t('sort_options.alpha')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}