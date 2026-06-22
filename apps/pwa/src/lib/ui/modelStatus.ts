import {
  checkAiReadiness,
  hasBuiltInAiApi,
  type AiReadiness,
} from '../ai/capabilities.js';
import {
  destroyWarmSession,
  getWarmSession,
  warmUpLanguageModel,
  type ModelUiState,
} from '../ai/languageModel.js';
import { applyStaticTranslations, getLocale, t, type MessageKey } from '../i18n.js';
import { peekPendingImport } from '../bridge/types.js';
import { showPortalShell, hidePortalShell } from '../profiles/selector.js';

export type ModelStatusController = {
  refreshTranslations: () => void;
  whenReady: () => Promise<void>;
};

const statusSection = () => document.getElementById('model-status');
const statusTitle = () => document.getElementById('status-title');
const statusDetail = () => document.getElementById('status-detail');
const progressWrap = () => document.getElementById('progress-wrap');
const progressBar = () => document.getElementById('download-progress') as HTMLProgressElement | null;
const requirements = () => document.getElementById('requirements');
const prepareBtn = () => document.getElementById('prepare-btn') as HTMLButtonElement | null;
const retryBtn = () => document.getElementById('retry-btn') as HTMLButtonElement | null;
const spinner = () => document.querySelector<HTMLElement>('.ap-spinner');
const docsLink = () => document.getElementById('docs-link');

let running = false;
let portalReady = false;
let readyResolve: (() => void) | null = null;
let readyPromise: Promise<void> | null = null;
let lastReadiness: AiReadiness | null = null;

function hasIncomingImport(): boolean {
  return peekPendingImport() !== null;
}

function statusPair(titleKey: MessageKey, detailKey: MessageKey): [MessageKey, MessageKey] {
  if (!hasIncomingImport()) return [titleKey, detailKey];
  if (titleKey === 'stateChecking') return [titleKey, 'stateCheckingImportDetail'];
  if (titleKey === 'stateDownloading') return [titleKey, 'stateDownloadingImportDetail'];
  return [titleKey, detailKey];
}

function resetReadyPromise(): void {
  readyPromise = new Promise<void>((resolve) => {
    readyResolve = resolve;
  });
}

function markPortalReady(): void {
  if (portalReady) return;
  portalReady = true;
  setUiState('ready');
  setStatus('stateReady', 'stateReadyDetail');
  statusSection()?.setAttribute('hidden', '');
  showPortalShell();
  readyResolve?.();
}

function setUiState(state: ModelUiState): void {
  const section = statusSection();
  section?.setAttribute('data-state', state);
  section?.setAttribute(
    'aria-busy',
    state === 'checking' || state === 'downloading' ? 'true' : 'false',
  );

  const spin = spinner();
  if (spin) spin.hidden = state !== 'checking' && state !== 'downloading';

  const pw = progressWrap();
  if (pw) pw.hidden = state !== 'downloading';

  const req = requirements();
  if (req) req.hidden = state !== 'unavailable' && state !== 'no-api';

  const docs = docsLink();
  if (docs) docs.hidden = state !== 'unavailable' && state !== 'no-api';

  const prep = prepareBtn();
  if (prep) prep.hidden = state !== 'downloadable';

  const retry = retryBtn();
  if (retry) {
    retry.hidden = state !== 'unavailable' && state !== 'no-api' && state !== 'downloadable';
  }

  if (statusDetail()) {
    const detail = statusDetail()!;
    detail.hidden = state === 'ready';
  }
}

function setStatus(titleKey: MessageKey, detailKey: MessageKey): void {
  const title = statusTitle();
  const detail = statusDetail();
  if (title) title.textContent = t(titleKey);
  if (detail) detail.textContent = t(detailKey);
}

function setProgress(ratio: number): void {
  const bar = progressBar();
  if (!bar) return;
  const pct = Math.round(ratio * 100);
  bar.value = pct;
  bar.textContent = `${pct}%`;
}

