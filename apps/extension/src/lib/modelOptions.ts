/** Shared Prompt API language options for availability + session create. */
export const MODEL_LANG_OPTIONS = {
  expectedInputs: [
    { type: 'text' as const, languages: ['en', 'es'] as string[] },
    { type: 'image' as const },
  ],
  expectedOutputs: [{ type: 'text' as const, languages: ['en', 'es'] as string[] }],
};

export const MAX_EASY_READ_CHARS = 8_000;

export function truncateForEasyRead(text: string): { text: string; truncated: boolean } {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_EASY_READ_CHARS) {
    return { text: trimmed, truncated: false };
  }
  return { text: trimmed.slice(0, MAX_EASY_READ_CHARS), truncated: true };
}
