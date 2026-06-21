import type { Locale } from './storage.js';

/** Opens bundled privacy policy in a new tab. */
export function openPrivacyPolicy(locale: Locale): void {
  const url = new URL('./privacy.html', window.location.href);
  url.searchParams.set('lang', locale);
  window.open(url.toString(), '_blank', 'noopener,noreferrer');
}

export function privacyPolicyUrl(locale: Locale): string {
  const url = new URL('./privacy.html', window.location.href);
  url.searchParams.set('lang', locale);
  return url.toString();
}
