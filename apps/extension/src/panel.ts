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
import { A11Y_SYNC_KEY, DEFAULT_A11Y, type A11yLayerSettings } from './lib/messages.js';

/** Popup windows mis-report 100vh on first paint; pin layout to innerHeight. */
function syncPopupViewport(): void {
  const h = window.innerHeight;
  const w = window.innerWidth;
  if (h < 1 || w < 1) return;
  document.documentElement.style.height = `${h}px`;
  document.body.style.height = `${h}px`;
}

function scheduleLayoutSync(): void {
  syncPopupViewport();
  requestAnimationFrame(() => {
    syncPopupViewport();
    requestAnimationFrame(syncPopupViewport);
  });
}
const statusEl = document.getElementById('panel-status');
const inPageStatusEl = document.getElementById('in-page-status');
const readyStrip = document.getElementById('apx-ready-strip');
const readyStripLabel = document.getElementById('ready-strip-label');
const pwaTabNotice = document.getElementById('pwa-tab-notice');
const localeSelect = document.getElementById('locale-select') as HTMLSelectElement | null;

let flashTimer: ReturnType<typeof window.setTimeout> | null = null;

let pwaReachable = false;
let pwaChecked = false;
let inPageEnabled = false;

const inPageEnable = document.getElementById('in-page-enable') as HTMLInputElement | null;
const a11yFieldset = document.getElementById('a11y-fieldset') as HTMLFieldSetElement | null;
const a11yDyslexic = document.getElementById('a11y-dyslexic') as HTMLInputElement | null;
const a11yContrast = document.getElementById('a11y-contrast') as HTMLInputElement | null;
const a11yScale = document.getElementById('a11y-scale') as HTMLSelectElement | null;

function setInPageStatus(text: string, tone: 'idle' | 'error' | 'success' = 'idle'): void {
  if (!inPageStatusEl) return;
  inPageStatusEl.textContent = text;
  inPageStatusEl.classList.toggle('is-error', tone === 'error');
  inPageStatusEl.classList.toggle('is-success', tone === 'success');
}

function readA11yFromUi(): A11yLayerSettings {
  const scaleRaw = Number(a11yScale?.value ?? 1);
  const fontScale = scaleRaw === 1.15 || scaleRaw === 1.3 ? scaleRaw : 1;
  return {
    dyslexic: Boolean(a11yDyslexic?.checked),
    highContrast: Boolean(a11yContrast?.checked),
    fontScale,
  };
}

function applyA11yToUi(a11y: A11yLayerSettings): void {
  if (a11yDyslexic) a11yDyslexic.checked = a11y.dyslexic;
  if (a11yContrast) a11yContrast.checked = a11y.highContrast;
  if (a11yScale) a11yScale.value = String(a11y.fontScale);
}

async function loadA11yPrefs(): Promise<A11yLayerSettings> {
  try {
    const data = await chrome.storage.sync.get(A11Y_SYNC_KEY);
    const raw = data[A11Y_SYNC_KEY];
    if (!raw || typeof raw !== 'object') return { ...DEFAULT_A11Y };
    const prefs = raw as Partial<A11yLayerSettings>;
    return {
      dyslexic: Boolean(prefs.dyslexic),
      highContrast: Boolean(prefs.highContrast),
      fontScale: prefs.fontScale === 1.15 || prefs.fontScale === 1.3 ? prefs.fontScale : 1,
    };
  } catch {
    return { ...DEFAULT_A11Y };
  }
}

async function refreshInPageState(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'ap:get-in-page-state' });
    inPageEnabled = Boolean(response?.enabled);
    if (inPageEnable) inPageEnable.checked = inPageEnabled;
    if (a11yFieldset) a11yFieldset.disabled = !inPageEnabled;
    if (!response?.tabId) {
      setInPageStatus(t('inPageNoTab'), 'error');
    } else if (inPageEnabled) {
      setInPageStatus(t('inPageEnabled'), 'success');
    } else {
      setInPageStatus('');
    }
  } catch {
    setInPageStatus(t('errorGeneric'), 'error');
  }
}

async function pushA11yToPage(): Promise<void> {
  if (!inPageEnabled) return;
  const a11y = readA11yFromUi();
  await chrome.storage.sync.set({ [A11Y_SYNC_KEY]: a11y });
  await chrome.runtime.sendMessage({ type: 'ap:apply-a11y-layer', a11y });
}

