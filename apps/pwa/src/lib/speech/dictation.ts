import { getLocale } from '../i18n.js';
import type { Locale } from '../storage.js';

export type DictationState = 'idle' | 'listening' | 'unsupported' | 'error';

type DictationListener = (state: DictationState, transcript: string) => void;

type SpeechRecognitionResultList = {
  length: number;
  [index: number]: { isFinal: boolean; [index: number]: { transcript: string } | undefined };
};

type SpeechRecognitionEvent = {
  resultIndex: number;
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function recognitionConstructor(): (new () => SpeechRecognitionLike) | null {
  const w = globalThis as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function localeToSpeechLang(locale: Locale): string {
  return locale === 'es' ? 'es-ES' : 'en-US';
}

let recognition: SpeechRecognitionLike | null = null;
let listener: DictationListener | null = null;
let transcript = '';

export function isDictationSupported(): boolean {
  return recognitionConstructor() !== null;
}

export function getDictationTranscript(): string {
  return transcript;
}

export function setDictationTranscript(text: string): void {
  transcript = text;
  listener?.('idle', transcript);
}

export function onDictationChange(fn: DictationListener): void {
  listener = fn;
}

export function startDictation(locale?: Locale): DictationState {
  const Ctor = recognitionConstructor();
  if (!Ctor) {
    listener?.('unsupported', transcript);
    return 'unsupported';
  }

  stopDictation(false);

  transcript = '';
  recognition = new Ctor();
  recognition.lang = localeToSpeechLang(locale ?? getLocale());
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let interim = '';
    let finalText = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      const part = event.results[i]?.[0]?.transcript ?? '';
      if (event.results[i]?.isFinal) finalText += part;
      else interim += part;
    }

    if (finalText) transcript = `${transcript} ${finalText}`.trim();
    const display = `${transcript} ${interim}`.trim();
    listener?.('listening', display);
  };

  recognition.onerror = () => {
    listener?.('error', transcript);
  };

  recognition.onend = () => {
    listener?.('idle', transcript);
  };

  try {
    recognition.start();
    listener?.('listening', transcript);
    return 'listening';
  } catch {
    listener?.('error', transcript);
    return 'error';
  }
}

export function stopDictation(notify = true): void {
  if (!recognition) return;
  try {
    recognition.stop();
  } catch {
    try {
      recognition.abort();
    } catch {
      /* ignore */
    }
  }
  recognition = null;
  if (notify) listener?.('idle', transcript);
}

export function destroyDictation(): void {
  stopDictation(false);
  listener = null;
  transcript = '';
}
