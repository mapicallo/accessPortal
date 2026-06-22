const DEFAULT_DEV_PWA_URL = 'http://localhost:4173/';
const DEFAULT_PROD_PWA_URL = 'https://www.ai4context.com/web-extensions/access-portal/';
const PWA_URL_STORAGE_KEY = 'ap_pwa_base_url';

export const ALLOWED_PWA_ORIGINS = [
  'http://localhost:4173',
  'http://127.0.0.1:4173',
  'https://www.ai4context.com',
];

function isDevExtension(): boolean {
  try {
    return !('update_url' in chrome.runtime.getManifest());
  } catch {
    return true;
  }
}

export function defaultPwaUrl(): string {
  return isDevExtension() ? DEFAULT_DEV_PWA_URL : DEFAULT_PROD_PWA_URL;
}

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
  return defaultPwaUrl();
}

export function normalizePwaUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return defaultPwaUrl();
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

export function isLocalDevPwaUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
}

/** Bypass browser disk cache after `npm run build` during local preview. */
export function withCacheBust(url: string): string {
  const normalized = normalizePwaUrl(url);
  const parsed = new URL(normalized);
  parsed.searchParams.set('ap_bust', String(Date.now()));
  return parsed.toString();
}

/** Lightweight reachability check without opening a tab. */
export async function checkPwaHttpReachable(pwaUrl: string): Promise<boolean> {
  try {
    const res = await fetch(pwaUrl, { method: 'GET', cache: 'no-store' });
    return res.ok;
  } catch {
    return false;
  }
}
