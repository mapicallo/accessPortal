import { MAX_INPUT_CHARS } from './ai/modelOptions.js';
import type { MessageKey } from './i18n.js';

export const MAX_DOCUMENT_BYTES = 16 * 1024 * 1024;

export type DocumentParseFailure =
  | 'too_large'
  | 'unsupported'
  | 'empty'
  | 'pdf_failed'
  | 'read_failed';

export type DocumentParseResult =
  | { ok: true; fileName: string; text: string; truncated: boolean }
  | { ok: false; error: DocumentParseFailure };

const TEXT_EXT = new Set(['.txt', '.md', '.markdown']);

function extOf(name: string): string {
  const i = name.lastIndexOf('.');
  return i >= 0 ? name.slice(i).toLowerCase() : '';
}

function truncateText(text: string, max: number): { text: string; truncated: boolean } {
  if (text.length <= max) return { text, truncated: false };
  return { text: text.slice(0, max), truncated: true };
}

async function extractPdfText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const doc = await pdfjs.getDocument({
    data: buffer,
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  }).promise;

  const parts: string[] = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? String(item.str) : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (pageText) parts.push(pageText);
  }

  return parts.join('\n\n');
}

export async function parseDocumentFile(file: File): Promise<DocumentParseResult> {
  if (file.size > MAX_DOCUMENT_BYTES) return { ok: false, error: 'too_large' };

  const ext = extOf(file.name);
  let raw = '';

  try {
    if (ext === '.pdf' || file.type === 'application/pdf') {
      raw = await extractPdfText(file);
    } else if (TEXT_EXT.has(ext) || file.type.startsWith('text/')) {
      raw = await file.text();
    } else {
      return { ok: false, error: 'unsupported' };
    }
  } catch {
    return {
      ok: false,
      error: ext === '.pdf' || file.type === 'application/pdf' ? 'pdf_failed' : 'read_failed',
    };
  }

  raw = raw.replace(/\r\n/g, '\n').trim();
  if (!raw) return { ok: false, error: 'empty' };

  const { text, truncated } = truncateText(raw, MAX_INPUT_CHARS);

  return { ok: true, fileName: file.name, text, truncated };
}

export function documentErrorMessage(
  error: DocumentParseFailure,
  t: (key: MessageKey) => string,
): string {
  switch (error) {
    case 'too_large':
      return t('errorFileTooLarge');
    case 'unsupported':
      return t('errorFileUnsupported');
    case 'empty':
      return t('errorFileEmpty');
    case 'pdf_failed':
      return t('errorPdfFailed');
    default:
      return t('errorFileRead');
  }
}
