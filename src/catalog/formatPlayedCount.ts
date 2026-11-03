import type { LanguageCode } from '../i18n/translations.ts';

export function formatPlayedCount(count: number | null, locale: LanguageCode = 'en'): string | null {
  if (count === null || !Number.isInteger(count) || count < 0) return null;
  if (count < 1000) return String(count);
  if (locale === 'ja' || locale === 'ko') {
    const units = locale === 'ja' ? ['千', '万', '億'] : ['천', '만', '억'];
    if (count < 10000) return `${Math.floor(count / 1000)}${units[0]}`;
    if (count < 100000000) return `${Math.floor(count / 10000)}${units[1]}`;
    return `${Math.floor(count / 100000000)}${units[2]}`;
  }
  const units: Record<Exclude<LanguageCode, 'ja' | 'ko'>, [string, string, string]> = {
    en: ['K', 'M', 'B'], fr: ['k', 'M', 'Md'], es: ['mil', 'M', 'mil M'], ru: ['тыс.', 'млн', 'млрд'], de: ['Tsd.', 'Mio.', 'Mrd.'],
  };
  const labels = units[locale];
  if (count < 1000000) return `${Math.floor(count / 1000)}${labels[0]}`;
  if (count < 1000000000) return `${Math.floor(count / 1000000)}${labels[1]}`;
  return `${Math.floor(count / 1000000000)}${labels[2]}`;
}
