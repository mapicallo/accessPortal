/**
 * Summarizer + LanguageModel availability checks.
 */
import { SUMMARIZER_OPTIONS } from './modelOptions.js';
import {
  hasLanguageModelApi,
  queryLanguageModelAvailability,
  type AvailabilityKind,
} from './languageModel.js';

type SummarizerGlobal = {
  availability?: (options?: typeof SUMMARIZER_OPTIONS) => Promise<string>;
};

function summarizerGlobal(): SummarizerGlobal | undefined {
  return (globalThis as unknown as { Summarizer?: SummarizerGlobal }).Summarizer;
}

function mapStatus(status: string): AvailabilityKind {
  if (status === 'available' || status === 'readily') return 'available';
  if (status === 'downloadable' || status === 'after-download') return 'downloadable';
  if (status === 'downloading') return 'downloading';
  return 'unavailable';
}

export function hasSummarizerApi(): boolean {
  return Boolean(summarizerGlobal()?.availability);
}

export async function querySummarizerAvailability(): Promise<AvailabilityKind> {
  const S = summarizerGlobal();
  if (S?.availability) {
    const status = await S.availability(SUMMARIZER_OPTIONS);
    return mapStatus(status);
  }
  return 'unavailable';
}

export type AiReadiness = {
  hasAnyApi: boolean;
  languageModel: AvailabilityKind;
  summarizer: AvailabilityKind;
  /** worst-case status for download UI */
  combined: AvailabilityKind;
};

export async function checkAiReadiness(): Promise<AiReadiness> {
  const languageModel = hasLanguageModelApi()
    ? await queryLanguageModelAvailability()
    : 'unavailable';
  const summarizer = hasSummarizerApi() ? await querySummarizerAvailability() : 'unavailable';

  const hasAnyApi = hasLanguageModelApi() || hasSummarizerApi();
  const combined = pickCombinedStatus(languageModel, summarizer);

  return { hasAnyApi, languageModel, summarizer, combined };
}

function pickCombinedStatus(a: AvailabilityKind, b: AvailabilityKind): AvailabilityKind {
  const rank: Record<AvailabilityKind, number> = {
    unavailable: 0,
    downloadable: 1,
    downloading: 2,
    available: 3,
  };
  return rank[a] <= rank[b] ? a : b;
}

export function hasBuiltInAiApi(): boolean {
  return hasLanguageModelApi() || hasSummarizerApi();
}
