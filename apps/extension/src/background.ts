/**

 * AccessPortal MV3 background — floating panel (AI4Context family pattern).

 */

import { extractActiveTabSelection, extractActiveTabText } from './lib/pageContext.js';

import { TARGET_TAB_SESSION_KEY, isInjectableWebUrl } from './lib/tabContext.js';

import {
  checkPwaAvailable,
  clearPendingImport,
  deliverImportToPwa,
  openOrVerifyPwaTab,
  readPendingImport,
} from './lib/tabBridge.js';

import { setLocale, t, type Locale } from './lib/i18n.js';
import { resolvePwaUrl } from './lib/pwaUrl.js';



const PANEL_PAGE = 'panel.html';

const SESSION_PANEL_KEY = 'ap_panel_window_id';



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



async function clearStoredPanelWindowId(): Promise<void> {

  try {

    await sessionLike().remove(SESSION_PANEL_KEY);

  } catch {

    /* ignore */

  }

}



async function tryFocusStoredPanel(): Promise<boolean> {

  try {

    const data = await sessionLike().get(SESSION_PANEL_KEY);

    const wid = data[SESSION_PANEL_KEY] as number | undefined;

    if (typeof wid !== 'number') return false;



    const w = await chrome.windows.get(wid, { populate: true });

    const tabUrl = w.tabs?.[0]?.url ?? '';

    const ours = chrome.runtime.getURL(PANEL_PAGE);

    if (!tabUrl || tabUrl.split(/[?#]/)[0] !== ours.split(/[?#]/)[0]) {

      await sessionLike().remove(SESSION_PANEL_KEY);

      return false;

    }



    await chrome.windows.update(wid, { focused: true });

    return true;

  } catch {

    try {

      await sessionLike().remove(SESSION_PANEL_KEY);

    } catch {

      /* ignore */

    }

    return false;

  }

}



async function findExistingPanelWindow(): Promise<number | undefined> {

  const url = chrome.runtime.getURL(PANEL_PAGE);

  const windows = await chrome.windows.getAll({ populate: true });

  for (const win of windows) {

    for (const tab of win.tabs ?? []) {

      if (tab.url === url && win.id != null) return win.id;

    }

  }

  return undefined;

}



async function openAccessPortalPanel(): Promise<void> {

  await captureActiveTabFromLastFocusedBrowserWindow();



  if (await tryFocusStoredPanel()) return;



  const existing = await findExistingPanelWindow();

  if (existing != null) {

    await chrome.windows.update(existing, { focused: true });

    await sessionLike().set({ [SESSION_PANEL_KEY]: existing });

    return;

  }



  const panelUrl = chrome.runtime.getURL(PANEL_PAGE);

  const remember = async (windowId: number | undefined) => {

    if (windowId !== undefined) {

      await sessionLike().set({ [SESSION_PANEL_KEY]: windowId });

    }

  };



  const attempts: chrome.windows.CreateData[] = [

    { url: panelUrl, type: 'popup', width: 440, height: 560, focused: true },

    { url: panelUrl, type: 'normal', width: 460, height: 580, focused: true },

  ];



  for (const createData of attempts) {

    try {

      const created = await chrome.windows.create(createData);

      await remember(created.id);

      return;

    } catch (e) {

      console.warn('[AccessPortal] window create failed', createData.type, e);

    }

  }



  try {

    await chrome.tabs.create({ url: panelUrl, active: true });

  } catch (e) {

    console.error('[AccessPortal] could not open panel', e);

  }

}



chrome.action.onClicked.addListener(() => {

  void openAccessPortalPanel();

});



chrome.windows.onRemoved.addListener(async (windowId) => {

  try {

    const data = await sessionLike().get(SESSION_PANEL_KEY);

    if (data[SESSION_PANEL_KEY] === windowId) {

      await sessionLike().remove(SESSION_PANEL_KEY);

    }

  } catch {

    /* ignore */

  }

});



chrome.windows.onFocusChanged.addListener((windowId) => {

  if (windowId === chrome.windows.WINDOW_ID_NONE) return;

  void (async () => {

    try {

      const w = await chrome.windows.get(windowId, { populate: true });

      if (w.type !== 'normal') return;

      const tab = w.tabs?.find((x) => x.active);

      rememberTab(tab);

    } catch {

      /* ignore */

    }

  })();

});



chrome.tabs.onActivated.addListener((activeInfo) => {

  void (async () => {

    try {

      const tab = await chrome.tabs.get(activeInfo.tabId);

      rememberTab(tab);

    } catch {

      /* ignore */

    }

  })();

});



chrome.runtime.onInstalled.addListener(() => {

  void clearStoredPanelWindowId();

});



chrome.runtime.onStartup.addListener(() => {

  void clearStoredPanelWindowId();

});



chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

  void (async () => {

    try {

      if (message?.type === 'ap:remember-tab') {

        await captureActiveTabFromLastFocusedBrowserWindow();

        sendResponse({ ok: true });

        return;

      }



      if (message?.type === 'ap:check-pwa') {
        const status = await checkPwaAvailable();
        sendResponse({ ok: true, ...status });
        return;
      }

      if (message?.type === 'ap:open-pwa') {
        const opened = await openOrVerifyPwaTab();
        if (!opened.ok) {
          sendResponse({ ok: false, error: opened.error, pwaUrl: opened.pwaUrl });
          return;
        }
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

        const imported = await deliverImportToPwa(result.payload);
        sendResponse({ ok: true, firstTimeAi: imported.createdNewTab });
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

        const imported = await deliverImportToPwa(result.payload);

        sendResponse({ ok: true, firstTimeAi: imported.createdNewTab });

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
      const code = err instanceof Error ? err.message : 'exception';
      if (code === 'pwa_unreachable' || code === 'pwa_tab_failed') {
        sendResponse({ ok: false, error: code, pwaUrl: await resolvePwaUrl() });
        return;
      }
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


