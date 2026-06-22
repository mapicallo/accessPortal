/**
 * Summarizer API with LanguageModel fallback.
 */
import {
  createTaskSession,
  promptStreamingText,
  promptText,
  summarizeFallbackSystemPrompt,
} from './languageModel.js';
import { getSummarizerOptions } from './modelOptions.js';
import type { Locale } from '../storage.js';

type SummarizerInstance = {
  summarize: (text: string, options?: { signal?: AbortSignal }) => Promise<string>;
  destroy?: () => void;
};

type SummarizerGlobal = {
  create?: (options?: ReturnType<typeof getSummarizerOptions>) => Promise<SummarizerInstance>;
};

function summarizerGlobal(): SummarizerGlobal | undefined {
  return (globalThis as unknown as { Summarizer?: SummarizerGlobal }).Summarizer;
}

export async function summarizeKeyPoints(
  text: string,
  locale: Locale,
  signal?: AbortSignal,
): Promise<string> {
  const S = summarizerGlobal();
  if (S?.create) {
    const summarizer = await S.create(getSummarizerOptions(locale));
    try {
      return await summarizer.summarize(text, { signal });
    } finally {
      try {
        summarizer.destroy?.();
      } catch {
        /* ignore */
      }
    }
  }

  await createTaskSession(locale, summarizeFallbackSystemPrompt(locale));
  return promptText(
    locale === 'es'
      ? `Resume este texto en puntos clave:\n\n${text}`
      : `Summarize this text into key points:\n\n${text}`,
    signal,
  );
}

export async function streamSummarizeKeyPoints(
  text: string,
  locale: Locale,
  onUpdate: (accumulated: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const S = summarizerGlobal();
  if (S?.create) {
    const result = await summarizeKeyPoints(text, locale, signal);
    onUpdate(result);
    return result;
  }

  await createTaskSession(locale, summarizeFallbackSystemPrompt(locale));
  return promptStreamingText(
    locale === 'es'
      ? `Resume este texto en puntos clave:\n\n${text}`
      : `Summarize this text into key points:\n\n${text}`,
    onUpdate,
    signal,
  );
}
