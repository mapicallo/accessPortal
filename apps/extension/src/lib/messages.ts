import type { Locale } from './i18n.js';

export type A11yLayerSettings = {
  dyslexic: boolean;
  highContrast: boolean;
  fontScale: 1 | 1.15 | 1.3;
};

export type ContentToBackgroundMessage =
  | { type: 'ap:content-ready'; tabId: number }
  | { type: 'ap:content-easy-read'; tabId: number; text: string; locale: Locale; requestId: string }
  | {
      type: 'ap:content-describe-image';
      tabId: number;
      locale: Locale;
      requestId: string;
      imageDataUrl: string;
      fileName: string;
    }
  | { type: 'ap:content-open-pwa'; text: string; url: string; title: string };

export type BackgroundToContentMessage =
  | { type: 'ap:content-init'; locale: Locale; a11y: A11yLayerSettings }
  | { type: 'ap:content-disable' }
  | { type: 'ap:content-apply-a11y'; a11y: A11yLayerSettings }
  | { type: 'ap:content-restore' }
  | {
      type: 'ap:stream-chunk';
      requestId: string;
      text: string;
      done: boolean;
      error?: string;
    };

export type PanelToBackgroundMessage =
  | { type: 'ap:remember-tab' }
  | { type: 'ap:check-pwa' }
  | { type: 'ap:open-pwa' }
  | { type: 'ap:use-page'; locale: Locale }
  | { type: 'ap:use-selection'; locale: Locale }
  | { type: 'ap:focus-pwa' }
  | { type: 'ap:fetch-import' }
  | { type: 'ap:enable-in-page'; locale: Locale }
  | { type: 'ap:disable-in-page' }
  | { type: 'ap:get-in-page-state' }
  | { type: 'ap:apply-a11y-layer'; a11y: A11yLayerSettings }
  | { type: 'ap:restore-page' };

export type OffscreenRequestMessage =
  | {
      type: 'ap:offscreen-easy-read';
      requestId: string;
      text: string;
      locale: Locale;
      tabId: number;
    }
  | {
      type: 'ap:offscreen-describe-image';
      requestId: string;
      locale: Locale;
      tabId: number;
      imageDataUrl: string;
      fileName: string;
    }
  | { type: 'ap:offscreen-ping' };

export type StreamChunkMessage = {
  type: 'ap:stream-chunk';
  requestId: string;
  tabId: number;
  text: string;
  done: boolean;
  error?: string;
};

export const IN_PAGE_ENABLED_KEY = 'ap_in_page_tab_ids';
export const A11Y_SYNC_KEY = 'ap_a11y_prefs';

export const DEFAULT_A11Y: A11yLayerSettings = {
  dyslexic: false,
  highContrast: false,
  fontScale: 1,
};
