/**
 * On-device translation via LanguageModel streaming (reuses warm session).
 */
import {
  getWarmSession,
  promptStreamingText,
  translateSystemPrompt,
  warmUpLanguageModel,
} from './languageModel.js';
import type { Locale } from '../storage.js';

export async function streamTranslate(
  text: string,
  targetLocale: Locale,
  onUpdate: (accumulated: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (!getWarmSession()) {
    await warmUpLanguageModel();
  }

  const system = translateSystemPrompt(targetLocale);
  const userPrompt =
    targetLocale === 'es'
      ? `${system}\n\nTraduce este texto al español. Responde solo con la traducción, sin notas:\n\n${text}`
      : `${system}\n\nTranslate this text into English. Reply with the translation only, no notes:\n\n${text}`;

  return promptStreamingText(userPrompt, onUpdate, signal);
}
