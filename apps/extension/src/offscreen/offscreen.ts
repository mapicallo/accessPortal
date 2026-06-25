import { MODEL_LANG_OPTIONS, truncateForEasyRead } from '../lib/modelOptions.js';
import type { Locale } from '../lib/i18n.js';
import type { OffscreenRequestMessage } from '../lib/messages.js';

type PromptInput =
  | string
  | Array<{
      role: 'user';
      content: Array<{ type: 'text'; value: string } | { type: 'image'; value: Blob }>;
    }>;

type AccessPortalSession = {
  promptStreaming: (
    input: PromptInput,
    options?: { signal?: AbortSignal },
  ) => ReadableStream<string> & AsyncIterable<string>;
  destroy?: () => void;
};

type LanguageModelGlobal = {
  availability?: (options?: typeof MODEL_LANG_OPTIONS) => Promise<string>;
  create?: (options?: Record<string, unknown>) => Promise<AccessPortalSession>;
};

let warmSession: AccessPortalSession | null = null;
let warmAbort: AbortController | null = null;

function languageModelGlobal(): LanguageModelGlobal | undefined {
  return (globalThis as unknown as { LanguageModel?: LanguageModelGlobal }).LanguageModel;
}

function easyReadSystemPrompt(locale: Locale): string {
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

function describeImageSystemPrompt(locale: Locale): string {
  if (locale === 'es') {
    return [
      'Eres un asistente de accesibilidad visual para AccessPortal.',
      'Describe la imagen de forma clara para lectores de pantalla.',
      'Si hay texto en la imagen, transcríbelo. No inventes detalles.',
    ].join(' ');
  }
  return [
    'You are a visual accessibility assistant for AccessPortal.',
    'Describe the image clearly for screen readers.',
    'If text appears in the image, transcribe it. Do not invent details.',
  ].join(' ');
}

async function createTaskSession(locale: Locale, systemText: string): Promise<AccessPortalSession> {
  warmAbort?.abort();
  warmAbort = new AbortController();
  const LM = languageModelGlobal();
  if (!LM?.create) throw new Error('NO_LANGUAGE_MODEL_API');

  try {
    warmSession?.destroy?.();
  } catch {
    /* ignore */
  }

  warmSession = await LM.create({
    ...MODEL_LANG_OPTIONS,
    signal: warmAbort.signal,
    initialPrompts: [{ role: 'system', content: systemText }],
  });
  return warmSession;
}

async function streamPrompt(
  input: PromptInput,
  tabId: number,
  requestId: string,
  signal?: AbortSignal,
): Promise<void> {
  const session = warmSession;
  if (!session?.promptStreaming) throw new Error('NO_SESSION');

  const stream = session.promptStreaming(input, { signal });
  let full = '';

  for await (const chunk of stream) {
    full += chunk;
    await chrome.runtime.sendMessage({
      type: 'ap:offscreen-stream',
      requestId,
      tabId,
      text: full,
      done: false,
    });
  }

  await chrome.runtime.sendMessage({
    type: 'ap:offscreen-stream',
    requestId,
    tabId,
    text: full,
    done: true,
  });
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header?.match(/data:([^;]+)/)?.[1] ?? 'image/png';
  const binary = atob(base64 ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function handleEasyRead(msg: Extract<OffscreenRequestMessage, { type: 'ap:offscreen-easy-read' }>): Promise<void> {
  const { text, locale, requestId, tabId } = msg;
  const { text: trimmed } = truncateForEasyRead(text);
  await createTaskSession(locale, easyReadSystemPrompt(locale));

  const userPrompt =
    locale === 'es'
      ? `Reescribe en lectura fácil:\n\n${trimmed}`
      : `Rewrite in easy-read style:\n\n${trimmed}`;

  await streamPrompt(userPrompt, tabId, requestId);
}

async function handleDescribeImage(
  msg: Extract<OffscreenRequestMessage, { type: 'ap:offscreen-describe-image' }>,
): Promise<void> {
  const { locale, requestId, tabId, imageDataUrl, fileName } = msg;
  await createTaskSession(locale, describeImageSystemPrompt(locale));

  const blob = dataUrlToBlob(imageDataUrl);
  const instruction =
    locale === 'es'
      ? `Describe esta imagen de forma accesible.\nArchivo: ${fileName}`
      : `Describe this image accessibly.\nFile: ${fileName}`;

  await streamPrompt(
    [
      {
        role: 'user',
        content: [
          { type: 'text', value: instruction },
          { type: 'image', value: blob },
        ],
      },
    ],
    tabId,
    requestId,
  );
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void (async () => {
    try {
      if (message?.type === 'ap:offscreen-ping') {
        sendResponse({ ok: Boolean(languageModelGlobal()?.create) });
        return;
      }

      if (message?.type === 'ap:offscreen-easy-read') {
        await handleEasyRead(message);
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'ap:offscreen-describe-image') {
        await handleDescribeImage(message);
        sendResponse({ ok: true });
        return;
      }

      sendResponse({ ok: false });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'offscreen_error';
      if (message?.requestId && message?.tabId) {
        await chrome.runtime.sendMessage({
          type: 'ap:offscreen-stream',
          requestId: message.requestId,
          tabId: message.tabId,
          text: '',
          done: true,
          error,
        });
      }
      sendResponse({ ok: false, error });
    }
  })();
  return true;
});
