import {
  BRIDGE_LOCAL_KEY,
  isFreshImport,
  parseImportPayload,
  type ExtensionImportPayload,
} from './types.js';

export type ImportHandler = (payload: ExtensionImportPayload) => void;

let handler: ImportHandler | null = null;

function consumeStoredImport(): ExtensionImportPayload | null {
  try {
    const raw = localStorage.getItem(BRIDGE_LOCAL_KEY);
    if (!raw) return null;
    localStorage.removeItem(BRIDGE_LOCAL_KEY);
    const payload = parseImportPayload(raw);
    if (!payload || !isFreshImport(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}

function dispatchImport(payload: ExtensionImportPayload): void {
  handler?.(payload);
}

export function initExtensionImport(onImport: ImportHandler): void {
  handler = onImport;

  const existing = consumeStoredImport();
  if (existing) dispatchImport(existing);

  window.addEventListener('accessportal-import', () => {
    const payload = consumeStoredImport();
    if (payload) dispatchImport(payload);
  });
}

declare const chrome: { runtime?: { sendMessage: (id: string, msg: unknown) => Promise<unknown> } };

export async function tryFetchImportViaExtension(): Promise<ExtensionImportPayload | null> {
  const extId = new URLSearchParams(location.search).get('ext');
  if (!extId || typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return null;

  try {
    const response = (await chrome.runtime.sendMessage(extId, { type: 'ap:fetch-import' })) as {
      payload?: ExtensionImportPayload;
    };
    const payload = response?.payload;
    if (payload && typeof payload.text === 'string' && isFreshImport(payload)) {
      return payload;
    }
  } catch {
    /* extension not installed or blocked */
  }
  return null;
}
