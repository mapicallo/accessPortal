import { extractActiveTabSelection, extractActiveTabText } from './lib/pageContext.js';
import { TARGET_TAB_SESSION_KEY, isInjectableWebUrl } from './lib/tabContext.js';
import {
  clearPendingImport,
  deliverImportToPwa,
  openOrFocusPwaTab,
  readPendingImport,
} from './lib/tabBridge.js';
import { setLocale, t, type Locale } from './lib/i18n.js';

function sessionLike(): chrome.storage.StorageArea {
  return chrome.storage.session ?? chrome.storage.local;
}

function rememberTab(tab: chrome.tabs.Tab | undefined): void {
  if (tab?.id == null || !isInjectableWebUrl(tab.url)) return;
  void sessionLike().set({ [TARGET_TAB_SESSION_KEY]: tab.id });
}

async function captureActiveTabFromLastFocusedBrowserWindow(): Promise<void> {
  try {
    const wins = await chrome.windows.getAll({ populate: true });
    const normal = wins.filter((w) => w.type === 'normal');
    const focused = normal.find((w) => w.focused) ?? normal[0];
    const tab = focused?.tabs?.find((x) => x.active);
    rememberTab(tab);
  } catch {
    /* ignore */
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void (async () => {
    try {
      if (message?.type === 'ap:remember-tab') {
        await captureActiveTabFromLastFocusedBrowserWindow();
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'ap:open-pwa') {
        await openOrFocusPwaTab();
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'ap:use-page') {
        const locale = (message.locale === 'es' ? 'es' : 'en') as Locale;
        setLocale(locale);
        const result = await extractActiveTabText(t('confirmPage'));
        if (!result.ok) {
          sendResponse({ ok: false, error: result.error });
          return;
        }
        await deliverImportToPwa(result.payload);
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'ap:use-selection') {
        const locale = (message.locale === 'es' ? 'es' : 'en') as Locale;
        setLocale(locale);
        const result = await extractActiveTabSelection(t('confirmSelection'));
        if (!result.ok) {
          sendResponse({ ok: false, error: result.error });
          return;
        }
        await deliverImportToPwa(result.payload);
        sendResponse({ ok: true });
        return;
      }

      if (message?.type === 'ap:fetch-import') {
        const payload = await readPendingImport();
        if (payload) await clearPendingImport();
        sendResponse({ ok: true, payload });
        return;
      }

      sendResponse({ ok: false, error: 'unknown_message' });
    } catch (err) {
      console.error('[AccessPortal extension]', err);
      sendResponse({ ok: false, error: 'exception' });
    }
  })();

  return true;
});

chrome.runtime.onMessageExternal.addListener((_message, _sender, sendResponse) => {
  void (async () => {
    try {
      const payload = await readPendingImport();
      if (payload) await clearPendingImport();
      sendResponse({ ok: true, payload });
    } catch {
      sendResponse({ ok: false, payload: null });
    }
  })();
  return true;
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void sessionLike().get('ap_pwa_tab_id').then((data) => {
    if (data.ap_pwa_tab_id === tabId) {
      void sessionLike().remove('ap_pwa_tab_id');
    }
  });
});