async function setInPageEnabled(next: boolean): Promise<void> {
  if (inPageEnable) inPageEnable.disabled = true;
  try {
    if (next) {
      const response = await chrome.runtime.sendMessage({
        type: 'ap:enable-in-page',
        locale: getLocale(),
      });
      if (!response?.ok) {
        if (inPageEnable) inPageEnable.checked = false;
        setInPageStatus(pageErrorMessage(String(response?.error ?? 'errorGeneric')), 'error');
        return;
      }
      inPageEnabled = true;
      if (a11yFieldset) a11yFieldset.disabled = false;
      await pushA11yToPage();
      setInPageStatus(t('inPageEnabled'), 'success');
    } else {
      await chrome.runtime.sendMessage({ type: 'ap:disable-in-page' });
      inPageEnabled = false;
      if (a11yFieldset) a11yFieldset.disabled = true;
      setInPageStatus(t('inPageDisabled'));
    }
  } catch {
    setInPageStatus(t('errorGeneric'), 'error');
  } finally {
    if (inPageEnable) inPageEnable.disabled = false;
  }
}

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
  for (const id of ['open-pwa-btn', 'use-page-btn', 'use-selection-btn', 'focus-pwa-btn']) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (btn) btn.disabled = busy || (id !== 'open-pwa-btn' && id !== 'focus-pwa-btn' && !pwaReachable && pwaChecked);
  }
}

function hidePwaTabNotice(): void {
  pwaTabNotice?.setAttribute('hidden', '');
  pwaTabNotice?.classList.remove('is-flash');
  if (flashTimer) {
    window.clearTimeout(flashTimer);
    flashTimer = null;
  }
}

function showPwaTabNotice(): void {
  if (!pwaTabNotice) return;
  applyPanelLabels();
  pwaTabNotice.removeAttribute('hidden');
  pwaTabNotice.classList.remove('is-flash');
  void pwaTabNotice.offsetWidth;
  pwaTabNotice.classList.add('is-flash');
  if (flashTimer) window.clearTimeout(flashTimer);
  flashTimer = window.setTimeout(() => {
    pwaTabNotice?.classList.remove('is-flash');
    flashTimer = null;
  }, 2600);
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
      setStatus(t('statusPwaOfflineInPageOk'), 'idle');
    }
  } catch {
    pwaChecked = true;
    setReadyStrip('unavailable');
    setStatus(t('errorGeneric'), 'error');
  }
  setBusy(false);
  scheduleLayoutSync();
}

async function send(type: 'ap:open-pwa' | 'ap:use-page' | 'ap:use-selection'): Promise<void> {
  setBusy(true);
  if (type !== 'ap:open-pwa') hidePwaTabNotice();
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
        hidePwaTabNotice();
        setStatus(t('statusOpenPwa'), 'success');
      } else {
        setStatus(t(response.firstTimeAi ? 'statusSentFirstTime' : 'statusSent'), 'success');
        showPwaTabNotice();
      }
    } else {
      hidePwaTabNotice();
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
  scheduleLayoutSync();
  window.addEventListener('resize', syncPopupViewport);
  const navLang = navigator.language.toLowerCase();
  setLocale(navLang.startsWith('es') ? 'es' : 'en');

  if (localeSelect) {
    localeSelect.value = getLocale();
    localeSelect.addEventListener('change', () => {
      const next: Locale = localeSelect.value === 'es' ? 'es' : 'en';
      setLocale(next);
      applyPanelLabels();
      void refreshPwaStatus();
      void refreshInPageState();
    });
  }

  applyPanelLabels();
  setStatus('');

  void loadA11yPrefs().then(applyA11yToUi);
  void refreshPwaStatus().then(scheduleLayoutSync);
  void refreshInPageState();

  document.getElementById('open-pwa-btn')?.addEventListener('click', () => {
    void send('ap:open-pwa');
  });

  document.getElementById('focus-pwa-btn')?.addEventListener('click', () => {
    void chrome.runtime.sendMessage({ type: 'ap:focus-pwa' });
  });

  document.getElementById('use-page-btn')?.addEventListener('click', () => {
    if (!window.confirm(t('confirmPage'))) {
      setStatus(t('statusCancelled'));
      return;
    }
    void send('ap:use-page');
  });

  document.getElementById('use-selection-btn')?.addEventListener('click', () => {
    if (!window.confirm(t('confirmSelection'))) {
      setStatus(t('statusCancelled'));
      return;
    }
    void send('ap:use-selection');
  });

  document.getElementById('privacy-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    openPrivacyPolicy(getLocale());
  });

  inPageEnable?.addEventListener('change', () => {
    void setInPageEnabled(Boolean(inPageEnable.checked));
  });

  for (const id of ['a11y-dyslexic', 'a11y-contrast']) {
    document.getElementById(id)?.addEventListener('change', () => {
      void pushA11yToPage();
    });
  }

  a11yScale?.addEventListener('change', () => {
    void pushA11yToPage();
  });

  document.getElementById('restore-page-btn')?.addEventListener('click', () => {
    void chrome.runtime.sendMessage({ type: 'ap:restore-page' }).then((response) => {
      if (response?.ok) setInPageStatus(t('inPageDisabled'));
      else setInPageStatus(pageErrorMessage(String(response?.error ?? 'errorGeneric')), 'error');
    });
  });
}

void boot();
