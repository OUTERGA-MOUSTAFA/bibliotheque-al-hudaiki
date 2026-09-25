'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { usePathname } from '@/navigation';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { Category } from '@/types';

export default function BookFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    newParams.delete('page'); // reset pagination
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const clearAll = () => router.push(pathname);

  return (
    <div className="space-y-6 sticky top-20">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-stone-900">Filtres</h2>
        <Button variant="ghost" size="sm" onClick={clearAll}>
          Effacer
        </Button>
      </div>

      {/* Catégorie */}
      <div>
        <Label className="mb-2 block">Catégorie</Label>
        <select
          value={params.get('categorie') || ''}
          onChange={(e) => updateFilter('categorie', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Toutes</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.nom}</option>
          ))}
        </select>
      </div>

      {/* Langue */}
      <div>
        <Label className="mb-2 block">Langue</Label>
        <select
          value={params.get('langue') || ''}
          onChange={(e) => updateFilter('langue', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Toutes</option>
          <option value="fr">Français</option>
          <option value="ar">العربية</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Disponibilité */}
      <div>
        <Label className="mb-2 block">Disponibilité</Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="disponible"
              checked={params.get('disponible') === '' || !params.get('disponible')}
              onChange={() => updateFilter('disponible', '')}
            />
            <span className="text-sm">Tous</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="disponible"
              checked={params.get('disponible') === 'true'}
              onChange={() => updateFilter('disponible', 'true')}
            />
            <span className="text-sm">Disponible</span>
          </label>
        </div>
      </div>

      {/* Tri */}
      <div>
        <Label className="mb-2 block">Trier par</Label>
        <select
          value={params.get('tri') || 'recent'}
          onChange={(e) => updateFilter('tri', e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="recent">Nouveautés</option>
          <option value="populaire">Popularité</option>
          <option value="alpha">Alphabétique</option>
        </select>
      </div>
    </div>
  );
}