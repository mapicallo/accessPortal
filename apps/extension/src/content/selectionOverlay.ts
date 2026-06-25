type Locale = 'en' | 'es';

const TOOLBAR_HOST_ID = 'accessportal-selection-toolbar';
const OVERLAY_HOST_ID = 'accessportal-easy-read-overlay';

let locale: Locale = 'en';
let activeRequestId: string | null = null;

function t(key: 'simplify' | 'close' | 'openPwa' | 'original' | 'simplified' | 'loading' | 'disclaimer'): string {
  const en = {
    simplify: 'Simplify',
    close: 'Close',
    openPwa: 'Open in AccessPortal',
    original: 'Original',
    simplified: 'Simplified',
    loading: 'Simplifying…',
    disclaimer: 'AI may make mistakes. Compare with the original.',
  };
  const es = {
    simplify: 'Simplificar',
    close: 'Cerrar',
    openPwa: 'Abrir en AccessPortal',
    original: 'Original',
    simplified: 'Simplificado',
    loading: 'Simplificando…',
    disclaimer: 'La IA puede equivocarse. Compara con el original.',
  };
  return (locale === 'es' ? es : en)[key];
}

function removeToolbar(): void {
  document.getElementById(TOOLBAR_HOST_ID)?.remove();
}

function removeOverlay(): void {
  document.getElementById(OVERLAY_HOST_ID)?.remove();
  activeRequestId = null;
}

export function teardownSelectionUi(): void {
  removeToolbar();
  removeOverlay();
}

function showToolbar(rect: DOMRect, text: string): void {
  removeToolbar();
  const bar = document.createElement('div');
  bar.id = TOOLBAR_HOST_ID;
  bar.setAttribute('role', 'toolbar');
  const shadow = bar.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    :host { all: initial; }
    .wrap {
      position: fixed;
      z-index: 2147483646;
      top: ${Math.max(8, rect.bottom + 6)}px;
      left: ${Math.min(window.innerWidth - 140, Math.max(8, rect.left))}px;
      display: flex;
      gap: 6px;
      font-family: system-ui, sans-serif;
    }
    button {
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 14px;
      cursor: pointer;
      background: #667eea;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,.2);
    }
    button:focus-visible { outline: 2px solid #212529; outline-offset: 2px; }
  `;
  const wrap = document.createElement('div');
  wrap.className = 'wrap';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = t('simplify');
  btn.addEventListener('click', () => {
    removeToolbar();
    startEasyRead(text);
  });
  wrap.appendChild(btn);
  shadow.appendChild(style);
  shadow.appendChild(wrap);
  document.documentElement.appendChild(bar);
}

function startEasyRead(text: string): void {
  const requestId = `er-${Date.now()}`;
  activeRequestId = requestId;
  showOverlay(text, '', true);

  void chrome.runtime.sendMessage({
    type: 'ap:content-easy-read',
    tabId: -1,
    text,
    locale,
    requestId,
  });
}

function showOverlay(original: string, simplified: string, loading: boolean): void {
  removeOverlay();
  const host = document.createElement('div');
  host.id = OVERLAY_HOST_ID;
  host.setAttribute('role', 'dialog');
  host.setAttribute('aria-modal', 'true');
  host.setAttribute('aria-label', t('simplified'));

  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    .backdrop {
      position: fixed; inset: 0; z-index: 2147483647;
      background: rgba(0,0,0,.45);
      display: flex; align-items: center; justify-content: center;
      padding: 16px;
      font-family: system-ui, sans-serif;
    }
    .panel {
      background: #fff; color: #212529; max-width: 520px; width: 100%;
      max-height: 80vh; overflow: auto; border-radius: 12px;
      padding: 16px; box-shadow: 0 8px 32px rgba(0,0,0,.25);
    }
    h2 { margin: 0 0 8px; font-size: 1.1rem; }
    .disclaimer { font-size: 12px; color: #6c757d; margin-bottom: 12px; }
    .loading { font-style: italic; color: #6c757d; }
    .result { white-space: pre-wrap; line-height: 1.6; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
    button {
      border: 1px solid #dee2e6; background: #f8f9fa; border-radius: 8px;
      padding: 8px 12px; cursor: pointer; font-size: 14px;
    }
    button.primary { background: #667eea; color: #fff; border-color: #667eea; }
    button:focus-visible { outline: 2px solid #212529; outline-offset: 2px; }
  `;

  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  const panel = document.createElement('div');
  panel.className = 'panel';

  const title = document.createElement('h2');
  title.textContent = t('simplified');
  panel.appendChild(title);

  const disclaimer = document.createElement('p');
  disclaimer.className = 'disclaimer';
  disclaimer.textContent = t('disclaimer');
  panel.appendChild(disclaimer);

  const body = document.createElement('div');
  if (loading) {
    body.className = 'loading';
    body.textContent = t('loading');
  } else {
    body.className = 'result';
    body.textContent = simplified;
  }
  panel.appendChild(body);

  const actions = document.createElement('div');
  actions.className = 'actions';

  const openBtn = document.createElement('button');
  openBtn.className = 'primary';
  openBtn.type = 'button';
  openBtn.textContent = t('openPwa');
  openBtn.addEventListener('click', () => {
    void chrome.runtime.sendMessage({
      type: 'ap:content-open-pwa',
      text: simplified || original,
      url: location.href,
      title: document.title,
    });
  });

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = t('close');
  closeBtn.addEventListener('click', () => removeOverlay());

  actions.append(openBtn, closeBtn);
  panel.appendChild(actions);
  backdrop.appendChild(panel);
  shadow.append(style, backdrop);
  document.documentElement.appendChild(host);
  closeBtn.focus();
}

export function handleStreamChunk(requestId: string, text: string, done: boolean, error?: string): void {
  if (activeRequestId !== requestId) return;
  if (error) {
    showOverlay('', error, false);
    return;
  }
  if (done) showOverlay('', text, false);
  else showOverlay('', text, true);
}

export function initSelectionOverlay(nextLocale: Locale): void {
  locale = nextLocale;
  document.addEventListener('mouseup', onMouseUp);
}

export function teardownSelectionListeners(): void {
  document.removeEventListener('mouseup', onMouseUp);
  teardownSelectionUi();
}

function onMouseUp(): void {
  const sel = window.getSelection();
  const text = sel?.toString().replace(/\s+/g, ' ').trim() ?? '';
  if (!text || text.length < 8) {
    removeToolbar();
    return;
  }
  const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
  if (!range) return;
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return;
  showToolbar(rect, text);
}
