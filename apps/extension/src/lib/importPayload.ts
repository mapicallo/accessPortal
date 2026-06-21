export type ExtensionImportKind = 'page' | 'selection';

export type ExtensionImportPayload = {
  kind: ExtensionImportKind;
  title: string;
  url?: string;
  text: string;
  truncated: boolean;
  sentAt: number;
};

export const IMPORT_STORAGE_KEY = 'ap_pending_import';
export const BRIDGE_LOCAL_KEY = 'accessportal-import';
