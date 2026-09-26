export const CATEGORY_COLORS = {
  emerald: { bg: 'bg-brand-100',   text: 'text-brand-700',   border: 'border-brand-200' },
  gold:    { bg: 'bg-gold-100',    text: 'text-gold-700',    border: 'border-gold-200' },
  coral:   { bg: 'bg-coral-100',   text: 'text-coral-700',   border: 'border-coral-200' },
  sky:     { bg: 'bg-sky-100',     text: 'text-sky-700',     border: 'border-sky-200' },
  violet:  { bg: 'bg-violet-100',  text: 'text-violet-700',  border: 'border-violet-200' },
  rose:    { bg: 'bg-rose-100',    text: 'text-rose-700',    border: 'border-rose-200' },
} as const;

export type CategoryColor = keyof typeof CATEGORY_COLORS;

export const CATEGORY_COLOR_MAP: Record<string, CategoryColor> = {
  'adab-arabi':     'emerald',
  'adab-faransi':   'sky',
  'kotob-atfal':    'gold',
  'tarikh':         'coral',
  'oloum':          'sky',
  'falsafa':        'violet',
  'din':            'emerald',
  'tanmiya-datiya': 'rose',
};

export function getCategoryColor(slug?: string): CategoryColor {
  return CATEGORY_COLOR_MAP[slug || ''] || 'emerald';
}