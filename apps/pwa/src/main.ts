import './styles/base.css';
import './styles/profiles/cognitive.css';
import './styles/profiles/visual.css';
import type { HistoryEntry } from './lib/db/indexedDb.js';
import { initDb } from './lib/db/indexedDb.js';
import {
  applyStaticTranslations,
  getLocale,
  initI18nFromPreferences,
  setLocale,
  type Locale,
} from './lib/i18n.js';
import {
  loadHistoryEntry as loadCognitiveHistoryEntry,
  initCognitivePortal,
  refreshCognitiveLabels,
} from './lib/portals/cognitivePortal.js';
import {
  initVisualPortal,
  loadVisualHistoryEntry,
  refreshVisualLabels,
} from './lib/portals/visualPortal.js';
import {
  getPreferences,
  initPreferences,
  setFontSizePreference,
  setLocalePreference,
} from './lib/profiles/preferences.js';
import { initProfileSelector, refreshProfileLabels, selectProfile } from './lib/profiles/selector.js';
import { initHistoryPanel, refreshHistoryLabels } from './lib/ui/historyPanel.js';
import { initModelStatus } from './lib/ui/modelStatus.js';
import type { FontSizeId } from './lib/profiles/types.js';

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV) return;

  try {
    await navigator.serviceWorker.register('./sw.js', { scope: './' });
  } catch (err) {
    console.warn('[AccessPortal] service worker registration failed', err);
  }
}

function openHistoryEntry(entry: HistoryEntry): void {
  if (entry.profile === 'visual') {
    void selectProfile('visual').then(() => loadVisualHistoryEntry(entry));
    return;
  }
  void selectProfile('cognitive').then(() => loadCognitiveHistoryEntry(entry));
}

function refreshAllLabels(): void {
  applyStaticTranslations(document);
  refreshProfileLabels();
  refreshHistoryLabels();
  refreshCognitiveLabels();
  refreshVisualLabels();
}

async function boot(): Promise<void> {
  await initDb();
  await initPreferences();
  await initI18nFromPreferences();

  initProfileSelector();
  initHistoryPanel(openHistoryEntry);
  const modelStatus = initModelStatus();
  initCognitivePortal();
  initVisualPortal();

  const prefs = getPreferences();
  const fontSelect = document.getElementById('font-size-select') as HTMLSelectElement | null;
  if (fontSelect) {
    fontSelect.value = prefs.fontSize;
    fontSelect.addEventListener('change', () => {
      const next = fontSelect.value as FontSizeId;
      void setFontSizePreference(next);
    });
  }

  const localeSelect = document.getElementById('locale-select') as HTMLSelectElement | null;
  if (localeSelect) {
    localeSelect.value = getLocale();
    localeSelect.addEventListener('change', async () => {
      const next: Locale = localeSelect.value === 'es' ? 'es' : 'en';
      await setLocale(next);
      await setLocalePreference(next);
      document.documentElement.lang = next;
      refreshAllLabels();
      modelStatus.refreshTranslations();
    });
  }

  document.documentElement.lang = getLocale();
  refreshAllLabels();

  void registerServiceWorker();
}

void boot();
