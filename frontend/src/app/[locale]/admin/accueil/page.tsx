'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  Loader2, Plus, Pencil, Trash2, ArrowUp, ArrowDown, Eye, EyeOff, ExternalLink, ImagePlus, Check, LayoutTemplate,
} from 'lucide-react';
import { api, apiErrorMessage } from '@/lib/api';
import { Link } from '@/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AdminHeroSlide, HeroModele, HeroReglages } from '@/types';

const MODELES: HeroModele[] = ['classique', 'carrousel', 'image'];
const VITESSES = [4, 5, 6, 8, 10, 12, 15];

type Langue = 'fr' | 'ar';
type Textes = { badge: string; titre: string; sous_titre: string; bouton: string };
type FormState = { image: string; fichier: File | null; lien: string; actif: boolean; fr: Textes; ar: Textes };

const textesVides: Textes = { badge: '', titre: '', sous_titre: '', bouton: '' };
const FORM_VIDE: FormState = { image: '', fichier: null, lien: '', actif: true, fr: { ...textesVides }, ar: { ...textesVides } };

const versForm = (s: AdminHeroSlide): FormState => ({
  image: s.image,
  fichier: null,
  lien: s.lien ?? '',
  actif: s.actif,
  fr: { badge: s.badge_fr ?? '', titre: s.titre_fr ?? '', sous_titre: s.sous_titre_fr ?? '', bouton: s.bouton_fr ?? '' },
  ar: { badge: s.badge_ar ?? '', titre: s.titre_ar ?? '', sous_titre: s.sous_titre_ar ?? '', bouton: s.bouton_ar ?? '' },
});

