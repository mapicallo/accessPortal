import { streamEasyRead } from '../ai/easyRead.js';
import {
  getSelectionOrAll,
  MAX_INPUT_CHARS,
  truncateForModel,
} from '../ai/modelOptions.js';
import { streamSummarizeKeyPoints } from '../ai/summarizer.js';
import { getLocale, t } from '../i18n.js';
import { isPortalReady } from '../ui/modelStatus.js';

let abortController: AbortController | null = null;

function sourceTextarea(): HTMLTextAreaElement | null {
  return document.getElementById('source-text') as HTMLTextAreaElement | null;
}

function charHint(): HTMLElement | null {
  return document.getElementById('char-hint');
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

function writingIndicator(): HTMLElement | null {
  return document.getElementById('writing-indicator');
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
  const stop = stopBtn();
  if (stop) {
    stop.hidden = !busy;
    stop.disabled = !busy;
  }
  writingIndicator()?.toggleAttribute('hidden', !busy);
}

function cancelRunning(): void {
  abortController?.abort();
  abortController = null;
  setBusy(false);
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

async function runTask(
  mode: 'summary' | 'easyRead',
  titleKey: 'summaryResultTitle' | 'easyReadResultTitle',
): Promise<void> {
  if (!isPortalReady()) return;

  const raw =
    mode === 'easyRead' ? getInputText(true) : getInputText(false);
  if (!raw) {
    alert(t('errorEmpty'));
    return;
  }

  const { text, truncated } = truncateForModel(raw);
  cancelRunning();
  abortController = new AbortController();
  setBusy(true);

  const region = resultRegion();
  const output = resultOutput();
  const heading = resultHeading();
  const hint = charHint();

  region?.removeAttribute('hidden');
  if (heading) heading.textContent = t(titleKey);
  if (output) output.textContent = '';

  if (truncated && hint) {
    hint.textContent = t('charTruncated', { max: MAX_INPUT_CHARS });
    hint.classList.add('is-warn');
  }

  try {
    const locale = getLocale();
    const signal = abortController.signal;
    const onUpdate = (accumulated: string) => {
      if (output) output.textContent = accumulated;
    };

    if (mode === 'summary') {
      await streamSummarizeKeyPoints(text, locale, onUpdate, signal);
    } else {
      await streamEasyRead(text, locale, onUpdate, signal);
    }
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') return;
    console.error('[AccessPortal] cognitive task', err);
    if (output) output.textContent = t('errorGeneric');
  } finally {
    abortController = null;
    setBusy(false);
    updateCharHint();
  }
}

export function initCognitivePortal(): void {
  const ta = sourceTextarea();
  ta?.addEventListener('input', updateCharHint);
  updateCharHint();

  summarizeBtn()?.addEventListener('click', () => {
    void runTask('summary', 'summaryResultTitle');
  });

  easyReadBtn()?.addEventListener('click', () => {
    void runTask('easyRead', 'easyReadResultTitle');
  });

  stopBtn()?.addEventListener('click', () => {
    cancelRunning();
  });
}

export function refreshCognitiveLabels(): void {
  updateCharHint();
  const heading = resultHeading();
  if (heading && !resultRegion()?.hasAttribute('hidden')) {
    /* keep current result title if showing */
  }
}
