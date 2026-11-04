// Formats d'affichage qui suivent la langue choisie (ar-MA : chiffres latins, comme au Maroc)
export const intlLocale = (locale: string) => (locale === 'ar' ? 'ar-MA' : 'fr-FR');

export function formatDate(value: string | Date | null | undefined, locale: string, options: Intl.DateTimeFormatOptions = {}) {
  if (!value) return '—';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(intlLocale(locale), { dateStyle: 'medium', ...options }).format(date);
}