export default function AdminAccueilPage() {
  const t = useTranslations('admin');
  const [reglages, setReglages] = useState<HeroReglages | null>(null);
  const [slides, setSlides] = useState<AdminHeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AdminHeroSlide | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const charger = useCallback(() => {
    api.get<{ reglages: HeroReglages; slides: AdminHeroSlide[] }>('/admin/hero')
      .then(({ data }) => { setReglages(data.reglages); setSlides(data.slides); })
      .catch((err) => toast.error(apiErrorMessage(err, t('load_error'))))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => { charger(); }, [charger]);

  const enregistrerReglages = async (patch: Partial<HeroReglages>) => {
    if (!reglages) return;
    const avant = reglages;
    setReglages({ ...reglages, ...patch }); // affichage immédiat
    try {
      const { data } = await api.put<HeroReglages>('/admin/hero/settings', patch);
      setReglages(data);
      toast.success(t('hero_saved_settings'));
    } catch (err) {
      setReglages(avant);
      toast.error(apiErrorMessage(err, t('save_error')));
    }
  };

  const deplacer = async (i: number, sens: -1 | 1) => {
    const j = i + sens;
    if (j < 0 || j >= slides.length) return;
    const nouvelOrdre = [...slides];
    [nouvelOrdre[i], nouvelOrdre[j]] = [nouvelOrdre[j], nouvelOrdre[i]];
    setSlides(nouvelOrdre);
    try {
      await api.post('/admin/hero/slides/reorder', { ids: nouvelOrdre.map((s) => s.id) });
    } catch (err) {
      toast.error(apiErrorMessage(err, t('save_error')));
      charger();
    }
  };

  const basculerVisible = async (s: AdminHeroSlide) => {
    try {
      await api.put(`/admin/hero/slides/${s.id}`, { actif: !s.actif });
      setSlides((list) => list.map((x) => (x.id === s.id ? { ...x, actif: !s.actif } : x)));
    } catch (err) {
      toast.error(apiErrorMessage(err, t('save_error')));
    }
  };

  const supprimer = async (s: AdminHeroSlide) => {
    if (!confirm(t('hero_confirm_delete'))) return;
    try {
      await api.delete(`/admin/hero/slides/${s.id}`);
      toast.success(t('deleted'));
      setSlides((list) => list.filter((x) => x.id !== s.id));
    } catch (err) {
      toast.error(apiErrorMessage(err, t('delete_error')));
    }
  };

  if (loading || !reglages) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-brand-600" /></div>;
  }

  const visibles = slides.filter((s) => s.actif).length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 mb-1">{t('home_page')}</h1>
          <p className="text-stone-500 text-sm max-w-2xl">{t('hero_hint')}</p>
        </div>
        <Link href="/" target="_blank" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline">
          <ExternalLink size={16} /> {t('hero_preview')}
        </Link>
      </div>

      {/* ── Modèle d'affichage ── */}
      <section className="bg-white rounded-2xl shadow-soft border border-stone-200 p-6">
        <h2 className="font-bold text-stone-900 mb-4 flex items-center gap-2"><LayoutTemplate size={18} /> {t('hero_layout')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="radiogroup" aria-label={t('hero_layout')}>
          {MODELES.map((m) => {
            const choisi = reglages.modele === m;
            return (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={choisi}
                onClick={() => !choisi && enregistrerReglages({ modele: m })}
                className={`relative text-start rounded-2xl border-2 p-3 transition ${choisi ? 'border-brand-600 bg-brand-50/50' : 'border-stone-200 hover:border-stone-300'}`}
              >
                {choisi && (
                  <span className="absolute top-3 end-3 w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center"><Check size={14} /></span>
                )}
                <ApercuModele modele={m} />
                <div className="mt-3 font-semibold text-stone-900">{t(`layout_${m}`)}</div>
                <div className="text-xs text-stone-500 mt-0.5">{t(`layout_${m}_desc`)}</div>
              </button>
            );
          })}
        </div>

        {reglages.modele !== 'classique' && visibles === 0 && (
          <p className="mt-4 text-sm text-gold-800 bg-gold-50 border border-gold-200 rounded-xl px-4 py-3">{t('hero_needs_slide')}</p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-6">
          {reglages.modele !== 'classique' && (
            <label className="flex items-center gap-3 text-sm text-stone-700">
              {t('hero_speed')}
              <select
                value={reglages.defilement}
                onChange={(e) => enregistrerReglages({ defilement: Number(e.target.value) })}
                className="h-9 px-3 border border-stone-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {VITESSES.map((v) => <option key={v} value={v}>{t('hero_seconds', { count: v })}</option>)}
              </select>
            </label>
          )}
          {reglages.modele === 'classique' && (
            <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
              <input type="checkbox" checked={reglages.afficher_stats} onChange={(e) => enregistrerReglages({ afficher_stats: e.target.checked })} className="h-4 w-4 accent-brand-600" />
              {t('hero_stats')}
            </label>
          )}
        </div>
      </section>

      {/* ── Diapositives ── */}
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <div>
            <h2 className="font-bold text-stone-900">{t('hero_slides')}</h2>
            <p className="text-sm text-stone-500">{t('hero_slides_hint')}</p>
          </div>
          <Button onClick={() => { setEditing(null); setFormOpen(true); }} className="bg-brand-600 hover:bg-brand-700 rounded-xl">
            <Plus size={16} /> {t('hero_add_slide')}
          </Button>
        </div>

        {slides.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-300 p-12 text-center text-stone-500">
            <ImagePlus className="mx-auto mb-3 text-stone-300" size={40} />
            {t('hero_no_slides')}
          </div>
        ) : (
          <ul className="space-y-3">
            {slides.map((s, i) => (
              <li key={s.id} className={`bg-white rounded-2xl border border-stone-200 shadow-soft p-3 flex flex-col sm:flex-row gap-4 ${s.actif ? '' : 'opacity-60'}`}>
                <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <Image src={s.image} alt="" fill sizes="192px" unoptimized className="object-cover" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.actif ? 'bg-brand-50 text-brand-700' : 'bg-stone-100 text-stone-600'}`}>
                      {s.actif ? t('hero_visible_badge') : t('hero_hidden')}
                    </span>
                    {!s.titre_fr && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-50 text-gold-700">{t('hero_missing_fr')}</span>}
                    {!s.titre_ar && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gold-50 text-gold-700">{t('hero_missing_ar')}</span>}
                  </div>
                  <p className="font-semibold text-stone-900 truncate" lang="fr" dir="ltr">{s.titre_fr || '—'}</p>
                  <p className="font-semibold text-stone-700 truncate" lang="ar" dir="rtl">{s.titre_ar || '—'}</p>
                  {s.lien && <p className="text-xs text-stone-500 truncate" dir="ltr">↳ {s.lien}</p>}
                </div>
                <div className="flex sm:flex-col flex-wrap gap-1 justify-end shrink-0">
                  <IconButton label={t('hero_move_up')} onClick={() => deplacer(i, -1)} disabled={i === 0}><ArrowUp size={15} /></IconButton>
                  <IconButton label={t('hero_move_down')} onClick={() => deplacer(i, 1)} disabled={i === slides.length - 1}><ArrowDown size={15} /></IconButton>
                  <IconButton label={s.actif ? t('hero_hide') : t('hero_show')} onClick={() => basculerVisible(s)}>{s.actif ? <EyeOff size={15} /> : <Eye size={15} />}</IconButton>
                  <IconButton label={t('edit')} onClick={() => { setEditing(s); setFormOpen(true); }}><Pencil size={15} /></IconButton>
                  <IconButton label={t('delete')} onClick={() => supprimer(s)} danger><Trash2 size={15} /></IconButton>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {formOpen && (
        <SlideForm
          slide={editing}
          onClose={() => setFormOpen(false)}
          onSaved={() => { setFormOpen(false); charger(); }}
        />
      )}
    </div>
  );
}

function IconButton({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={`w-9 h-9 rounded-lg flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed ${danger ? 'text-coral-600 hover:bg-coral-50' : 'text-stone-600 hover:bg-sand'}`}
    >
      {children}
    </button>
  );
}

// Schéma miniature de chaque modèle, pour choisir sans avoir à imaginer le rendu
function ApercuModele({ modele }: { modele: HeroModele }) {
  const ligne = (w: string, c = 'bg-white/80') => <div className={`h-1.5 rounded-full ${c} ${w}`} />;
  if (modele === 'carrousel') {
    return (
      <div className="aspect-video rounded-xl bg-gradient-to-br from-stone-500 to-stone-800 relative overflow-hidden p-3 flex flex-col justify-center gap-1.5" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-r rtl:bg-gradient-to-l from-black/60 to-transparent" />
        <div className="relative space-y-1.5">{ligne('w-1/2', 'bg-white')}{ligne('w-2/5', 'bg-white')}{ligne('w-1/3', 'bg-white/60')}<div className="h-3 w-10 rounded bg-white mt-2" /></div>
        <div className="absolute bottom-2 inset-x-3 flex gap-1.5">{[0, 1, 2, 3].map((k) => <div key={k} className={`h-0.5 flex-1 ${k === 0 ? 'bg-white' : 'bg-white/40'}`} />)}</div>
      </div>
    );
  }
  if (modele === 'image') {
    return (
      <div className="aspect-video rounded-xl bg-cream border border-stone-200 p-3 grid grid-cols-2 gap-2 items-center" aria-hidden>
        <div className="space-y-1.5">{ligne('w-1/2', 'bg-brand-200')}{ligne('w-full', 'bg-stone-800')}{ligne('w-4/5', 'bg-stone-800')}{ligne('w-3/4', 'bg-stone-300')}<div className="h-3 w-10 rounded bg-brand-600 mt-2" /></div>
        <div className="h-full rounded-lg bg-gradient-to-br from-brand-300 to-gold-300" />
      </div>
    );
  }
  return (
    <div className="aspect-video rounded-xl bg-night p-3 flex flex-col items-center justify-center gap-1.5" aria-hidden>
      {ligne('w-1/4', 'bg-gold-400/70')}{ligne('w-2/3', 'bg-white')}{ligne('w-1/2', 'bg-white')}{ligne('w-1/3', 'bg-white/50')}
      <div className="flex gap-1 mt-1"><div className="h-3 w-8 rounded-full bg-brand-500" /><div className="h-3 w-8 rounded-full border border-white/40" /></div>
    </div>
  );
}

function SlideForm({ slide, onClose, onSaved }: { slide: AdminHeroSlide | null; onClose: () => void; onSaved: () => void }) {
  const t = useTranslations('admin');
  const [form, setForm] = useState<FormState>(slide ? versForm(slide) : FORM_VIDE);
  const [apercu, setApercu] = useState<string>(slide?.image ?? '');
  const [saving, setSaving] = useState(false);

  const choisirFichier = (f: File | undefined) => {
    if (!f) return;
    setForm((s) => ({ ...s, fichier: f }));
    setApercu(URL.createObjectURL(f));
  };

  const majTexte = (langue: Langue, champ: keyof Textes, valeur: string) =>
    setForm((s) => ({ ...s, [langue]: { ...s[langue], [champ]: valeur } }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // multipart pour pouvoir envoyer l'image ; _method=PUT car PHP ne lit pas le multipart en PUT
    const data = new FormData();
    if (form.fichier) data.append('image_file', form.fichier);
    else if (form.image) data.append('image', form.image);
    (['fr', 'ar'] as Langue[]).forEach((l) =>
      (Object.keys(textesVides) as (keyof Textes)[]).forEach((c) => data.append(`${c}_${l}`, form[l][c].trim())));
    data.append('lien', form.lien.trim());
    data.append('actif', form.actif ? '1' : '0');
    if (slide) data.append('_method', 'PUT');

    try {
      await api.post(slide ? `/admin/hero/slides/${slide.id}` : '/admin/hero/slides', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(t('saved'));
      onSaved();
    } catch (err) {
      toast.error(apiErrorMessage(err, t('save_error')));
    } finally {
      setSaving(false);
    }
  };

  const champ = 'w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-sm" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true"
        className="w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-stone-900">{slide ? t('hero_edit_slide') : t('hero_add_slide')}</h2>

        {/* Image */}
        <div className="grid sm:grid-cols-[1fr_1.2fr] gap-4 items-start">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
            {apercu
              ? <Image src={apercu} alt="" fill sizes="400px" unoptimized className="object-cover" />
              : <div className="absolute inset-0 flex items-center justify-center text-stone-400"><ImagePlus size={36} /></div>}
          </div>
          <div className="space-y-3">
            <Label>{t('hero_image')} *</Label>
            <label className="cursor-pointer flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 hover:border-brand-500 hover:bg-brand-50/40 px-4 py-4 text-sm font-medium text-stone-700 transition">
              <ImagePlus size={18} /> {form.fichier ? form.fichier.name : t('hero_image_upload')}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => choisirFichier(e.target.files?.[0])} />
            </label>
            <Input
              type="url"
              dir="ltr"
              placeholder={t('hero_image_url')}
              value={form.fichier ? '' : form.image}
              disabled={!!form.fichier}
              onChange={(e) => { setForm({ ...form, image: e.target.value }); setApercu(e.target.value); }}
            />
            <p className="text-xs text-stone-500">{t('hero_image_hint')}</p>
          </div>
        </div>

        {/* Textes dans les deux langues, côte à côte */}
        <div className="grid md:grid-cols-2 gap-5">
          {(['fr', 'ar'] as Langue[]).map((l) => (
            <fieldset key={l} lang={l} dir={l === 'ar' ? 'rtl' : 'ltr'} className="rounded-xl border border-stone-200 p-4 space-y-3">
              <legend className="px-2 text-sm font-bold text-stone-900">{l === 'fr' ? t('hero_french') : t('hero_arabic')}</legend>
              <div className="space-y-1">
                <Label htmlFor={`badge-${l}`}>{t('hero_badge')}</Label>
                <Input id={`badge-${l}`} maxLength={255} value={form[l].badge} onChange={(e) => majTexte(l, 'badge', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`titre-${l}`}>{t('hero_title_field')}</Label>
                <Input id={`titre-${l}`} maxLength={255} value={form[l].titre} onChange={(e) => majTexte(l, 'titre', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`sous-${l}`}>{t('hero_subtitle_field')}</Label>
                <textarea id={`sous-${l}`} rows={3} maxLength={600} className={champ} value={form[l].sous_titre} onChange={(e) => majTexte(l, 'sous_titre', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`bouton-${l}`}>{t('hero_button')}</Label>
                <Input id={`bouton-${l}`} maxLength={60} value={form[l].bouton} onChange={(e) => majTexte(l, 'bouton', e.target.value)} />
              </div>
            </fieldset>
          ))}
        </div>

        <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-end">
          <div className="space-y-1">
            <Label htmlFor="lien">{t('hero_link')}</Label>
            <Input id="lien" dir="ltr" placeholder="/catalogue" value={form.lien} onChange={(e) => setForm({ ...form, lien: e.target.value })} />
            <p className="text-xs text-stone-500">{t('hero_link_hint')}</p>
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer pb-7">
            <input type="checkbox" checked={form.actif} onChange={(e) => setForm({ ...form, actif: e.target.checked })} className="h-4 w-4 accent-brand-600" />
            {t('hero_visible')}
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
          <Button type="button" variant="outline" onClick={onClose}>{t('cancel')}</Button>
          <Button type="submit" disabled={saving || (!form.fichier && !form.image)} className="bg-brand-600 hover:bg-brand-700">
            {saving ? <Loader2 size={16} className="animate-spin" /> : t('save')}
          </Button>
        </div>
      </form>
    </div>
  );
}
