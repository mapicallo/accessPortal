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
  | 'pwaTabReadyNotice'
  | 'focusPwaTabBtn'
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
  | 'inPageTitle'
  | 'inPageHint'
  | 'inPageEnable'
  | 'a11yLegend'
  | 'a11yDyslexic'
  | 'a11yContrast'
  | 'a11yScale'
  | 'restorePage'
  | 'inPageEnabled'
  | 'inPageDisabled'
  | 'inPageNoTab'
  | 'statusPwaOfflineInPageOk'
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
    statusSent:
      'Done. AccessPortal is loading your text in the background — switch to that tab when ready.',
    statusSentFirstTime:
      'Done. AccessPortal is preparing local AI and loading page text. Switch to that tab to follow progress.',
    pwaTabReadyNotice: 'AccessPortal tab is ready — look for the highlighted tab above.',
    focusPwaTabBtn: 'Go to AccessPortal tab',
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
    inPageTitle: 'On-page assistance',
    inPageHint:
      'Opt-in help on the current tab: simplify selected text, describe images, or apply readable styles.',
    inPageEnable: 'Assist on this page',
    a11yLegend: 'Readable page styles',
    a11yDyslexic: 'OpenDyslexic font',
    a11yContrast: 'High contrast',
    a11yScale: 'Text size',
    restorePage: 'Restore original page',
    inPageEnabled: 'On-page assistance is active on this tab.',
    inPageDisabled: 'On-page assistance turned off.',
    inPageNoTab: 'Open a normal web page first, then enable assistance.',
    statusPwaOfflineInPageOk:
      'AccessPortal PWA is offline — use “Assist on this page” below (no PWA needed). To test “Adapt this page”, run npm run preview in apps/pwa.',
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
    statusSent:
      'Hecho. AccessPortal carga el texto en segundo plano — cambia a esa pestaña cuando quieras.',
    statusSentFirstTime:
      'Hecho. AccessPortal prepara la IA local y carga el texto. Cambia a esa pestaña para seguir el progreso.',
    pwaTabReadyNotice:
      'La pestaña AccessPortal ya está lista — fíjate en la pestaña resaltada arriba.',
    focusPwaTabBtn: 'Ir a la pestaña AccessPortal',
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
    inPageTitle: 'Asistencia en la página',
    inPageHint:
      'Ayuda opcional en la pestaña actual: simplificar texto seleccionado, describir imágenes o aplicar estilos legibles.',
    inPageEnable: 'Asistir en esta página',
    a11yLegend: 'Estilos legibles en la página',
    a11yDyslexic: 'Fuente OpenDyslexic',
    a11yContrast: 'Alto contraste',
    a11yScale: 'Tamaño de texto',
    restorePage: 'Restaurar página original',
    inPageEnabled: 'La asistencia en página está activa en esta pestaña.',
    inPageDisabled: 'Asistencia en página desactivada.',
    inPageNoTab: 'Abre primero una página web normal y luego activa la asistencia.',
    statusPwaOfflineInPageOk:
      'La PWA AccessPortal no está activa — usa «Asistir en esta página» abajo (no hace falta la PWA). Para probar «Adaptar esta página», ejecuta npm run preview en apps/pwa.',
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
    ['pwa-tab-notice-text', 'pwaTabReadyNotice'],
    ['focus-pwa-btn', 'focusPwaTabBtn'],
    ['in-page-title', 'inPageTitle'],
    ['in-page-hint', 'inPageHint'],
    ['in-page-enable-label', 'inPageEnable'],
    ['a11y-legend', 'a11yLegend'],
    ['a11y-dyslexic-label', 'a11yDyslexic'],
    ['a11y-contrast-label', 'a11yContrast'],
    ['a11y-scale-label', 'a11yScale'],
    ['restore-page-btn', 'restorePage'],
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }
}
