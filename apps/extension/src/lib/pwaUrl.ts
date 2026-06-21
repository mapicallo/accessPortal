const DEFAULT_PWA_URL = 'http://localhost:4173/';
const PWA_URL_STORAGE_KEY = 'ap_pwa_base_url';

export const ALLOWED_PWA_ORIGINS = [
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://www.ai4context.com',
];

export async function resolvePwaUrl(): Promise<string> {
  try {
    const stored = await chrome.storage.sync.get(PWA_URL_STORAGE_KEY);
    const url = stored[PWA_URL_STORAGE_KEY];
    if (typeof url === 'string' && url.trim()) {
      return normalizePwaUrl(url);
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_PWA_URL;
}

export function normalizePwaUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return DEFAULT_PWA_URL;
  return trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
}

export function isAllowedPwaUrl(url: string): boolean {
  try {
    const origin = new URL(url).origin;
    return ALLOWED_PWA_ORIGINS.some((allowed) => origin === allowed || origin.startsWith(allowed));
  } catch {
    return false;
  }
}
