import type { Locale } from '../storage.js';

/** Shared Prompt API language options for availability + session create. */
export const MODEL_LANG_OPTIONS = {
  expectedInputs: [
    { type: 'text' as const, languages: ['en', 'es'] as string[] },
    { type: 'image' as const },
  ],
  expectedOutputs: [{ type: 'text' as const, languages: ['en', 'es'] as string[] }],
};

/** Chrome logs an extension error if Summarizer runs without outputLanguage. */
export function getSummarizerOptions(locale: Locale) {
  const outputLanguage = locale === 'es' ? ('es' as const) : ('en' as const);
  return {
    type: 'key-points' as const,
    format: 'plain-text' as const,
    length: 'medium' as const,
    outputLanguage,
    expectedInputLanguages: outputLanguage === 'es' ? (['es', 'en'] as const) : (['en', 'es'] as const),
    expectedContextLanguages: [outputLanguage] as const,
  };
}

/** ~40k chars — practical limit for on-device inference in v0.2 */
export const MAX_INPUT_CHARS = 40_000;

export function truncateForModel(text: string): { text: string; truncated: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_INPUT_CHARS) {
    return { text: trimmed, truncated: false };
  }
  return { text: trimmed.slice(0, MAX_INPUT_CHARS), truncated: true };
}

export function getSelectionOrAll(source: HTMLTextAreaElement): string {
  const start = source.selectionStart;
  const end = source.selectionEnd;
  if (start !== end) {
    return source.value.slice(start, end).trim();
  }
  return source.value.trim();
}
