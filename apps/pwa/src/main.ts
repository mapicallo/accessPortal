import './styles/base.css';
import './styles/profiles/cognitive.css';
import './styles/profiles/visual.css';
import './styles/profiles/motor.css';
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
  applyImportedContent,
  loadHistoryEntry as loadCognitiveHistoryEntry,
  initCognitivePortal,
  refreshCognitiveLabels,
  setImportLoading,
} from './lib/portals/cognitivePortal.js';
import {
  initMotorPortal,
  loadMotorHistoryEntry,
  refreshMotorLabels,
} from './lib/portals/motorPortal.js';
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
import { initCapabilitiesPanel, refreshCapabilitiesLabels } from './lib/ui/capabilitiesPanel.js';
import { initGuidePanel, refreshGuideLabels, refreshGuidePanel } from './lib/ui/guidePanel.js';
import { openPrivacyPolicy } from './lib/privacyUrl.js';
import { initModelStatus, isPortalReady } from './lib/ui/modelStatus.js';
import type { FontSizeId } from './lib/profiles/types.js';
import { initExtensionImport, tryFetchImportViaExtension } from './lib/bridge/extensionImport.js';
import type { ExtensionImportPayload } from './lib/bridge/types.js';
import { peekPendingImport } from './lib/bridge/types.js';

function isLocalPreviewHost(): boolean {
  const host = globalThis.location?.hostname ?? '';
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
}

async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  if (import.meta.env.DEV || isLocalPreviewHost()) {
    // Avoid stale cached bundles during `npm run preview` on localhost.
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));
    return;
  }

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
  if (entry.profile === 'motor' || entry.mode === 'motorNote') {
    void selectProfile('motor').then(() => loadMotorHistoryEntry(entry));
    return;
  }
  void selectProfile('cognitive').then(() => loadCognitiveHistoryEntry(entry));
}

function refreshAllLabels(): void {
  applyStaticTranslations(document);
  refreshProfileLabels();
  refreshHistoryLabels();
  refreshCapabilitiesLabels();
  refreshGuideLabels();
  refreshCognitiveLabels();
  refreshVisualLabels();
  refreshMotorLabels();
}

function applyImport(payload: ExtensionImportPayload): void {
  void selectProfile('cognitive').then(() => applyImportedContent(payload));
}

let pendingImport: ExtensionImportPayload | null = null;

function handleExtensionImport(payload: ExtensionImportPayload): void {
  setImportLoading(true);
  if (!isPortalReady()) {
    pendingImport = payload;
    return;
  }
  applyImport(payload);
}

async function boot(): Promise<void> {
  await initDb();
  await initPreferences();
  await initI18nFromPreferences();

  initProfileSelector(() => {
    refreshGuidePanel();
  });
  initHistoryPanel(openHistoryEntry);
  initCapabilitiesPanel();
  initGuidePanel();
  const modelStatus = initModelStatus();
  initCognitivePortal();
  initVisualPortal();
  initMotorPortal();
  initExtensionImport(handleExtensionImport);

  if (peekPendingImport()) {
    setImportLoading(true);
  }

  void modelStatus.whenReady().then(async () => {
    if (pendingImport || peekPendingImport()) {
      setImportLoading(true);
    }
    if (pendingImport) {
      applyImport(pendingImport);
      pendingImport = null;
    }
    const viaExtension = await tryFetchImportViaExtension();
    if (viaExtension) applyImport(viaExtension);
  });

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

  document.getElementById('privacy-link')?.addEventListener('click', () => {
    openPrivacyPolicy(getLocale());
  });

  document.documentElement.lang = getLocale();
  refreshAllLabels();

  void registerServiceWorker();
  window.__accessPortalBoot = true;
}

declare global {
  interface Window {
    __accessPortalBoot?: boolean;
  }
}

void boot();
