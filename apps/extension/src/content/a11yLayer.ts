import type { A11yLayerSettings } from '../lib/messages.js';

const LAYER_CLASS = 'accessportal-a11y-layer';
const STYLE_ID = 'accessportal-a11y-style';
const FONT_URL = chrome.runtime.getURL('fonts/OpenDyslexic-Regular.woff2');

let currentSettings: A11yLayerSettings = {
  dyslexic: false,
  highContrast: false,
  fontScale: 1,
};

const patchedAlts = new Map<HTMLImageElement, string | null>();

function buildCss(): string {
  return `
@font-face {
  font-family: 'OpenDyslexic';
  src: url('${FONT_URL}') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
html.${LAYER_CLASS} {
  --ap-page-font-scale: ${currentSettings.fontScale};
}
html.${LAYER_CLASS} body {
  font-size: calc(100% * var(--ap-page-font-scale)) !important;
  line-height: 1.75 !important;
  letter-spacing: 0.03em !important;
  word-spacing: 0.08em !important;
}
html.${LAYER_CLASS}.ap-dyslexic body,
html.${LAYER_CLASS}.ap-dyslexic body *:not(script):not(style) {
  font-family: 'OpenDyslexic', 'Segoe UI', sans-serif !important;
}
html.${LAYER_CLASS}.ap-high-contrast body {
  background: #000 !important;
  color: #fff !important;
}
html.${LAYER_CLASS}.ap-high-contrast a {
  color: #ffeb3b !important;
}
html.${LAYER_CLASS}.ap-high-contrast img {
  filter: contrast(1.1);
}
`;
}

function ensureStyleEl(): void {
  let el = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement('style');
    el.id = STYLE_ID;
    document.documentElement.appendChild(el);
  }
  el.textContent = buildCss();
}

function applyClasses(): void {
  const root = document.documentElement;
  root.classList.add(LAYER_CLASS);
  root.classList.toggle('ap-dyslexic', currentSettings.dyslexic);
  root.classList.toggle('ap-high-contrast', currentSettings.highContrast);
}

export function applyA11yLayer(settings: A11yLayerSettings): void {
  currentSettings = { ...settings };
  ensureStyleEl();
  applyClasses();
}

export function getA11ySettings(): A11yLayerSettings {
  return { ...currentSettings };
}

export function restoreA11yLayer(): void {
  const root = document.documentElement;
  root.classList.remove(LAYER_CLASS, 'ap-dyslexic', 'ap-high-contrast');
  document.getElementById(STYLE_ID)?.remove();
}

export function rememberAlt(img: HTMLImageElement, previous: string | null): void {
  patchedAlts.set(img, previous);
}

export function restoreImageAlts(): void {
  for (const [img, previous] of patchedAlts.entries()) {
    if (previous === null) img.removeAttribute('alt');
    else img.alt = previous;
  }
  patchedAlts.clear();
}
