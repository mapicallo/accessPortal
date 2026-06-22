export type ExtensionImportKind = 'page' | 'selection';

export type ExtensionImportPayload = {
  kind: ExtensionImportKind;
  title: string;
  url?: string;
  text: string;
  truncated: boolean;
  sentAt: number;
};

export const BRIDGE_LOCAL_KEY = 'accessportal-import';

export function parseImportPayload(raw: string | null): ExtensionImportPayload | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as ExtensionImportPayload;
    if (!data || typeof data.text !== 'string') return null;
    return data;
  } catch {
    return null;
  }
}

export function isFreshImport(payload: ExtensionImportPayload, maxAgeMs = 5 * 60_000): boolean {
  return Date.now() - payload.sentAt < maxAgeMs;
}

/** Read pending import without consuming (for loading UI). */
export function peekPendingImport(): ExtensionImportPayload | null {
  try {
    const raw = localStorage.getItem(BRIDGE_LOCAL_KEY);
    if (!raw) return null;
    const payload = parseImportPayload(raw);
    if (!payload || !isFreshImport(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}
