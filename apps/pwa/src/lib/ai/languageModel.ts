/**
 * LanguageModel — availability, warm-up, streaming prompts.
 */
import { MODEL_LANG_OPTIONS } from './modelOptions.js';
import type { Locale } from '../storage.js';

export type ModelUiState =
  | 'checking'
  | 'unavailable'
  | 'no-api'
  | 'downloadable'
  | 'downloading'
  | 'ready';

export type AvailabilityKind = 'available' | 'downloadable' | 'downloading' | 'unavailable';

export type DownloadProgressHandler = (loadedRatio: number) => void;

export type PromptInput =
  | string
  | Array<{
      role: 'user';
      content: Array<{ type: 'text'; value: string } | { type: 'image'; value: Blob }>;
    }>;

export type AccessPortalSession = {
  prompt?: (input: PromptInput, options?: { signal?: AbortSignal }) => Promise<string>;
  promptStreaming: (
    input: PromptInput,
    options?: { signal?: AbortSignal },
  ) => ReadableStream<string> & AsyncIterable<string>;
  destroy?: () => void;
};

type CreateOptions = {
  monitor?: (m: {
    addEventListener: (type: 'downloadprogress', fn: (e: { loaded: number }) => void) => void;
  }) => void;
  signal?: AbortSignal;
  initialPrompts?: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  systemPrompt?: string;
};

type LanguageModelGlobal = {
  availability?: (options?: typeof MODEL_LANG_OPTIONS) => Promise<string>;
  create?: (options?: CreateOptions & typeof MODEL_LANG_OPTIONS) => Promise<AccessPortalSession>;
};

let warmSession: AccessPortalSession | null = null;
let warmAbort: AbortController | null = null;

function languageModelGlobal(): LanguageModelGlobal | undefined {
  return (globalThis as unknown as { LanguageModel?: LanguageModelGlobal }).LanguageModel;
}

function mapLanguageModelStatus(status: string): AvailabilityKind {
  if (status === 'available' || status === 'readily') return 'available';
  if (status === 'downloadable' || status === 'after-download') return 'downloadable';
  if (status === 'downloading') return 'downloading';
  return 'unavailable';
}

function buildMonitor(onProgress?: DownloadProgressHandler) {
  return (m: {
    addEventListener: (type: 'downloadprogress', fn: (e: { loaded: number }) => void) => void;
  }) => {
    m.addEventListener('downloadprogress', (e) => {
      const ratio = typeof e.loaded === 'number' ? Math.min(1, Math.max(0, e.loaded)) : 0;
      onProgress?.(ratio);
    });
  };
}

async function createSession(options: CreateOptions = {}): Promise<AccessPortalSession> {
  const merged = { ...MODEL_LANG_OPTIONS, ...options };
  const LM = languageModelGlobal();
  if (LM?.create) return LM.create(merged);
  throw new Error('NO_LANGUAGE_MODEL_API');
}

export function hasLanguageModelApi(): boolean {
  return Boolean(languageModelGlobal()?.availability);
}

export async function queryLanguageModelAvailability(): Promise<AvailabilityKind> {
  const LM = languageModelGlobal();
  if (LM?.availability) {
    const status = await LM.availability(MODEL_LANG_OPTIONS);
    return mapLanguageModelStatus(status);
  }
  return 'unavailable';
}

export async function warmUpLanguageModel(onProgress?: DownloadProgressHandler): Promise<void> {
  if (warmSession) return;

  warmAbort?.abort();
  warmAbort = new AbortController();

  warmSession = await createSession({
    monitor: buildMonitor(onProgress),
    signal: warmAbort.signal,
  });
}

export async function createTaskSession(
  locale: Locale,
  systemText: string,
): Promise<AccessPortalSession> {
  destroyWarmSession();
  warmAbort = new AbortController();

  const LM = languageModelGlobal();
  if (LM?.create) {
    warmSession = await createSession({
      signal: warmAbort.signal,
      initialPrompts: [{ role: 'system', content: systemText }],
    });
    return warmSession;
  }

  warmSession = await createSession({
    signal: warmAbort.signal,
    systemPrompt: systemText,
  });
  return warmSession;
}

export function getWarmSession(): AccessPortalSession | null {
  return warmSession;
}

export function destroyWarmSession(): void {
  warmAbort?.abort();
  warmAbort = null;
  try {
    warmSession?.destroy?.();
  } catch {
    /* ignore */
  }
  warmSession = null;
}

export async function promptStreaming(
  input: PromptInput,
  onUpdate: (accumulated: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const session = warmSession;
  if (!session?.promptStreaming) throw new Error('NO_SESSION');

  const stream = session.promptStreaming(input, { signal });
  let full = '';

  for await (const chunk of stream) {
    full += chunk;
    onUpdate(full);
  }

  return full;
}

/** @deprecated use promptStreaming */
export async function promptStreamingText(
  input: string,
  onUpdate: (accumulated: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  return promptStreaming(input, onUpdate, signal);
}

export async function promptText(input: PromptInput, signal?: AbortSignal): Promise<string> {
  const session = warmSession;
  if (session?.prompt) return session.prompt(input, { signal });
  return promptStreaming(input, () => {}, signal);
}

export function easyReadSystemPrompt(locale: Locale): string {
  if (locale === 'es') {
    return [
      'Eres un asistente de lectura fácil para AccessPortal.',
      'Reescribe el texto del usuario con frases cortas, vocabulario sencillo y estructura clara.',
      'Conserva el significado; no añadas datos nuevos ni consejos médicos o legales.',
      'Responde solo con el texto reescrito, sin introducción.',
    ].join(' ');
  }
  return [
    'You are an easy-read assistant for AccessPortal.',
    'Rewrite the user text with short sentences, plain vocabulary, and clear structure.',
    'Preserve meaning; do not add new facts or medical/legal advice.',
    'Reply with the rewritten text only, no introduction.',
  ].join(' ');
}

export function summarizeFallbackSystemPrompt(locale: Locale): string {
  if (locale === 'es') {
    return [
      'Resume el texto en puntos clave concisos.',
      'Usa viñetas. No inventes información.',
      'Responde solo con el resumen.',
    ].join(' ');
  }
  return [
    'Summarize the text into concise key points.',
    'Use bullet points. Do not invent information.',
    'Reply with the summary only.',
  ].join(' ');
}

export function describeImageSystemPrompt(locale: Locale): string {
  if (locale === 'es') {
    return [
      'Eres un asistente de accesibilidad visual para AccessPortal.',
      'Describe la imagen de forma clara para lectores de pantalla: objetos, texto visible, colores relevantes y contexto.',
      'Si hay texto en la imagen, transcríbelo. No inventes detalles. Responde en español claro, en prosa o listas cortas.',
    ].join(' ');
  }
  return [
    'You are a visual accessibility assistant for AccessPortal.',
    'Describe the image clearly for screen readers: objects, visible text, relevant colors, and context.',
    'If text appears in the image, transcribe it. Do not invent details. Use clear prose or short lists.',
  ].join(' ');
}
