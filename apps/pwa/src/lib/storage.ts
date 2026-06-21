export type Locale = 'en' | 'es';

const LOCALE_KEY = 'accessportal-locale';

export function loadLocale(): Locale {
  try {
    const v = localStorage.getItem(LOCALE_KEY);
    return v === 'es' ? 'es' : 'en';
  } catch {
    return 'en';
  }
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_KEY, locale);
  } catch {
    /* ignore */
  }
}
