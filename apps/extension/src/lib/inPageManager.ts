import type { Locale } from './i18n.js';
import {
  A11Y_SYNC_KEY,
  DEFAULT_A11Y,
  IN_PAGE_ENABLED_KEY,
  type A11yLayerSettings,
} from './messages.js';
import { isInjectableWebUrl, resolveTargetTabId } from './tabContext.js';

const CONTENT_SCRIPT_FILE = 'assets/content.js';
const injectedTabs = new Set<number>();

function sessionLike(): chrome.storage.StorageArea {
  return chrome.storage.session ?? chrome.storage.local;
}

export async function loadA11yPrefs(): Promise<A11yLayerSettings> {
  try {
    const data = await chrome.storage.sync.get(A11Y_SYNC_KEY);
    const raw = data[A11Y_SYNC_KEY];
    if (!raw || typeof raw !== 'object') return { ...DEFAULT_A11Y };
    const prefs = raw as Partial<A11yLayerSettings>;
    return {
      dyslexic: Boolean(prefs.dyslexic),
      highContrast: Boolean(prefs.highContrast),
      fontScale: prefs.fontScale === 1.15 || prefs.fontScale === 1.3 ? prefs.fontScale : 1,
    };
  } catch {
    return { ...DEFAULT_A11Y };
  }
}

export async function saveA11yPrefs(a11y: A11yLayerSettings): Promise<void> {
  await chrome.storage.sync.set({ [A11Y_SYNC_KEY]: a11y });
}

async function getEnabledTabIds(): Promise<number[]> {
  const data = await sessionLike().get(IN_PAGE_ENABLED_KEY);
  const ids = data[IN_PAGE_ENABLED_KEY];
  return Array.isArray(ids) ? ids.filter((x) => typeof x === 'number') : [];
}

async function setEnabledTabIds(ids: number[]): Promise<void> {
  await sessionLike().set({ [IN_PAGE_ENABLED_KEY]: ids });
}

export async function isInPageEnabled(tabId: number): Promise<boolean> {
  const ids = await getEnabledTabIds();
  return ids.includes(tabId);
}

async function resolveInjectableTabId(): Promise<number | null> {
  const tabId = await resolveTargetTabId();
  if (tabId == null) return null;
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!isInjectableWebUrl(tab.url)) return null;
    return tabId;
  } catch {
    return null;
  }
}

export async function injectContentScript(tabId: number): Promise<boolean> {
  if (injectedTabs.has(tabId)) return true;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: [CONTENT_SCRIPT_FILE],
    });
    injectedTabs.add(tabId);
    return true;
  } catch {
    return false;
  }
}

export async function enableInPage(locale: Locale): Promise<{ ok: true } | { ok: false; error: string }> {
  const tabId = await resolveInjectableTabId();
  if (tabId == null) return { ok: false, error: 'no_tab' };

  const injected = await injectContentScript(tabId);
  if (!injected) return { ok: false, error: 'script_failed' };

  const a11y = await loadA11yPrefs();
  const ids = await getEnabledTabIds();
  if (!ids.includes(tabId)) {
    await setEnabledTabIds([...ids, tabId]);
  }

  try {
    await chrome.tabs.sendMessage(tabId, {
      type: 'ap:content-init',
      locale,
      a11y,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: 'script_failed' };
  }
}

export async function disableInPage(): Promise<void> {
  const tabId = await resolveInjectableTabId();
  if (tabId == null) return;

  const ids = await getEnabledTabIds();
  await setEnabledTabIds(ids.filter((id) => id !== tabId));

  try {
    await chrome.tabs.sendMessage(tabId, { type: 'ap:content-disable' });
  } catch {
    /* ignore */
  }
}

export async function getInPageState(): Promise<{ enabled: boolean; tabId: number | null }> {
  const tabId = await resolveInjectableTabId();
  const ids = await getEnabledTabIds();

  if (tabId == null) {
    if (ids.length > 0) await setEnabledTabIds([]);
    return { enabled: false, tabId: null };
  }

  const pruned = ids.filter((id) => id === tabId);
  if (pruned.length !== ids.length) await setEnabledTabIds(pruned);

  return { enabled: pruned.includes(tabId), tabId };
}

export async function applyA11yLayer(a11y: A11yLayerSettings): Promise<{ ok: boolean; error?: string }> {
  await saveA11yPrefs(a11y);
  const tabId = await resolveInjectableTabId();
  if (tabId == null) return { ok: false, error: 'no_tab' };

  if (!(await isInPageEnabled(tabId))) {
    return { ok: true };
  }

  try {
    await chrome.tabs.sendMessage(tabId, { type: 'ap:content-apply-a11y', a11y });
    return { ok: true };
  } catch {
    return { ok: false, error: 'script_failed' };
  }
}

export async function restorePage(): Promise<{ ok: boolean; error?: string }> {
  const tabId = await resolveInjectableTabId();
  if (tabId == null) return { ok: false, error: 'no_tab' };

  try {
    await chrome.tabs.sendMessage(tabId, { type: 'ap:content-restore' });
    return { ok: true };
  } catch {
    return { ok: false, error: 'script_failed' };
  }
}

export function clearInjectedTab(tabId: number): void {
  injectedTabs.delete(tabId);
}
