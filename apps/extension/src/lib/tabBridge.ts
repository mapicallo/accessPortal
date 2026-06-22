import {
  BRIDGE_LOCAL_KEY,
  IMPORT_STORAGE_KEY,
  type ExtensionImportPayload,
} from './importPayload.js';
import { checkPwaHttpReachable, isAllowedPwaUrl, isLocalDevPwaUrl, normalizePwaUrl, resolvePwaUrl, withCacheBust } from './pwaUrl.js';

function sessionLike(): chrome.storage.StorageArea {
  return chrome.storage.session ?? chrome.storage.local;
}

const PWA_TAB_SESSION_KEY = 'ap_pwa_tab_id';
const PANEL_WINDOW_SESSION_KEY = 'ap_panel_window_id';

export type OpenPwaResult =
  | { ok: true; tab: chrome.tabs.Tab; createdNewTab: boolean }
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
      func: () =>
        Boolean(
          document.getElementById('app') &&
            (window as unknown as { __accessPortalBoot?: boolean }).__accessPortalBoot,
        ),
    });
    return results[0]?.result === true;
  } catch {
    return false;
  }
}

export async function checkPwaAvailable(pwaUrl?: string): Promise<{ reachable: boolean; pwaUrl: string }> {
  const url = normalizePwaUrl(pwaUrl ?? (await resolvePwaUrl()));
  const origin = new URL(url).origin;
  try {
    const tabs = await chrome.tabs.query({ url: `${origin}/*` });
    for (const tab of tabs) {
      if (tab.id != null && (await verifyPwaTabReachable(tab.id, url))) {
        return { reachable: true, pwaUrl: url };
      }
    }
  } catch {
    /* ignore */
  }
  const reachable = await checkPwaHttpReachable(url);
  return { reachable, pwaUrl: url };
}

export async function openOrFocusPwaTab(
  url?: string,
): Promise<{ tab?: chrome.tabs.Tab; createdNewTab: boolean }> {
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
            return { tab, createdNewTab: false };
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

  const tab = await chrome.tabs.create({
    url: isLocalDevPwaUrl(pwaUrl) ? withCacheBust(pwaUrl) : pwaUrl,
    active: true,
  });
  if (tab.id != null) {
    await sessionLike().set({ [PWA_TAB_SESSION_KEY]: tab.id });
  }
  return { tab, createdNewTab: true };
}

export async function openOrVerifyPwaTab(url?: string): Promise<OpenPwaResult> {
  const pwaUrl = normalizePwaUrl(url ?? (await resolvePwaUrl()));
  const { tab, createdNewTab } = await openOrFocusPwaTab(pwaUrl);
  if (!tab?.id) {
    return { ok: false, error: 'pwa_tab_failed', pwaUrl };
  }

  await waitForTabSettled(tab.id);
  const reachable = await verifyPwaTabReachable(tab.id, pwaUrl);
  if (!reachable) {
    return { ok: false, error: 'pwa_unreachable', pwaUrl };
  }

  return { ok: true, tab, createdNewTab };
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

async function waitForPwaBoot(tabId: number, attempts = 48): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId },
        func: () => Boolean((window as unknown as { __accessPortalBoot?: boolean }).__accessPortalBoot),
      });
      if (results[0]?.result === true) return true;
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

async function refocusExtensionPanel(): Promise<void> {
  try {
    const stored = await sessionLike().get(PANEL_WINDOW_SESSION_KEY);
    const windowId = stored[PANEL_WINDOW_SESSION_KEY];
    if (typeof windowId !== 'number') return;
    await chrome.windows.update(windowId, { focused: true, drawAttention: true });
  } catch {
    /* panel closed */
  }
}

