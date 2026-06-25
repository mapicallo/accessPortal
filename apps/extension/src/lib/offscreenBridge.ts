import type { Locale } from './i18n.js';
import type { OffscreenRequestMessage, StreamChunkMessage } from './messages.js';

const OFFSCREEN_PATH = 'offscreen.html';

async function hasOffscreenDocument(): Promise<boolean> {
  try {
    return await chrome.offscreen.hasDocument();
  } catch {
    return false;
  }
}

export async function ensureOffscreenDocument(): Promise<void> {
  if (await hasOffscreenDocument()) return;
  await chrome.offscreen.createDocument({
    url: chrome.runtime.getURL(OFFSCREEN_PATH),
    reasons: [chrome.offscreen.Reason.WORKERS],
    justification: 'Run on-device LanguageModel for in-page accessibility assistance.',
  });
}

export async function pingOffscreen(): Promise<boolean> {
  try {
    await ensureOffscreenDocument();
    const response = await chrome.runtime.sendMessage({ type: 'ap:offscreen-ping' });
    return Boolean(response?.ok);
  } catch {
    return false;
  }
}

export async function requestEasyRead(
  tabId: number,
  requestId: string,
  text: string,
  locale: Locale,
): Promise<void> {
  await ensureOffscreenDocument();
  const msg: OffscreenRequestMessage = {
    type: 'ap:offscreen-easy-read',
    requestId,
    text,
    locale,
    tabId,
  };
  await chrome.runtime.sendMessage(msg);
}

export async function requestDescribeImage(
  tabId: number,
  requestId: string,
  locale: Locale,
  imageDataUrl: string,
  fileName: string,
): Promise<void> {
  await ensureOffscreenDocument();
  const msg: OffscreenRequestMessage = {
    type: 'ap:offscreen-describe-image',
    requestId,
    locale,
    tabId,
    imageDataUrl,
    fileName,
  };
  await chrome.runtime.sendMessage(msg);
}

export function relayStreamChunkToTab(chunk: StreamChunkMessage): void {
  void chrome.tabs.sendMessage(chunk.tabId, {
    type: 'ap:stream-chunk',
    requestId: chunk.requestId,
    text: chunk.text,
    done: chunk.done,
    error: chunk.error,
  }).catch(() => {
    /* tab closed */
  });
}
