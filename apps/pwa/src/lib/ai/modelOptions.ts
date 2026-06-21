/** Shared Prompt API language options for availability + session create. */
export const MODEL_LANG_OPTIONS = {
  expectedInputs: [
    { type: 'text' as const, languages: ['en', 'es'] as string[] },
    { type: 'image' as const },
  ],
  expectedOutputs: [{ type: 'text' as const, languages: ['en', 'es'] as string[] }],
};

export const SUMMARIZER_OPTIONS = {
  type: 'key-points' as const,
  format: 'plain-text' as const,
  length: 'medium' as const,
};

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
