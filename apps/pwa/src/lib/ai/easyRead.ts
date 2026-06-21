/**
 * Easy-read rewriting via LanguageModel streaming.
 */
import {
  createTaskSession,
  easyReadSystemPrompt,
  getWarmSession,
  promptStreamingText,
  warmUpLanguageModel,
} from './languageModel.js';
import type { Locale } from '../storage.js';

export async function streamEasyRead(
  text: string,
  locale: Locale,
  onUpdate: (accumulated: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (!getWarmSession()) {
    await warmUpLanguageModel();
  }

  await createTaskSession(locale, easyReadSystemPrompt(locale));

  const userPrompt =
    locale === 'es'
      ? `Reescribe en lectura fácil:\n\n${text}`
      : `Rewrite in easy-read style:\n\n${text}`;

  return promptStreamingText(userPrompt, onUpdate, signal);
}
