import './styles/base.css';
import './styles/profiles/cognitive.css';
import { applyStaticTranslations, getLocale, initI18n, setLocale, type Locale } from './lib/i18n.js';
import { initCognitivePortal, refreshCognitiveLabels } from './lib/portals/cognitivePortal.js';
import { initModelStatus } from './lib/ui/modelStatus.js';

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  try {
    await navigator.serviceWorker.register('./sw.js', { scope: './' });
  } catch (err) {
    console.warn('[AccessPortal] service worker registration failed', err);
  }
}

async function boot(): Promise<void> {
  await initI18n();
  const modelStatus = initModelStatus();
  initCognitivePortal();

  const localeSelect = document.getElementById('locale-select') as HTMLSelectElement | null;
  if (localeSelect) {
    localeSelect.value = getLocale();
    localeSelect.addEventListener('change', async () => {
      const next: Locale = localeSelect.value === 'es' ? 'es' : 'en';
      await setLocale(next);
      document.documentElement.lang = next;
      applyStaticTranslations(document);
      modelStatus.refreshTranslations();
      refreshCognitiveLabels();
    });
  }

  document.documentElement.lang = getLocale();
  applyStaticTranslations(document);

  void registerServiceWorker();
}

void boot();
