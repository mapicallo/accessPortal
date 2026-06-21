import {
  BRIDGE_LOCAL_KEY,
  IMPORT_STORAGE_KEY,
  type ExtensionImportPayload,
} from './importPayload.js';
import { isAllowedPwaUrl, normalizePwaUrl, resolvePwaUrl } from './pwaUrl.js';

function sessionLike(): chrome.storage.StorageArea {
  return chrome.storage.session ?? chrome.storage.local;
}

const PWA_TAB_SESSION_KEY = 'ap_pwa_tab_id';

export type OpenPwaResult =
  | { ok: true; tab: chrome.tabs.Tab }
  | { ok: false; error: 'pwa_unreachable' | 'pwa_tab_failed'; pwaUrl: string };

async function waitForTabSettled(tabId: number, attempts = 16): Promise<chrome.tabs.Tab | null> {
  for (let i = 0; i < attempts; i++) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.status === 'complete') return tab;
    } catch {
      return null;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  try {
    return await chrome.tabs.get(tabId);
  } catch {
    return null;
  }
}

export async function verifyPwaTabReachable(tabId: number, pwaUrl: string): Promise<boolean> {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.url?.startsWith('chrome-error:')) return false;

    const origin = new URL(pwaUrl).origin;
    if (!tab.url?.startsWith(origin)) return false;

    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => Boolean(document.getElementById('app')),
    });
    return results[0]?.result === true;
  } catch {
    return false;
  }
}

export async function openOrFocusPwaTab(url?: string): Promise<chrome.tabs.Tab | undefined> {
  const pwaUrl = normalizePwaUrl(url ?? (await resolvePwaUrl()));

  try {
    const stored = await sessionLike().get(PWA_TAB_SESSION_KEY);
    const tabId = stored[PWA_TAB_SESSION_KEY] as number | undefined;
    if (typeof tabId === 'number') {
      try {
        const tab = await chrome.tabs.get(tabId);
        if (tab.id != null && tab.url?.startsWith(new URL(pwaUrl).origin)) {
          if (await verifyPwaTabReachable(tab.id, pwaUrl)) {
            await chrome.tabs.update(tab.id, { active: true });
            if (tab.windowId !== undefined) {
              await chrome.windows.update(tab.windowId, { focused: true });
            }
            return tab;
          }
          await sessionLike().remove(PWA_TAB_SESSION_KEY);
        }
      } catch {
        await sessionLike().remove(PWA_TAB_SESSION_KEY);
      }
    }
  } catch {
    /* ignore */
  }

  const tab = await chrome.tabs.create({ url: pwaUrl, active: true });
  if (tab.id != null) {
    await sessionLike().set({ [PWA_TAB_SESSION_KEY]: tab.id });
  }
  return tab;
}

export async function openOrVerifyPwaTab(url?: string): Promise<OpenPwaResult> {
  const pwaUrl = normalizePwaUrl(url ?? (await resolvePwaUrl()));
  const tab = await openOrFocusPwaTab(pwaUrl);
  if (!tab?.id) {
    return { ok: false, error: 'pwa_tab_failed', pwaUrl };
  }

  await waitForTabSettled(tab.id);
  const reachable = await verifyPwaTabReachable(tab.id, pwaUrl);
  if (!reachable) {
    return { ok: false, error: 'pwa_unreachable', pwaUrl };
  }

  return { ok: true, tab };
}

async function waitForTabComplete(tabId: number, attempts = 12): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const tab = await chrome.tabs.get(tabId);
      if (tab.status === 'complete') return true;
    } catch {
      return false;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

export async function injectImportIntoPwaTab(
  tabId: number,
  payload: ExtensionImportPayload,
): Promise<void> {
  await waitForTabComplete(tabId);

  await chrome.scripting.executeScript({
    target: { tabId },
    func: (data: ExtensionImportPayload, storageKey: string) => {
      localStorage.setItem(storageKey, JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('accessportal-import'));
    },
    args: [payload, BRIDGE_LOCAL_KEY],
  });
}

export async function deliverImportToPwa(payload: ExtensionImportPayload): Promise<void> {
  await chrome.storage.local.set({ [IMPORT_STORAGE_KEY]: payload });

  const pwaUrl = await resolvePwaUrl();
  if (!isAllowedPwaUrl(pwaUrl)) {
    throw new Error('PWA_URL_NOT_ALLOWED');
  }

  const opened = await openOrVerifyPwaTab(pwaUrl);
  if (!opened.ok) {
    throw new Error(opened.error);
  }
  const tab = opened.tab;

  try {
    await injectImportIntoPwaTab(tab.id, payload);
  } catch (err) {
    console.warn('[AccessPortal] import inject failed, PWA may fetch via runtime message', err);
  }
}

export async function readPendingImport(): Promise<ExtensionImportPayload | null> {
  const data = await chrome.storage.local.get(IMPORT_STORAGE_KEY);
  const payload = data[IMPORT_STORAGE_KEY];
  if (!payload || typeof payload !== 'object') return null;
  return payload as ExtensionImportPayload;
}

export async function clearPendingImport(): Promise<void> {
  await chrome.storage.local.remove(IMPORT_STORAGE_KEY);
}