async function runPrepareFlow(): Promise<void> {
  if (running || portalReady) return;
  running = true;
  prepareBtn()?.setAttribute('disabled', 'true');
  retryBtn()?.setAttribute('disabled', 'true');

  const prepareTimeout = window.setTimeout(() => {
    if (!portalReady && running) {
      destroyWarmSession();
      setUiState('unavailable');
      setStatus('statePrepareTimeout', 'statePrepareTimeoutDetail');
      running = false;
      prepareBtn()?.removeAttribute('disabled');
      retryBtn()?.removeAttribute('disabled');
    }
  }, 120_000);

  try {
    setUiState('downloading');
    setStatus(...statusPair('stateDownloading', 'stateDownloadingDetail'));
    setProgress(0);

    destroyWarmSession();
    await warmUpLanguageModel((ratio) => {
      setUiState('downloading');
      setProgress(ratio);
    });

    markPortalReady();
  } catch (err) {
    console.error('[AccessPortal] model warm-up', err);
    setUiState('unavailable');
    setStatus('stateUnavailable', 'stateUnavailableDetail');
  } finally {
    window.clearTimeout(prepareTimeout);
    running = false;
    prepareBtn()?.removeAttribute('disabled');
    retryBtn()?.removeAttribute('disabled');
  }
}

async function runCheckFlow(): Promise<void> {
  if (running || portalReady) return;
  running = true;
  retryBtn()?.setAttribute('disabled', 'true');

  const locale = getLocale();
  let checkWatchdog: ReturnType<typeof window.setTimeout> | undefined;

  try {
    setUiState('checking');
    setStatus(...statusPair('stateChecking', 'stateCheckingDetail'));
    statusSection()?.removeAttribute('hidden');
    hidePortalShell();

    checkWatchdog = window.setTimeout(() => {
      if (portalReady || statusSection()?.getAttribute('data-state') !== 'checking') return;
      setUiState('downloadable');
      setStatus('stateCheckTimeout', 'stateCheckTimeoutDetail');
      lastReadiness = {
        hasAnyApi: hasBuiltInAiApi(),
        languageModel: 'unavailable',
        summarizer: 'unavailable',
        combined: 'downloadable',
        timedOut: true,
      };
    }, 18_000);

    if (!hasBuiltInAiApi()) {
      setUiState('no-api');
      setStatus('stateNoApi', 'stateNoApiDetail');
      return;
    }

    lastReadiness = await checkAiReadiness(locale);
    const { combined, timedOut } = lastReadiness;

    if (timedOut && hasBuiltInAiApi()) {
      setUiState('downloadable');
      setStatus('stateCheckTimeout', 'stateCheckTimeoutDetail');
      return;
    }

    if (combined === 'unavailable') {
      setUiState('unavailable');
      setStatus('stateUnavailable', 'stateUnavailableDetail');
      return;
    }

    if (combined === 'available' && getWarmSession()) {
      markPortalReady();
      return;
    }

    if (combined === 'available') {
      // runPrepareFlow() bails when `running` is true — release the check lock first.
      running = false;
      await runPrepareFlow();
      return;
    }

    setUiState('downloadable');
    setStatus('stateDownloadable', 'stateDownloadableDetail');
  } catch (err) {
    console.error('[AccessPortal] availability check', err);
    setUiState('unavailable');
    setStatus('stateUnavailable', 'stateUnavailableDetail');
  } finally {
    if (checkWatchdog) window.clearTimeout(checkWatchdog);
    running = false;
    retryBtn()?.removeAttribute('disabled');
  }
}

export function initModelStatus(): ModelStatusController {
  resetReadyPromise();

  prepareBtn()?.addEventListener('click', () => {
    void runPrepareFlow();
  });

  retryBtn()?.addEventListener('click', () => {
    portalReady = false;
    destroyWarmSession();
    resetReadyPromise();
    void runCheckFlow();
  });

  void runCheckFlow();

  return {
    refreshTranslations: () => {
      applyStaticTranslations(document);
      const state = statusSection()?.getAttribute('data-state') as ModelUiState | null;
      const map: Partial<Record<ModelUiState, [MessageKey, MessageKey]>> = {
        checking: ['stateChecking', 'stateCheckingDetail'],
        downloadable: ['stateDownloadable', 'stateDownloadableDetail'],
        downloading: ['stateDownloading', 'stateDownloadingDetail'],
        ready: ['stateReady', 'stateReadyDetail'],
        unavailable: ['stateUnavailable', 'stateUnavailableDetail'],
        'no-api': ['stateNoApi', 'stateNoApiDetail'],
      };
      if (state === 'downloadable' && lastReadiness?.timedOut) {
        setStatus('stateCheckTimeout', 'stateCheckTimeoutDetail');
      } else if (state && map[state]) {
        const [title, detail] = map[state]!;
        setStatus(...statusPair(title, detail));
      }
    },
    whenReady: () => readyPromise ?? Promise.resolve(),
  };
}

export function isPortalReady(): boolean {
  return portalReady;
}

export function getLastReadiness(): AiReadiness | null {
  return lastReadiness;
}
