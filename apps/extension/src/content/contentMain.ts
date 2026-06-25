import {
  applyA11yLayer,
  getA11ySettings,
  restoreA11yLayer,
  restoreImageAlts,
} from './a11yLayer.js';
import {
  handleImageStream,
  initImageDescribe,
  teardownImageDescribe,
} from './imageDescribe.js';
import {
  handleStreamChunk,
  initSelectionOverlay,
  teardownSelectionListeners,
} from './selectionOverlay.js';
import type { BackgroundToContentMessage } from '../lib/messages.js';

type Locale = 'en' | 'es';

let enabled = false;
let locale: Locale = 'en';

function boot(): void {
  if ((window as unknown as { __accessPortalContent?: boolean }).__accessPortalContent) return;
  (window as unknown as { __accessPortalContent?: boolean }).__accessPortalContent = true;

  chrome.runtime.onMessage.addListener((message: BackgroundToContentMessage) => {
    if (message?.type === 'ap:content-init') {
      enabled = true;
      locale = message.locale;
      applyA11yLayer(message.a11y);
      initSelectionOverlay(locale);
      initImageDescribe(locale);
      return;
    }

    if (message?.type === 'ap:content-disable') {
      shutdown();
      return;
    }

    if (message?.type === 'ap:content-apply-a11y') {
      applyA11yLayer(message.a11y);
      return;
    }

    if (message?.type === 'ap:content-restore') {
      restoreAll();
      return;
    }

    if (message?.type === 'ap:stream-chunk') {
      handleStreamChunk(message.requestId, message.text, message.done, message.error);
      handleImageStream(message.requestId, message.text, message.done, message.error);
    }
  });

  void chrome.runtime.sendMessage({ type: 'ap:content-ready', tabId: -1 });
}

function restoreAll(): void {
  teardownSelectionListeners();
  teardownImageDescribe();
  restoreImageAlts();
  restoreA11yLayer();
}

function shutdown(): void {
  restoreAll();
  enabled = false;
}

boot();

export { enabled, locale, getA11ySettings };
