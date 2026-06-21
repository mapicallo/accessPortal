export type Locale = 'en' | 'es';



export type MessageKey =

  | 'appSubtitle'

  | 'langLabel'

  | 'readyStripLabel'

  | 'openPwa'

  | 'usePage'

  | 'useSelection'

  | 'bridgeHint'

  | 'statusReady'

  | 'statusSending'

  | 'statusSent'

  | 'statusOpenPwa'

  | 'statusCancelled'

  | 'errorNoTab'

  | 'errorRestricted'

  | 'errorEmpty'

  | 'errorNoSelection'

  | 'errorScript'

  | 'errorGeneric'
  | 'errorPwaUnreachable'

  | 'confirmPage'

  | 'confirmSelection'

  | 'footerByPrefix'

  | 'footerSupport'

  | 'footerPrivacy';



const MESSAGES: Record<Locale, Record<MessageKey, string>> = {

  en: {

    appSubtitle: 'By AI4Context',

    langLabel: 'Language',

    readyStripLabel: 'Bridge ready',

    openPwa: 'Open AccessPortal',

    usePage: 'Use this page',

    useSelection: 'Use selection',

    bridgeHint:

      'Send visible page text or a selection to the AccessPortal PWA for local AI adaptations (summarize, easy read, and more).',

    statusReady: 'Pick a page in another tab, then send its text to the PWA.',

    statusSending: 'Reading page and opening AccessPortal…',

    statusSent: 'Content sent. Switch to the AccessPortal tab.',

    statusOpenPwa: 'AccessPortal tab opened or focused.',

    statusCancelled: 'Cancelled on the page.',

    errorNoTab: 'No readable browser tab found.',

    errorRestricted: 'This page cannot be read (internal or store page).',

    errorEmpty: 'No readable text on this tab.',

    errorNoSelection: 'No text selected. Highlight text on the page first.',

    errorScript: 'Could not read this tab. Reload the page and try again.',

    errorGeneric: 'Something went wrong. Try again.',
    errorPwaUnreachable:
      'AccessPortal PWA is not running at {url}. Start it: cd apps/pwa → npm run build → npm run preview, then try again.',

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

    readyStripLabel: 'Puente listo',

    openPwa: 'Abrir AccessPortal',

    usePage: 'Usar esta página',

    useSelection: 'Usar selección',

    bridgeHint:

      'Envía texto visible de la página o una selección a la PWA AccessPortal para adaptaciones locales con IA (resumir, lectura fácil, etc.).',

    statusReady: 'Elige una página en otra pestaña y envía su texto a la PWA.',

    statusSending: 'Leyendo la página y abriendo AccessPortal…',

    statusSent: 'Contenido enviado. Cambia a la pestaña de AccessPortal.',

    statusOpenPwa: 'Pestaña AccessPortal abierta o enfocada.',

    statusCancelled: 'Cancelado en la página.',

    errorNoTab: 'No se encontró una pestaña del navegador legible.',

    errorRestricted: 'Esta página no se puede leer (interna o tienda).',

    errorEmpty: 'No hay texto legible en esta pestaña.',

    errorNoSelection: 'No hay texto seleccionado. Resalta texto en la página primero.',

    errorScript: 'No se pudo leer esta pestaña. Recarga la página e inténtalo de nuevo.',

    errorGeneric: 'Algo falló. Inténtalo de nuevo.',
    errorPwaUnreachable:
      'La PWA AccessPortal no responde en {url}. Arráncala: cd apps/pwa → npm run build → npm run preview, e inténtalo de nuevo.',

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
    return t('errorPwaUnreachable', vars);
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

    ['ready-strip-label', 'readyStripLabel'],

    ['open-pwa-btn', 'openPwa'],

    ['use-page-btn', 'usePage'],

    ['use-selection-btn', 'useSelection'],

    ['bridge-hint', 'bridgeHint'],

    ['footer-by-prefix', 'footerByPrefix'],

    ['footer-support', 'footerSupport'],

    ['privacy-link', 'footerPrivacy'],

  ];

  for (const [id, key] of map) {

    const el = document.getElementById(id);

    if (el) el.textContent = t(key);

  }

}


