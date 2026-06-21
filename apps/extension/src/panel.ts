import './panel.css';
import {
  applyPanelLabels,
  getLocale,
  pageErrorMessage,
  setLocale,
  t,
  type Locale,
  type MessageKey,
} from './lib/i18n.js';
import { openPrivacyPolicy } from './lib/privacyUrl.js';

const statusEl = document.getElementById('panel-status');
const readyStrip = document.getElementById('apx-ready-strip');
const readyStripLabel = document.getElementById('ready-strip-label');
const localeSelect = document.getElementById('locale-select') as HTMLSelectElement | null;

let pwaReachable = false;
let pwaChecked = false;

function setStatus(text: string, tone: 'idle' | 'error' | 'success' = 'idle'): void {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle('is-error', tone === 'error');
  statusEl.classList.toggle('is-success', tone === 'success');
}

function setReadyStrip(state: 'checking' | 'ready' | 'unavailable'): void {
  const labelKey: MessageKey =
    state === 'checking'
      ? 'readyStripChecking'
      : state === 'ready'
        ? 'readyStripReady'
        : 'readyStripUnavailable';
  if (readyStripLabel) readyStripLabel.textContent = t(labelKey);
  readyStrip?.classList.toggle('is-checking', state === 'checking');
  readyStrip?.classList.toggle('is-unavailable', state === 'unavailable');
}

function setBusy(busy: boolean): void {
  for (const id of ['open-pwa-btn', 'use-page-btn', 'use-selection-btn']) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (btn) btn.disabled = busy || (id !== 'open-pwa-btn' && !pwaReachable && pwaChecked);
  }
}

async function refreshPwaStatus(): Promise<void> {
  setReadyStrip('checking');
  try {
    const response = await chrome.runtime.sendMessage({ type: 'ap:check-pwa' });
    pwaReachable = Boolean(response?.reachable);
    pwaChecked = true;
    if (pwaReachable) {
      setReadyStrip('ready');
      setStatus(t('statusReady'));
    } else {
      setReadyStrip('unavailable');
      setStatus(
        pageErrorMessage('pwa_unreachable', {
          url: String(response?.pwaUrl ?? ''),
        }),
        'error',
      );
    }
  } catch {
    pwaChecked = true;
    setReadyStrip('unavailable');
    setStatus(t('errorGeneric'), 'error');
  }
  setBusy(false);
}

async function send(type: 'ap:open-pwa' | 'ap:use-page' | 'ap:use-selection'): Promise<void> {
  setBusy(true);
  if (type !== 'ap:open-pwa') setStatus(t('statusSending'));

  try {
    const response = await chrome.runtime.sendMessage({
      type,
      locale: getLocale(),
    });
    if (response?.ok) {
      pwaReachable = true;
      setReadyStrip('ready');
      if (type === 'ap:open-pwa') {
        setStatus(t('statusOpenPwa'), 'success');
      } else {
        setStatus(t(response.firstTimeAi ? 'statusSentFirstTime' : 'statusSent'), 'success');
      }
    } else {
      setStatus(
        pageErrorMessage(String(response?.error ?? 'errorGeneric'), {
          url: String(response?.pwaUrl ?? ''),
        }),
        'error',
      );
      if (response?.error === 'pwa_unreachable') {
        pwaReachable = false;
        setReadyStrip('unavailable');
      }
    }
  } catch (err) {
    console.error('[AccessPortal panel]', err);
    setStatus(t('errorGeneric'), 'error');
  } finally {
    setBusy(false);
  }
}

async function boot(): Promise<void> {
  const navLang = navigator.language.toLowerCase();
  setLocale(navLang.startsWith('es') ? 'es' : 'en');

  if (localeSelect) {
    localeSelect.value = getLocale();
    localeSelect.addEventListener('change', () => {
      const next: Locale = localeSelect.value === 'es' ? 'es' : 'en';
      setLocale(next);
      applyPanelLabels();
      void refreshPwaStatus();
    });
  }

  applyPanelLabels();
  setStatus('');

  await chrome.runtime.sendMessage({ type: 'ap:remember-tab' });
  void refreshPwaStatus();

  document.getElementById('open-pwa-btn')?.addEventListener('click', () => {
    void send('ap:open-pwa');
  });

  document.getElementById('use-page-btn')?.addEventListener('click', () => {
    void send('ap:use-page');
  });

  document.getElementById('use-selection-btn')?.addEventListener('click', () => {
    void send('ap:use-selection');
  });

  document.getElementById('privacy-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    openPrivacyPolicy(getLocale());
  });
}

void boot();
