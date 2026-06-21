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
