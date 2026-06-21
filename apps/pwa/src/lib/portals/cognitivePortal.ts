import { streamEasyRead } from '../ai/easyRead.js';
import {
  getSelectionOrAll,
  MAX_INPUT_CHARS,
  truncateForModel,
} from '../ai/modelOptions.js';
import { streamSummarizeKeyPoints } from '../ai/summarizer.js';
import type { HistoryEntry } from '../db/indexedDb.js';
import { documentErrorMessage, parseDocumentFile } from '../documentContext.js';
import { getLocale, t } from '../i18n.js';
import type { HistoryMode } from '../profiles/types.js';
import { isPortalReady } from '../ui/modelStatus.js';
import { saveToHistory } from '../ui/historyPanel.js';

let abortController: AbortController | null = null;
let lastResultText = '';
let lastResultMode: HistoryMode | null = null;
let copyStatusTimer: ReturnType<typeof setTimeout> | null = null;

function sourceTextarea(): HTMLTextAreaElement | null {
  return document.getElementById('source-text') as HTMLTextAreaElement | null;
}

function charHint(): HTMLElement | null {
  return document.getElementById('char-hint');
}

function documentHint(): HTMLElement | null {
  return document.getElementById('document-hint');
}

function documentInput(): HTMLInputElement | null {
  return document.getElementById('document-input') as HTMLInputElement | null;
}

function attachLabel(): HTMLLabelElement | null {
  return document.querySelector<HTMLLabelElement>('label[for="document-input"]');
}

function resultRegion(): HTMLElement | null {
  return document.getElementById('result-region');
}

function resultOutput(): HTMLElement | null {
  return document.getElementById('result-output');
}

function resultHeading(): HTMLElement | null {
  return document.getElementById('result-heading');
}

function resultActions(): HTMLElement | null {
  return document.getElementById('result-actions');
}

function writingIndicator(): HTMLElement | null {
  return document.getElementById('writing-indicator');
}

function copyStatus(): HTMLElement | null {
  return document.getElementById('copy-status');
}

function summarizeBtn(): HTMLButtonElement | null {
  return document.getElementById('summarize-btn') as HTMLButtonElement | null;
}

function easyReadBtn(): HTMLButtonElement | null {
  return document.getElementById('easy-read-btn') as HTMLButtonElement | null;
}

function stopBtn(): HTMLButtonElement | null {
  return document.getElementById('stop-btn') as HTMLButtonElement | null;
}

function updateCharHint(): void {
  const ta = sourceTextarea();
  const hint = charHint();
  if (!ta || !hint) return;

  const len = ta.value.length;
  hint.textContent = t('charCount', { count: len });
  hint.classList.toggle('is-warn', len > MAX_INPUT_CHARS);
}

function setBusy(busy: boolean): void {
  summarizeBtn()?.toggleAttribute('disabled', busy);
  easyReadBtn()?.toggleAttribute('disabled', busy);
  attachLabel()?.classList.toggle('is-disabled', busy);
  documentInput()?.toggleAttribute('disabled', busy);

  const stop = stopBtn();
  if (stop) {
    stop.hidden = !busy;
    stop.disabled = !busy;
  }
  writingIndicator()?.toggleAttribute('hidden', !busy);
}

function abortTask(showStoppedMessage: boolean): void {
  const hadPartial = showStoppedMessage && Boolean(lastResultText.trim());
  abortController?.abort();
  abortController = null;
  setBusy(false);

  if (hadPartial) {
    const status = copyStatus();
    if (status) {
      status.textContent = t('stoppedPartial');
      if (copyStatusTimer) clearTimeout(copyStatusTimer);
      copyStatusTimer = setTimeout(() => {
        if (status.textContent === t('stoppedPartial')) status.textContent = '';
      }, 4000);
    }
    updateResultActions();
  }
}

function cancelRunning(): void {
  abortTask(true);
}

function getInputText(requireSelectionForEasyRead: boolean): string | null {
  const ta = sourceTextarea();
  if (!ta) return null;

  const raw = requireSelectionForEasyRead
    ? (() => {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        if (start === end) return '';
        return ta.value.slice(start, end).trim();
      })()
    : getSelectionOrAll(ta);

  if (!raw) return null;
  return raw;
}

function updateResultActions(): void {
  const actions = resultActions();
  if (!actions) return;
  if (lastResultText.trim()) {
    actions.removeAttribute('hidden');
  } else {
    actions.setAttribute('hidden', '');
  }
}

function showResult(mode: HistoryMode, resultText: string): void {
  lastResultMode = mode;
  lastResultText = resultText;

  const region = resultRegion();
  const output = resultOutput();
  const heading = resultHeading();

  region?.removeAttribute('hidden');
  if (heading) {
    heading.textContent =
      mode === 'summary' ? t('summaryResultTitle') : t('easyReadResultTitle');
  }
  if (output) output.textContent = resultText;
  updateResultActions();

  const status = copyStatus();
  if (status) status.textContent = '';
}

