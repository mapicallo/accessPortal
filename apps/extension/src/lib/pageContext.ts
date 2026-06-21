import { resolveTargetTabId } from './tabContext.js';
import type { ExtensionImportKind, ExtensionImportPayload } from './importPayload.js';

export const MAX_PAGE_CHARS = 40_000;
export const MAX_SELECTION_CHARS = 20_000;

export type PageExtractFailure =
  | 'no_tab'
  | 'restricted'
  | 'empty'
  | 'no_selection'
  | 'script_failed'
  | 'cancelled';

export type PageExtractResult =
  | { ok: true; payload: ExtensionImportPayload }
  | { ok: false; error: PageExtractFailure };

const RESTRICTED_PREFIXES = [
  'chrome://',
  'chrome-extension://',
  'edge://',
  'extension://',
  'devtools://',
  'about:',
  'view-source:',
];

const RESTRICTED_HOSTS = ['chrome.google.com'];

function isRestrictedUrl(url: string): boolean {
  if (!url) return true;
  if (RESTRICTED_PREFIXES.some((p) => url.startsWith(p))) return true;
  try {
    const host = new URL(url).hostname;
    if (RESTRICTED_HOSTS.includes(host) && url.includes('/webstore')) return true;
  } catch {
    return true;
  }
  return false;
}

async function getActiveTab(): Promise<chrome.tabs.Tab | null> {
  const tabId = await resolveTargetTabId();
  if (tabId == null) return null;
  try {
    return await chrome.tabs.get(tabId);
  } catch {
    return null;
  }
}

function extractReadableTextInPage(maxChars: number, confirmMessage: string): {
  title: string;
  url: string;
  text: string;
  truncated: boolean;
} | null {
  if (!confirm(confirmMessage)) return null;

  const title = document.title?.trim() || '';
  const url = location.href || '';
  const root =
    document.querySelector('main') ||
    document.querySelector('article') ||
    document.querySelector('[role="main"]') ||
    document.body;

  let text = (root?.innerText ?? '').replace(/\s+/g, ' ').trim();
  let truncated = false;
  if (text.length > maxChars) {
    text = text.slice(0, maxChars);
    truncated = true;
  }
  return { title, url, text, truncated };
}

function extractSelectionInPage(maxChars: number, confirmMessage: string): {
  title: string;
  url: string;
  text: string;
  truncated: boolean;
} | null {
  if (!confirm(confirmMessage)) return null;

  const title = document.title?.trim() || '';
  const url = location.href || '';
  let text = (window.getSelection()?.toString() ?? '').replace(/\s+/g, ' ').trim();
  let truncated = false;
  if (text.length > maxChars) {
    text = text.slice(0, maxChars);
    truncated = true;
  }
  return { title, url, text, truncated };
}

function toPayload(
  kind: ExtensionImportKind,
  tab: chrome.tabs.Tab,
  data: { title: string; url: string; text: string; truncated: boolean },
): ExtensionImportPayload {
  return {
    kind,
    title: data.title || tab.title || data.url,
    url: data.url || tab.url,
    text: data.text,
    truncated: data.truncated,
    sentAt: Date.now(),
  };
}

export async function extractActiveTabText(confirmMessage: string): Promise<PageExtractResult> {
  const tab = await getActiveTab();
  if (!tab?.id) return { ok: false, error: 'no_tab' };

  const url = tab.url ?? '';
  if (isRestrictedUrl(url)) return { ok: false, error: 'restricted' };

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractReadableTextInPage,
      args: [MAX_PAGE_CHARS, confirmMessage],
    });

    if (result?.result === null) return { ok: false, error: 'cancelled' };

    const payload = result?.result;
    if (!payload || typeof payload !== 'object') {
      return { ok: false, error: 'script_failed' };
    }

    const data = payload as { title: string; url: string; text: string; truncated: boolean };
    if (!data.text.trim()) return { ok: false, error: 'empty' };

    return { ok: true, payload: toPayload('page', tab, data) };
  } catch {
    return { ok: false, error: 'script_failed' };
  }
}

export async function extractActiveTabSelection(confirmMessage: string): Promise<PageExtractResult> {
  const tab = await getActiveTab();
  if (!tab?.id) return { ok: false, error: 'no_tab' };

  const url = tab.url ?? '';
  if (isRestrictedUrl(url)) return { ok: false, error: 'restricted' };

  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractSelectionInPage,
      args: [MAX_SELECTION_CHARS, confirmMessage],
    });

    if (result?.result === null) return { ok: false, error: 'cancelled' };

    const payload = result?.result;
    if (!payload || typeof payload !== 'object') {
      return { ok: false, error: 'script_failed' };
    }

    const data = payload as { title: string; url: string; text: string; truncated: boolean };
    if (!data.text.trim()) return { ok: false, error: 'no_selection' };

    return { ok: true, payload: toPayload('selection', tab, data) };
  } catch {
    return { ok: false, error: 'script_failed' };
  }
}
