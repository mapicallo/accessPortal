export type Locale = 'en' | 'es';

export type MessageKey =
  | 'popupTitle'
  | 'openPwa'
  | 'usePage'
  | 'useSelection'
  | 'statusReady'
  | 'statusSending'
  | 'statusSent'
  | 'statusCancelled'
  | 'errorNoTab'
  | 'errorRestricted'
  | 'errorEmpty'
  | 'errorNoSelection'
  | 'errorScript'
  | 'errorGeneric'
  | 'confirmPage'
  | 'confirmSelection'
  | 'footerHint'
  | 'footerPrivacy';

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en: {
    popupTitle: 'Send content to AccessPortal',
    openPwa: 'Open AccessPortal',
    usePage: 'Use this page',
    useSelection: 'Use selection',
    statusReady: 'Pick a page in another tab, then send its text to the PWA.',
    statusSending: 'Reading page and opening AccessPortal…',
    statusSent: 'Content sent. Switch to the AccessPortal tab.',
    statusCancelled: 'Cancelled on the page.',
    errorNoTab: 'No readable browser tab found.',
    errorRestricted: 'This page cannot be read (internal or store page).',
    errorEmpty: 'No readable text on this tab.',
    errorNoSelection: 'No text selected. Highlight text on the page first.',
    errorScript: 'Could not read this tab. Reload the page and try again.',
    errorGeneric: 'Something went wrong. Try again.',
    confirmPage:
      'AccessPortal will read visible text from this page (not your files). Continue?',
    confirmSelection:
      'AccessPortal will read the text you highlighted on this page. Continue?',
    footerHint: 'Text is processed locally in the AccessPortal PWA.',
    footerPrivacy: 'Privacy',
  },
  es: {
    popupTitle: 'Enviar contenido a AccessPortal',
    openPwa: 'Abrir AccessPortal',
    usePage: 'Usar esta página',
    useSelection: 'Usar selección',
    statusReady: 'Elige una página en otra pestaña y envía su texto a la PWA.',
    statusSending: 'Leyendo la página y abriendo AccessPortal…',
    statusSent: 'Contenido enviado. Cambia a la pestaña de AccessPortal.',
    statusCancelled: 'Cancelado en la página.',
    errorNoTab: 'No se encontró una pestaña del navegador legible.',
    errorRestricted: 'Esta página no se puede leer (interna o tienda).',
    errorEmpty: 'No hay texto legible en esta pestaña.',
    errorNoSelection: 'No hay texto seleccionado. Resalta texto en la página primero.',
    errorScript: 'No se pudo leer esta pestaña. Recarga la página e inténtalo de nuevo.',
    errorGeneric: 'Algo falló. Inténtalo de nuevo.',
    confirmPage:
      'AccessPortal leerá el texto visible de esta página (no tus archivos). ¿Continuar?',
    confirmSelection:
      'AccessPortal leerá el texto que resaltaste en esta página. ¿Continuar?',
    footerHint: 'El texto se procesa en local en la PWA AccessPortal.',
    footerPrivacy: 'Privacidad',
  },
};

let locale: Locale = 'en';

export function getLocale(): Locale {
  return locale;
}

export function setLocale(next: Locale): void {
  locale = next;
}

export function t(key: MessageKey): string {
  return MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key;
}

export function pageErrorMessage(error: string): string {
  const map: Record<string, MessageKey> = {
    no_tab: 'errorNoTab',
    restricted: 'errorRestricted',
    empty: 'errorEmpty',
    no_selection: 'errorNoSelection',
    script_failed: 'errorScript',
    cancelled: 'statusCancelled',
  };
  return t(map[error] ?? 'errorGeneric');
}

export function applyPopupLabels(): void {
  const map: Array<[string, MessageKey]> = [
    ['popup-title', 'popupTitle'],
    ['open-pwa-btn', 'openPwa'],
    ['use-page-btn', 'usePage'],
    ['use-selection-btn', 'useSelection'],
    ['popup-footer', 'footerHint'],
    ['privacy-link', 'footerPrivacy'],
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }
}