async function injectTextareaPlaceholder(tabId: number, message: string): Promise<void> {
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (msg: string) => {
        const ta = document.getElementById('source-text');
        if (!(ta instanceof HTMLTextAreaElement)) return;
        if (ta.value.trim() && ta.dataset.apImportPlaceholder !== '1') return;
        ta.value = msg;
        ta.readOnly = true;
        ta.dataset.apImportPlaceholder = '1';
        ta.classList.add('is-import-loading');
      },
      args: [message],
    });
  } catch {
    /* tab not injectable yet */
  }
}

async function highlightAccessPortalTab(tabId: number): Promise<void> {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (tab.index == null || tab.windowId == null) return;
    await chrome.tabs.highlight({ windowId: tab.windowId, tabs: tab.index });
    await chrome.windows.update(tab.windowId, { drawAttention: true });
  } catch {
    /* ignore */
  }
}

export async function focusAccessPortalTab(): Promise<boolean> {
  try {
    const stored = await sessionLike().get(PWA_TAB_SESSION_KEY);
    const tabId = stored[PWA_TAB_SESSION_KEY];
    if (typeof tabId !== 'number') return false;
    const tab = await chrome.tabs.get(tabId);
    if (tab.id == null) return false;
    await chrome.tabs.update(tab.id, { active: true });
    if (tab.windowId != null) {
      await chrome.windows.update(tab.windowId, { focused: true, drawAttention: true });
    }
    return true;
  } catch {
    return false;
  }
}

export async function deliverImportToPwa(
  payload: ExtensionImportPayload,
  locale: 'es' | 'en' = 'en',
): Promise<{ createdNewTab: boolean; tabId: number }> {
  await chrome.storage.local.set({ [IMPORT_STORAGE_KEY]: payload });

  const pwaUrl = await resolvePwaUrl();
  if (!isAllowedPwaUrl(pwaUrl)) {
    throw new Error('PWA_URL_NOT_ALLOWED');
  }

  const baseUrl = normalizePwaUrl(pwaUrl);
  const loadUrl = isLocalDevPwaUrl(baseUrl) ? withCacheBust(baseUrl) : baseUrl;

  const httpOk = await checkPwaHttpReachable(baseUrl);
  if (!httpOk) {
    throw new Error('pwa_unreachable');
  }

  const loadingMessage =
    locale === 'es'
      ? 'Leyendo la página y abriendo AccessPortal…'
      : 'Reading the page and opening AccessPortal…';

  let tabId: number | undefined;
  let createdNewTab = false;

  try {
    const stored = await sessionLike().get(PWA_TAB_SESSION_KEY);
    const remembered = stored[PWA_TAB_SESSION_KEY];
    if (typeof remembered === 'number') {
      const tab = await chrome.tabs.get(remembered);
      if (tab.id != null && tab.url?.startsWith(new URL(baseUrl).origin)) {
        tabId = tab.id;
        await chrome.tabs.update(tabId, { url: loadUrl, active: false });
      }
    }
  } catch {
    tabId = undefined;
  }

  if (tabId == null) {
    const tab = await chrome.tabs.create({ url: loadUrl, active: false });
    if (tab.id == null) {
      throw new Error('pwa_tab_failed');
    }
    tabId = tab.id;
    createdNewTab = true;
    await sessionLike().set({ [PWA_TAB_SESSION_KEY]: tabId });
  }

  await refocusExtensionPanel();
  await waitForTabSettled(tabId);
  await highlightAccessPortalTab(tabId);
  await injectTextareaPlaceholder(tabId, loadingMessage);

  const booted = await waitForPwaBoot(tabId);
  if (!booted) {
    console.warn('[AccessPortal] PWA boot timed out; import may apply after load');
  }

  await injectTextareaPlaceholder(tabId, loadingMessage);

  try {
    await injectImportIntoPwaTab(tabId, payload);
  } catch (err) {
    console.warn('[AccessPortal] import inject failed, PWA may fetch via runtime message', err);
  }

  await refocusExtensionPanel();
  await highlightAccessPortalTab(tabId);

  return { createdNewTab, tabId };
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
