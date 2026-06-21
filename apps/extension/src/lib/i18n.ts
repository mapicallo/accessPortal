export type Locale = 'en' | 'es';

export type MessageKey =
  | 'appSubtitle'
  | 'langLabel'
  | 'readyStripReady'
  | 'readyStripChecking'
  | 'readyStripUnavailable'
  | 'openPwa'
  | 'usePage'
  | 'useSelection'
  | 'actionHint'
  | 'statusReady'
  | 'statusSending'
  | 'statusSent'
  | 'statusSentFirstTime'
  | 'statusOpenPwa'
  | 'statusCancelled'
  | 'errorNoTab'
  | 'errorRestricted'
  | 'errorEmpty'
  | 'errorNoSelection'
  | 'errorScript'
  | 'errorGeneric'
  | 'errorPwaUnreachableDev'
  | 'errorPwaUnreachableProd'
  | 'confirmPage'
  | 'confirmSelection'
  | 'footerByPrefix'
  | 'footerSupport'
  | 'footerPrivacy';

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en: {
    appSubtitle: 'By AI4Context',
    langLabel: 'Language',
    readyStripReady: 'Ready to adapt content',
    readyStripChecking: 'Connecting to AccessPortal…',
    readyStripUnavailable: 'AccessPortal is not available',
    openPwa: 'Open AccessPortal',
    usePage: 'Adapt this page',
    useSelection: 'Adapt selection',
    actionHint:
      'Choose what to send to AccessPortal. Processing stays on your device with Chrome’s built-in AI.',
    statusReady: 'Open an article or page, then choose how much text to adapt.',
    statusSending: 'Reading the page and opening AccessPortal…',
    statusSent: 'Done. Switch to the AccessPortal tab to summarize or simplify.',
    statusSentFirstTime:
      'Done. In the AccessPortal tab, wait for local AI to get ready (first time may take a minute), then use Summarize or Easy read.',
    statusOpenPwa: 'AccessPortal is open. Use Adapt this page from another tab to send content.',
    statusCancelled: 'Cancelled on the page.',
    errorNoTab: 'No readable browser tab found. Open a normal web page first.',
    errorRestricted: 'This page cannot be read (browser internal page).',
    errorEmpty: 'No readable text on this tab.',
    errorNoSelection: 'No text selected. Highlight text on the page first.',
    errorScript: 'Could not read this tab. Reload the page and try again.',
    errorGeneric: 'Something went wrong. Try again.',
    errorPwaUnreachableDev:
      'AccessPortal is not running locally. Developers: run npm run preview in apps/pwa ({url}).',
    errorPwaUnreachableProd:
      'Cannot reach AccessPortal online. Check your connection or try again later ({url}).',
    confirmPage:
      'AccessPortal will read visible text from this page (not your files). Continue?',
    confirmSelection:
      'AccessPortal will read the text you highlighted on this page. Continue?',
    footerByPrefix: 'by',
    footerSupport: 'Support',
    footerPrivacy: 'Privacy',
  },
  es: {
    appSubtitle: 'By AI4Context',
    langLabel: 'Idioma',
    readyStripReady: 'Listo para adaptar contenido',
    readyStripChecking: 'Conectando con AccessPortal…',
    readyStripUnavailable: 'AccessPortal no está disponible',
    openPwa: 'Abrir AccessPortal',
    usePage: 'Adaptar esta página',
    useSelection: 'Adaptar selección',
    actionHint:
      'Elige qué enviar a AccessPortal. El procesamiento se queda en tu dispositivo con la IA integrada de Chrome.',
    statusReady: 'Abre un artículo o página y elige cuánto texto quieres adaptar.',
    statusSending: 'Leyendo la página y abriendo AccessPortal…',
    statusSent: 'Hecho. Cambia a la pestaña AccessPortal para resumir o simplificar.',
    statusSentFirstTime:
      'Hecho. En la pestaña AccessPortal, espera a que la IA local esté lista (la primera vez puede tardar un minuto) y usa Resumir o Lectura fácil.',
    statusOpenPwa:
      'AccessPortal está abierto. Desde otra pestaña usa Adaptar esta página para enviar contenido.',
    statusCancelled: 'Cancelado en la página.',
    errorNoTab: 'No hay una pestaña legible. Abre primero una página web normal.',
    errorRestricted: 'Esta página no se puede leer (página interna del navegador).',
    errorEmpty: 'No hay texto legible en esta pestaña.',
    errorNoSelection: 'No hay texto seleccionado. Resalta texto en la página primero.',
    errorScript: 'No se pudo leer esta pestaña. Recarga la página e inténtalo de nuevo.',
    errorGeneric: 'Algo falló. Inténtalo de nuevo.',
    errorPwaUnreachableDev:
      'AccessPortal no está en marcha en local. Desarrollo: npm run preview en apps/pwa ({url}).',
    errorPwaUnreachableProd:
      'No se puede conectar con AccessPortal en línea. Comprueba tu conexión o inténtalo más tarde ({url}).',
    confirmPage:
      'AccessPortal leerá el texto visible de esta página (no tus archivos). ¿Continuar?',
    confirmSelection:
      'AccessPortal leerá el texto que resaltaste en esta página. ¿Continuar?',
    footerByPrefix: 'por',
    footerSupport: 'Apoyar',
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

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  let msg = MESSAGES[locale][key] ?? MESSAGES.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(`{${k}}`, String(v));
    }
  }
  return msg;
}

export function pageErrorMessage(error: string, vars?: Record<string, string>): string {
  if (error === 'pwa_unreachable' || error === 'pwa_tab_failed') {
    const url = vars?.url ?? '';
    const key =
      url.includes('localhost') || url.includes('127.0.0.1')
        ? 'errorPwaUnreachableDev'
        : 'errorPwaUnreachableProd';
    return t(key, vars);
  }
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

export function applyPanelLabels(): void {
  const map: Array<[string, MessageKey]> = [
    ['header-subtitle', 'appSubtitle'],
    ['lang-label', 'langLabel'],
    ['open-pwa-btn', 'openPwa'],
    ['use-page-btn', 'usePage'],
    ['use-selection-btn', 'useSelection'],
    ['action-hint', 'actionHint'],
    ['footer-by-prefix', 'footerByPrefix'],
    ['footer-support', 'footerSupport'],
    ['privacy-link', 'footerPrivacy'],
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }
}
