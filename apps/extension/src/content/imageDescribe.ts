import { rememberAlt } from './a11yLayer.js';

type Locale = 'en' | 'es';

let locale: Locale = 'en';
let clickHandler: ((e: MouseEvent) => void) | null = null;
let activeRequestId: string | null = null;

function t(key: 'confirm' | 'describe' | 'cancel' | 'result' | 'useAlt' | 'useTooltip' | 'undo'): string {
  const en = {
    confirm: 'Describe this image with local AI?',
    describe: 'Describe',
    cancel: 'Cancel',
    result: 'Image description',
    useAlt: 'Set as alt text',
    useTooltip: 'Show as tooltip',
    undo: 'Undo',
  };
  const es = {
    confirm: '¿Describir esta imagen con IA local?',
    describe: 'Describir',
    cancel: 'Cancelar',
    result: 'Descripción de la imagen',
    useAlt: 'Usar como texto alt',
    useTooltip: 'Mostrar como tooltip',
    undo: 'Deshacer',
  };
  return (locale === 'es' ? es : en)[key];
}

function isUsefulAlt(alt: string): boolean {
  const trimmed = alt.trim();
  if (!trimmed) return false;
  if (trimmed.length < 4) return false;
  const lower = trimmed.toLowerCase();
  if (['image', 'img', 'photo', 'picture', 'icon'].includes(lower)) return false;
  return true;
}

function isDecorative(img: HTMLImageElement): boolean {
  if (img.width < 48 && img.height < 48) return true;
  if (img.getAttribute('role') === 'presentation') return true;
  if (img.getAttribute('aria-hidden') === 'true') return true;
  return false;
}

async function imageToDataUrl(img: HTMLImageElement): Promise<string | null> {
  try {
    const canvas = document.createElement('canvas');
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    if (!w || !h) return null;
    const scale = Math.min(1, 2048 / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
  } catch {
    return null;
  }
}

function showResultDialog(img: HTMLImageElement, description: string): void {
  const existing = document.getElementById('accessportal-image-result');
  existing?.remove();

  const root = document.createElement('div');
  root.id = 'accessportal-image-result';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');

  const shadow = root.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = `
    .backdrop {
      position: fixed; inset: 0; z-index: 2147483647;
      background: rgba(0,0,0,.45); display: flex; align-items: center; justify-content: center;
      padding: 16px; font-family: system-ui, sans-serif;
    }
    .panel {
      background: #fff; color: #212529; max-width: 480px; width: 100%;
      border-radius: 12px; padding: 16px; box-shadow: 0 8px 32px rgba(0,0,0,.25);
    }
    .result { white-space: pre-wrap; line-height: 1.6; max-height: 40vh; overflow: auto; }
    .actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
    button { border: 1px solid #dee2e6; background: #f8f9fa; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
    button.primary { background: #667eea; color: #fff; border-color: #667eea; }
  `;

  const backdrop = document.createElement('div');
  backdrop.className = 'backdrop';
  const panel = document.createElement('div');
  panel.className = 'panel';
  const h2 = document.createElement('h2');
  h2.textContent = t('result');
  const p = document.createElement('p');
  p.className = 'result';
  p.textContent = description;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const altBtn = document.createElement('button');
  altBtn.className = 'primary';
  altBtn.textContent = t('useAlt');
  altBtn.addEventListener('click', () => {
    rememberAlt(img, img.getAttribute('alt'));
    img.alt = description;
    root.remove();
  });

  const tipBtn = document.createElement('button');
  tipBtn.textContent = t('useTooltip');
  tipBtn.addEventListener('click', () => {
    img.title = description;
    root.remove();
  });

  const closeBtn = document.createElement('button');
  closeBtn.textContent = t('cancel');
  closeBtn.addEventListener('click', () => root.remove());

  actions.append(altBtn, tipBtn, closeBtn);
  panel.append(h2, p, actions);
  backdrop.appendChild(panel);
  shadow.append(style, backdrop);
  document.documentElement.appendChild(root);
}

export function handleImageStream(requestId: string, text: string, done: boolean, error?: string): void {
  if (activeRequestId !== requestId) return;
  if (error) {
    window.alert(error);
    activeRequestId = null;
    return;
  }
  if (done && text) {
    const img = (window as unknown as { __apLastImage?: HTMLImageElement }).__apLastImage;
    if (img) showResultDialog(img, text);
    activeRequestId = null;
  }
}

async function onImageClick(e: MouseEvent): Promise<void> {
  const target = e.target;
  if (!(target instanceof HTMLImageElement)) return;
  if (isDecorative(target)) return;
  if (isUsefulAlt(target.alt ?? '')) return;

  e.preventDefault();
  e.stopPropagation();

  if (!window.confirm(t('confirm'))) return;

  const dataUrl = await imageToDataUrl(target);
  if (!dataUrl) return;

  (window as unknown as { __apLastImage?: HTMLImageElement }).__apLastImage = target;
  const requestId = `img-${Date.now()}`;
  activeRequestId = requestId;

  void chrome.runtime.sendMessage({
    type: 'ap:content-describe-image',
    tabId: -1,
    locale,
    requestId,
    imageDataUrl: dataUrl,
    fileName: target.src.split('/').pop()?.split('?')[0] || 'image.jpg',
  });
}

export function initImageDescribe(nextLocale: Locale): void {
  locale = nextLocale;
  if (clickHandler) document.removeEventListener('click', clickHandler, true);
  clickHandler = (e) => void onImageClick(e);
  document.addEventListener('click', clickHandler, true);
}

export function teardownImageDescribe(): void {
  if (clickHandler) {
    document.removeEventListener('click', clickHandler, true);
    clickHandler = null;
  }
  document.getElementById('accessportal-image-result')?.remove();
  activeRequestId = null;
}
