import './panel.css';
import {
  applyPanelLabels,
  getLocale,
  pageErrorMessage,
  setLocale,
  t,
  type Locale,
} from './lib/i18n.js';
import { openPrivacyPolicy } from './lib/privacyUrl.js';

const statusEl = document.getElementById('panel-status');
const localeSelect = document.getElementById('locale-select') as HTMLSelectElement | null;

function setStatus(text: string, tone: 'idle' | 'error' | 'success' = 'idle'): void {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle('is-error', tone === 'error');
  statusEl.classList.toggle('is-success', tone === 'success');
}

function setBusy(busy: boolean): void {
  for (const id of ['open-pwa-btn', 'use-page-btn', 'use-selection-btn']) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (btn) btn.disabled = busy;
  }
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
      if (type === 'ap:open-pwa') {
        setStatus(t('statusOpenPwa'), 'success');
      } else {
        setStatus(t('statusSent'), 'success');
      }
    } else {
      setStatus(pageErrorMessage(String(response?.error ?? 'errorGeneric')), 'error');
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
      setStatus(t('statusReady'));
    });
  }

  applyPanelLabels();
  setStatus(t('statusReady'));

  await chrome.runtime.sendMessage({ type: 'ap:remember-tab' });

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