async function copyResultToClipboard(): Promise<void> {
  const status = copyStatus();
  if (!lastResultText.trim()) return;

  try {
    await navigator.clipboard.writeText(lastResultText);
    if (status) status.textContent = t('copyResultDone');
  } catch {
    if (status) status.textContent = t('copyResultFailed');
  }

  if (copyStatusTimer) clearTimeout(copyStatusTimer);
  copyStatusTimer = setTimeout(() => {
    if (status) status.textContent = '';
  }, 3000);
}

function downloadResultAsTxt(): void {
  if (!lastResultText.trim()) return;

  const prefix =
    lastResultMode === 'summary'
      ? 'accessportal-summary'
      : lastResultMode === 'easyRead'
        ? 'accessportal-easy-read'
        : 'accessportal-result';
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const blob = new Blob([lastResultText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${prefix}-${stamp}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function attachDocumentFromFile(file: File): Promise<void> {
  const hint = documentHint();
  const ta = sourceTextarea();
  if (!ta) return;

  const parsed = await parseDocumentFile(file);
  if (!parsed.ok) {
    if (hint) hint.textContent = documentErrorMessage(parsed.error, t);
    return;
  }

  ta.value = parsed.text;
  updateCharHint();

  if (hint) {
    let msg = t('documentAttachedHint', { name: parsed.fileName });
    if (parsed.truncated) {
      msg += ` ${t('charTruncated', { max: MAX_INPUT_CHARS })}`;
    }
    hint.textContent = msg;
  }

  resultRegion()?.setAttribute('hidden', '');
  lastResultText = '';
  lastResultMode = null;
  updateResultActions();
  ta.focus();
}

export function loadHistoryEntry(entry: HistoryEntry): void {
  const ta = sourceTextarea();
  if (ta) ta.value = entry.sourceText;
  updateCharHint();
  documentHint()?.replaceChildren();
  showResult(entry.mode, entry.resultText);
  ta?.focus();
}

async function runTask(
  mode: 'summary' | 'easyRead',
  titleKey: 'summaryResultTitle' | 'easyReadResultTitle',
): Promise<void> {
  if (!isPortalReady()) return;

  const raw = mode === 'easyRead' ? getInputText(true) : getInputText(false);
  if (!raw) {
    alert(t('errorEmpty'));
    return;
  }

  const { text, truncated } = truncateForModel(raw);
  abortTask(false);
  abortController = new AbortController();
  setBusy(true);

  const region = resultRegion();
  const output = resultOutput();
  const heading = resultHeading();
  const hint = charHint();

  region?.removeAttribute('hidden');
  if (heading) heading.textContent = t(titleKey);
  if (output) output.textContent = '';
  lastResultText = '';
  lastResultMode = mode;
  updateResultActions();

  if (truncated && hint) {
    hint.textContent = t('charTruncated', { max: MAX_INPUT_CHARS });
    hint.classList.add('is-warn');
  }

  let resultText = '';
  let aborted = false;

  try {
    const locale = getLocale();
    const signal = abortController.signal;
    const onUpdate = (accumulated: string) => {
      resultText = accumulated;
      lastResultText = accumulated;
      if (output) output.textContent = accumulated;
      if (accumulated.trim()) updateResultActions();
    };

    if (mode === 'summary') {
      resultText = await streamSummarizeKeyPoints(text, locale, onUpdate, signal);
    } else {
      resultText = await streamEasyRead(text, locale, onUpdate, signal);
    }

    lastResultText = resultText;
    await saveToHistory({ mode, sourceText: text, resultText });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') {
      aborted = true;
    } else {
      console.error('[AccessPortal] cognitive task', err);
      if (output) output.textContent = t('errorGeneric');
      lastResultText = t('errorGeneric');
    }
  } finally {
    abortController = null;
    setBusy(false);
    updateCharHint();
    if (!aborted) updateResultActions();
  }
}

export function initCognitivePortal(): void {
  const ta = sourceTextarea();
  ta?.addEventListener('input', () => {
    updateCharHint();
    documentHint()?.replaceChildren();
  });
  updateCharHint();

  const docInput = documentInput();
  docInput?.addEventListener('change', () => {
    const file = docInput.files?.[0];
    docInput.value = '';
    if (file) void attachDocumentFromFile(file);
  });

  const label = attachLabel();
  if (label) label.title = t('attachDocumentHint');

  summarizeBtn()?.addEventListener('click', () => {
    void runTask('summary', 'summaryResultTitle');
  });

  easyReadBtn()?.addEventListener('click', () => {
    void runTask('easyRead', 'easyReadResultTitle');
  });

  stopBtn()?.addEventListener('click', () => {
    cancelRunning();
  });

  document.getElementById('copy-result-btn')?.addEventListener('click', () => {
    void copyResultToClipboard();
  });

  document.getElementById('download-result-btn')?.addEventListener('click', () => {
    downloadResultAsTxt();
  });
}

export function refreshCognitiveLabels(): void {
  updateCharHint();
  const label = attachLabel();
  if (label) {
    label.title = t('attachDocumentHint');
    const span = document.getElementById('attach-document-label');
    if (span) span.textContent = t('attachDocument');
  }
}
