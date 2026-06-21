import { structureAccessibilityNote } from '../ai/structureNote.js';
import type { HistoryEntry } from '../db/indexedDb.js';
import { getLocale, t } from '../i18n.js';
import {
  getDictationTranscript,
  isDictationSupported,
  onDictationChange,
  setDictationTranscript,
  startDictation,
  stopDictation,
} from '../speech/dictation.js';
import { isPortalReady } from '../ui/modelStatus.js';
import { saveToHistory } from '../ui/historyPanel.js';

let abortController: AbortController | null = null;
let isListening = false;

function transcriptEl(): HTMLTextAreaElement | null {
  return document.getElementById('motor-transcript') as HTMLTextAreaElement | null;
}

function titleEl(): HTMLInputElement | null {
  return document.getElementById('motor-note-title') as HTMLInputElement | null;
}

function bodyEl(): HTMLTextAreaElement | null {
  return document.getElementById('motor-note-body') as HTMLTextAreaElement | null;
}

function statusEl(): HTMLElement | null {
  return document.getElementById('motor-dictation-status');
}

function writingEl(): HTMLElement | null {
  return document.getElementById('motor-writing-indicator');
}

function startBtn(): HTMLButtonElement | null {
  return document.getElementById('motor-start-dictation-btn') as HTMLButtonElement | null;
}

function stopBtn(): HTMLButtonElement | null {
  return document.getElementById('motor-stop-dictation-btn') as HTMLButtonElement | null;
}

function structureBtn(): HTMLButtonElement | null {
  return document.getElementById('motor-structure-btn') as HTMLButtonElement | null;
}

function setStatus(text: string, isError = false): void {
  const el = statusEl();
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('is-error', isError);
}

function setBusyStructuring(busy: boolean): void {
  structureBtn()?.toggleAttribute('disabled', busy);
  startBtn()?.toggleAttribute('disabled', busy || isListening);
  writingEl()?.toggleAttribute('hidden', !busy);
}

function syncDictationButtons(): void {
  const start = startBtn();
  const stop = stopBtn();
  if (start) start.hidden = isListening;
  if (stop) {
    stop.hidden = !isListening;
    stop.disabled = !isListening;
  }
}

function updateTranscriptDisplay(text: string): void {
  const ta = transcriptEl();
  if (ta) ta.value = text;
}

async function runStructure(): Promise<void> {
  if (!isPortalReady()) return;

  const ta = transcriptEl();
  const transcript = (ta?.value ?? getDictationTranscript()).trim();
  if (!transcript) {
    alert(t('motorErrorEmptyTranscript'));
    return;
  }

  abortController?.abort();
  abortController = new AbortController();
  setBusyStructuring(true);

  try {
    const note = await structureAccessibilityNote(
      transcript,
      getLocale(),
      abortController.signal,
    );

    const title = titleEl();
    const body = bodyEl();
    if (title) title.value = note.title;
    if (body) body.value = note.body;

    if (note.title && note.body) {
      await saveToHistory({
        mode: 'motorNote',
        sourceText: note.title,
        resultText: note.body,
      });
    }

    setStatus(t('motorStructureDone'));
    body?.focus();
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return;
    console.error('[AccessPortal] structure note', err);
    setStatus(t('errorGeneric'), true);
  } finally {
    abortController = null;
    setBusyStructuring(false);
  }
}

function clearForm(): void {
  stopDictation();
  isListening = false;
  syncDictationButtons();
  setDictationTranscript('');
  updateTranscriptDisplay('');
  if (titleEl()) titleEl()!.value = '';
  if (bodyEl()) bodyEl()!.value = '';
  setStatus(t('motorDictationIdle'));
}

async function copyNote(): Promise<void> {
  const title = titleEl()?.value.trim() ?? '';
  const body = bodyEl()?.value.trim() ?? '';
  if (!title && !body) return;

  const text = title ? `${title}\n\n${body}` : body;
  try {
    await navigator.clipboard.writeText(text);
    setStatus(t('copyResultDone'));
  } catch {
    setStatus(t('copyResultFailed'), true);
  }
}

function downloadNote(): void {
  const title = titleEl()?.value.trim() ?? 'accessportal-note';
  const body = bodyEl()?.value.trim() ?? '';
  if (!body && !title) return;

  const safe = title.replace(/[^\w\-]+/g, '-').slice(0, 40) || 'note';
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const blob = new Blob([`${title}\n\n${body}`.trim()], {
    type: 'text/plain;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `accessportal-${safe}-${stamp}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

export function loadMotorHistoryEntry(entry: HistoryEntry): void {
  if (titleEl()) titleEl()!.value = entry.sourceText;
  if (bodyEl()) bodyEl()!.value = entry.resultText;
  updateTranscriptDisplay(entry.resultText);
  setStatus(t('motorHistoryLoaded'));
  titleEl()?.focus();
}

export function initMotorPortal(): void {
  if (!isDictationSupported()) {
    setStatus(t('motorDictationUnsupported'), true);
    startBtn()?.setAttribute('disabled', 'true');
  } else {
    setStatus(t('motorDictationIdle'));
  }

  onDictationChange((state, text) => {
    updateTranscriptDisplay(text);
    if (state === 'listening') {
      isListening = true;
      setStatus(t('motorDictationListening'));
    } else if (state === 'unsupported') {
      isListening = false;
      setStatus(t('motorDictationUnsupported'), true);
    } else if (state === 'error') {
      isListening = false;
      setStatus(t('motorDictationError'), true);
    } else {
      isListening = false;
      setStatus(t('motorDictationIdle'));
    }
    syncDictationButtons();
  });

  syncDictationButtons();

  startBtn()?.addEventListener('click', () => {
    if (!isDictationSupported()) return;
    startDictation(getLocale());
    isListening = true;
    syncDictationButtons();
  });

  stopBtn()?.addEventListener('click', () => {
    stopDictation();
    isListening = false;
    syncDictationButtons();
  });

  structureBtn()?.addEventListener('click', () => {
    void runStructure();
  });

  document.getElementById('motor-clear-btn')?.addEventListener('click', () => {
    clearForm();
  });

  document.getElementById('motor-copy-note-btn')?.addEventListener('click', () => {
    void copyNote();
  });

  document.getElementById('motor-download-note-btn')?.addEventListener('click', () => {
    downloadNote();
  });

  transcriptEl()?.addEventListener('input', () => {
    setDictationTranscript(transcriptEl()?.value ?? '');
  });
}

export function refreshMotorLabels(): void {
  const map: Array<[string, Parameters<typeof t>[0]]> = [
    ['motor-ready-label', 'stateReady'],
    ['motor-intro', 'motorIntro'],
    ['motor-speech-note', 'motorSpeechDisclaimer'],
    ['motor-transcript-label', 'motorTranscriptLabel'],
    ['motor-start-dictation-btn', 'motorStartDictation'],
    ['motor-stop-dictation-btn', 'motorStopDictation'],
    ['motor-structure-btn', 'motorStructureBtn'],
    ['motor-note-title-label', 'motorNoteTitleLabel'],
    ['motor-note-body-label', 'motorNoteBodyLabel'],
    ['motor-clear-btn', 'motorClearBtn'],
    ['motor-copy-note-btn', 'copyResultBtn'],
    ['motor-download-note-btn', 'downloadResultBtn'],
    ['motor-writing-indicator', 'writing'],
    ['motor-form-heading', 'motorFormHeading'],
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }

  if (!isListening && isDictationSupported()) {
    setStatus(t('motorDictationIdle'));
  }
}
