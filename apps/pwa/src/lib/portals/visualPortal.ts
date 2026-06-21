import { streamDescribeImage } from '../ai/describeImage.js';
import type { HistoryEntry } from '../db/indexedDb.js';
import {
  imageErrorMessage,
  parseImageFile,
  revokeImagePreview,
  type ParsedImage,
} from '../imageContext.js';
import { getLocale, t } from '../i18n.js';
import { isPortalReady } from '../ui/modelStatus.js';
import { saveToHistory } from '../ui/historyPanel.js';

let abortController: AbortController | null = null;
let currentImage: ParsedImage | null = null;
let lastResultText = '';
let copyStatusTimer: ReturnType<typeof setTimeout> | null = null;

function imageInput(): HTMLInputElement | null {
  return document.getElementById('visual-image-input') as HTMLInputElement | null;
}

function cameraInput(): HTMLInputElement | null {
  return document.getElementById('visual-camera-input') as HTMLInputElement | null;
}

function imageHint(): HTMLElement | null {
  return document.getElementById('visual-image-hint');
}

function previewWrap(): HTMLElement | null {
  return document.getElementById('visual-preview-wrap');
}

function previewImg(): HTMLImageElement | null {
  return document.getElementById('visual-preview') as HTMLImageElement | null;
}

function previewCaption(): HTMLElement | null {
  return document.getElementById('visual-preview-caption');
}

function describeBtn(): HTMLButtonElement | null {
  return document.getElementById('describe-btn') as HTMLButtonElement | null;
}

function stopBtn(): HTMLButtonElement | null {
  return document.getElementById('visual-stop-btn') as HTMLButtonElement | null;
}

function resultRegion(): HTMLElement | null {
  return document.getElementById('visual-result-region');
}

function resultOutput(): HTMLElement | null {
  return document.getElementById('visual-result-output');
}

function resultActions(): HTMLElement | null {
  return document.getElementById('visual-result-actions');
}

function writingIndicator(): HTMLElement | null {
  return document.getElementById('visual-writing-indicator');
}

function copyStatus(): HTMLElement | null {
  return document.getElementById('visual-copy-status');
}

function setBusy(busy: boolean): void {
  describeBtn()?.toggleAttribute('disabled', busy);
  imageInput()?.toggleAttribute('disabled', busy);
  cameraInput()?.toggleAttribute('disabled', busy);

  const stop = stopBtn();
  if (stop) {
    stop.hidden = !busy;
    stop.disabled = !busy;
  }
  writingIndicator()?.toggleAttribute('hidden', !busy);
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

function setPreview(image: ParsedImage): void {
  revokeImagePreview(currentImage);
  currentImage = image;

  const wrap = previewWrap();
  const img = previewImg();
  const caption = previewCaption();

  if (wrap) wrap.removeAttribute('hidden');
  if (img) {
    img.src = image.previewUrl;
    img.alt = t('visualPreviewAlt', { name: image.fileName });
  }
  if (caption) {
    caption.textContent = image.truncated
      ? t('visualImageResized', { name: image.fileName })
      : image.fileName;
  }
}

function clearPreview(): void {
  revokeImagePreview(currentImage);
  currentImage = null;
  previewWrap()?.setAttribute('hidden', '');
  const img = previewImg();
  if (img) {
    img.removeAttribute('src');
    img.alt = '';
  }
  previewCaption()?.replaceChildren();
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

async function loadImageFromFile(file: File): Promise<void> {
  const hint = imageHint();
  const parsed = await parseImageFile(file);

  if (!parsed.ok) {
    if (hint) hint.textContent = imageErrorMessage(parsed.error, t);
    return;
  }

  setPreview(parsed.image);
  if (hint) hint.textContent = t('visualImageReady', { name: parsed.image.fileName });

  resultRegion()?.setAttribute('hidden', '');
  lastResultText = '';
  updateResultActions();
  describeBtn()?.focus();
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

  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const blob = new Blob([lastResultText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `accessportal-image-description-${stamp}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

async function runDescribe(): Promise<void> {
  if (!isPortalReady() || !currentImage) {
    alert(t('visualErrorNoImage'));
    return;
  }

  abortTask(false);
  abortController = new AbortController();
  setBusy(true);

  const region = resultRegion();
  const output = resultOutput();
  region?.removeAttribute('hidden');
  if (output) output.textContent = '';
  lastResultText = '';
  updateResultActions();

  let aborted = false;

  try {
    const locale = getLocale();
    const signal = abortController.signal;
    lastResultText = await streamDescribeImage(
      currentImage,
      locale,
      (accumulated) => {
        lastResultText = accumulated;
        if (output) output.textContent = accumulated;
        if (accumulated.trim()) updateResultActions();
      },
      signal,
    );

    await saveToHistory({
      mode: 'describe',
      sourceText: currentImage.fileName,
      resultText: lastResultText,
    });
  } catch (err) {
    if ((err as Error)?.name === 'AbortError') {
      aborted = true;
    } else {
      console.error('[AccessPortal] describe image', err);
      if (output) output.textContent = t('errorGeneric');
      lastResultText = t('errorGeneric');
    }
  } finally {
    abortController = null;
    setBusy(false);
    if (!aborted) updateResultActions();
  }
}

export function loadVisualHistoryEntry(entry: HistoryEntry): void {
  clearPreview();
  imageHint()?.replaceChildren();

  const region = resultRegion();
  const output = resultOutput();
  const caption = previewCaption();

  region?.removeAttribute('hidden');
  if (output) output.textContent = entry.resultText;
  lastResultText = entry.resultText;
  updateResultActions();

  previewWrap()?.removeAttribute('hidden');
  if (previewImg()) {
    previewImg()!.removeAttribute('src');
    previewImg()!.alt = '';
  }
  if (caption) {
    caption.textContent = t('visualHistoryFrom', { name: entry.sourceText });
  }
}

export function initVisualPortal(): void {
  imageInput()?.addEventListener('change', () => {
    const file = imageInput()?.files?.[0];
    if (imageInput()) imageInput()!.value = '';
    if (file) void loadImageFromFile(file);
  });

  cameraInput()?.addEventListener('change', () => {
    const file = cameraInput()?.files?.[0];
    if (cameraInput()) cameraInput()!.value = '';
    if (file) void loadImageFromFile(file);
  });

  describeBtn()?.addEventListener('click', () => {
    void runDescribe();
  });

  stopBtn()?.addEventListener('click', () => {
    abortTask(true);
  });

  document.getElementById('visual-copy-result-btn')?.addEventListener('click', () => {
    void copyResultToClipboard();
  });

  document.getElementById('visual-download-result-btn')?.addEventListener('click', () => {
    downloadResultAsTxt();
  });
}

export function refreshVisualLabels(): void {
  const map: Array<[string, Parameters<typeof t>[0]]> = [
    ['visual-intro', 'visualIntro'],
    ['visual-disclaimer', 'aiDisclaimer'],
    ['visual-upload-label', 'visualUploadBtn'],
    ['visual-camera-label', 'visualCameraBtn'],
    ['describe-btn', 'visualDescribeBtn'],
    ['visual-stop-btn', 'stopBtn'],
    ['visual-result-heading', 'visualResultTitle'],
    ['visual-writing-indicator', 'writing'],
    ['visual-copy-result-btn', 'copyResultBtn'],
    ['visual-download-result-btn', 'downloadResultBtn'],
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }

  if (currentImage && previewImg()) {
    previewImg()!.alt = t('visualPreviewAlt', { name: currentImage.fileName });
  }
}
