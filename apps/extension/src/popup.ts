import './popup.css';
import { applyPopupLabels, getLocale, pageErrorMessage, setLocale, t } from './lib/i18n.js';
import { openPrivacyPolicy } from './lib/privacyUrl.js';

const statusEl = document.getElementById('popup-status');
const localeSelect = document.getElementById('locale-select') as HTMLSelectElement | null;

function setStatus(text: string, isError = false): void {
  if (!statusEl) return;
  statusEl.textContent = text;
  statusEl.classList.toggle('is-error', isError);
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
        setStatus(t('statusReady'));
      } else {
        setStatus(t('statusSent'));
      }
    } else {
      setStatus(pageErrorMessage(String(response?.error ?? 'errorGeneric')), true);
    }
  } catch (err) {
    console.error('[AccessPortal popup]', err);
    setStatus(t('errorGeneric'), true);
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
      setLocale(localeSelect.value === 'es' ? 'es' : 'en');
      applyPopupLabels();
      setStatus(t('statusReady'));
    });
  }

  applyPopupLabels();
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

  document.getElementById('privacy-link')?.addEventListener('click', () => {
    openPrivacyPolicy(getLocale());
  });
}

void boot();
