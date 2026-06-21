import { loadLocale, saveLocale, type Locale } from './storage.js';
import { getPreferences } from './profiles/preferences.js';

export type MessageKey =
  | 'appSubtitle'
  | 'langLabel'
  | 'stateChecking'
  | 'stateCheckingDetail'
  | 'stateDownloadable'
  | 'stateDownloadableDetail'
  | 'stateDownloading'
  | 'stateDownloadingDetail'
  | 'stateReady'
  | 'stateReadyDetail'
  | 'stateUnavailable'
  | 'stateUnavailableDetail'
  | 'stateNoApi'
  | 'stateNoApiDetail'
  | 'progressLabel'
  | 'prepareAi'
  | 'retry'
  | 'reqTitle'
  | 'reqChrome'
  | 'reqOs'
  | 'reqRam'
  | 'reqStorage'
  | 'reqFlags'
  | 'docsLink'
  | 'footerSupport'
  | 'cognitiveIntro'
  | 'aiDisclaimer'
  | 'sourceLabel'
  | 'charCount'
  | 'charTruncated'
  | 'summarizeBtn'
  | 'easyReadBtn'
  | 'stopBtn'
  | 'resultHeading'
  | 'writing'
  | 'errorEmpty'
  | 'errorGeneric'
  | 'summaryResultTitle'
  | 'easyReadResultTitle'
  | 'profileLabel'
  | 'profileCognitive'
  | 'profileVisual'
  | 'profileMotor'
  | 'profileComingSoon'
  | 'fontSizeLabel'
  | 'fontSizeNormal'
  | 'fontSizeLarge'
  | 'fontSizeXlarge'
  | 'historyBtn'
  | 'historyTitle'
  | 'historyEmpty'
  | 'historyClose'
  | 'historyClearAll'
  | 'historyClearConfirm'
  | 'historyDelete'
  | 'historyDeleteItem'
  | 'historyOpenItem'
  | 'historyModeSummary'
  | 'historyModeEasyRead'
  | 'visualPortalTitle'
  | 'visualPortalBody'
  | 'motorPortalTitle'
  | 'motorPortalBody';

const MESSAGES: Record<Locale, Record<MessageKey, string>> = {
  en: {
    appSubtitle: 'By AI4Context',
    langLabel: 'Language',
    stateChecking: 'Checking on-device AI…',
    stateCheckingDetail: 'Verifying Gemini Nano availability in Chrome.',
    stateDownloadable: 'Local AI ready to download',
    stateDownloadableDetail:
      'Chrome will download Gemini Nano once on this device. Click below to start (requires your confirmation).',
    stateDownloading: 'Downloading on-device model…',
    stateDownloadingDetail: 'This may take a few minutes. Keep Chrome open.',
    stateReady: 'Local AI is ready',
    stateReadyDetail: 'Opening your accessibility portal…',
    stateUnavailable: 'On-device AI not available',
    stateUnavailableDetail:
      'This device or Chrome setup does not meet the requirements for Gemini Nano.',
    stateNoApi: 'Built-in AI API not found',
    stateNoApiDetail:
      'Use Chrome 148+ on desktop, or enable Prompt API flags for development.',
    progressLabel: 'Download progress',
    prepareAi: 'Prepare local AI',
    retry: 'Check again',
    reqTitle: 'Typical requirements',
    reqChrome: 'Chrome 148+ (desktop)',
    reqOs: 'Windows 10/11, macOS 13+, Linux, or Chromebook Plus',
    reqRam: '16 GB RAM (CPU) or GPU with more than 4 GB VRAM',
    reqStorage: '~22 GB free space on the Chrome profile volume',
    reqFlags: 'Dev: enable #prompt-api-for-gemini-nano in chrome://flags',
    docsLink: 'Chrome built-in AI docs',
    footerSupport: 'Support',
    cognitiveIntro:
      'Paste text you want to understand more easily. Processing stays on this device.',
    aiDisclaimer:
      'AI may make mistakes. Always check the original text for important decisions.',
    sourceLabel: 'Your text',
    charCount: '{count} characters',
    charTruncated: 'Text was truncated to {max} characters for on-device processing.',
    summarizeBtn: 'Summarize key points',
    easyReadBtn: 'Simplify selection',
    stopBtn: 'Stop',
    resultHeading: 'Result',
    writing: 'Writing…',
    errorEmpty: 'Paste some text first, or select a paragraph to simplify.',
    errorGeneric: 'Something went wrong. Try again.',
    summaryResultTitle: 'Key points summary',
    easyReadResultTitle: 'Easy-read version',
    profileLabel: 'Accessibility profile',
    profileCognitive: 'Cognitive',
    profileVisual: 'Visual',
    profileMotor: 'Motor',
    profileComingSoon: 'Soon',
    fontSizeLabel: 'Text size',
    fontSizeNormal: 'Normal',
    fontSizeLarge: 'Large',
    fontSizeXlarge: 'Extra large',
    historyBtn: 'History',
    historyTitle: 'Adaptation history',
    historyEmpty: 'No saved adaptations yet. Results are stored on this device only.',
    historyClose: 'Close',
    historyClearAll: 'Delete all history',
    historyClearConfirm: 'Delete all saved adaptations on this device?',
    historyDelete: 'Delete',
    historyDeleteItem: 'Delete “{title}”',
    historyOpenItem: 'Open “{title}”',
    historyModeSummary: 'Summary',
    historyModeEasyRead: 'Easy read',
    visualPortalTitle: 'Visual profile',
    visualPortalBody: 'Image description portal — coming in a future version.',
    motorPortalTitle: 'Motor profile',
    motorPortalBody: 'Voice and simplified forms — coming in a future version.',
  },
  es: {
    appSubtitle: 'By AI4Context',
    langLabel: 'Idioma',
    stateChecking: 'Comprobando IA en el dispositivo…',
    stateCheckingDetail: 'Verificando si Gemini Nano está disponible en Chrome.',
    stateDownloadable: 'IA local lista para descargar',
    stateDownloadableDetail:
      'Chrome descargará Gemini Nano una vez en este equipo. Pulsa abajo para empezar (requiere tu confirmación).',
    stateDownloading: 'Descargando modelo local…',
    stateDownloadingDetail: 'Puede tardar unos minutos. Mantén Chrome abierto.',
    stateReady: 'IA local lista',
    stateReadyDetail: 'Abriendo tu portal de accesibilidad…',
    stateUnavailable: 'IA en dispositivo no disponible',
    stateUnavailableDetail:
      'Este equipo o configuración de Chrome no cumple los requisitos de Gemini Nano.',
    stateNoApi: 'API de IA integrada no encontrada',
    stateNoApiDetail:
      'Usa Chrome 148+ en escritorio, o activa los flags de Prompt API en desarrollo.',
    progressLabel: 'Progreso de descarga',
    prepareAi: 'Preparar IA local',
    retry: 'Comprobar de nuevo',
    reqTitle: 'Requisitos habituales',
    reqChrome: 'Chrome 148+ (escritorio)',
    reqOs: 'Windows 10/11, macOS 13+, Linux o Chromebook Plus',
    reqRam: '16 GB RAM (CPU) o GPU con más de 4 GB VRAM',
    reqStorage: '~22 GB libres en el volumen del perfil de Chrome',
    reqFlags: 'Dev: activar #prompt-api-for-gemini-nano en chrome://flags',
    docsLink: 'Documentación de IA integrada en Chrome',
    footerSupport: 'Soporte',
    cognitiveIntro:
      'Pega texto que quieras entender con más facilidad. El procesamiento se queda en este dispositivo.',
    aiDisclaimer:
      'La IA puede equivocarse. Consulta siempre el texto original para decisiones importantes.',
    sourceLabel: 'Tu texto',
    charCount: '{count} caracteres',
    charTruncated: 'El texto se truncó a {max} caracteres para procesarlo en el dispositivo.',
    summarizeBtn: 'Resumir puntos clave',
    easyReadBtn: 'Simplificar selección',
    stopBtn: 'Detener',
    resultHeading: 'Resultado',
    writing: 'Escribiendo…',
    errorEmpty: 'Pega texto primero, o selecciona un párrafo para simplificar.',
    errorGeneric: 'Algo falló. Inténtalo de nuevo.',
    summaryResultTitle: 'Resumen en puntos clave',
    easyReadResultTitle: 'Versión en lectura fácil',
    profileLabel: 'Perfil de accesibilidad',
    profileCognitive: 'Cognitivo',
    profileVisual: 'Visual',
    profileMotor: 'Motor',
    profileComingSoon: 'Pronto',
    fontSizeLabel: 'Tamaño de texto',
    fontSizeNormal: 'Normal',
    fontSizeLarge: 'Grande',
    fontSizeXlarge: 'Extra grande',
    historyBtn: 'Historial',
    historyTitle: 'Historial de adaptaciones',
    historyEmpty: 'Aún no hay adaptaciones guardadas. Se almacenan solo en este dispositivo.',
    historyClose: 'Cerrar',
    historyClearAll: 'Borrar todo el historial',
    historyClearConfirm: '¿Borrar todas las adaptaciones guardadas en este dispositivo?',
    historyDelete: 'Eliminar',
    historyDeleteItem: 'Eliminar “{title}”',
    historyOpenItem: 'Abrir “{title}”',
    historyModeSummary: 'Resumen',
    historyModeEasyRead: 'Lectura fácil',
    visualPortalTitle: 'Perfil visual',
    visualPortalBody: 'Portal de descripción de imágenes — disponible en una versión futura.',
    motorPortalTitle: 'Perfil motor',
    motorPortalBody: 'Voz y formularios simplificados — disponible en una versión futura.',
  },
};

const DATA_I18N = 'data-i18n';

let currentLocale: Locale = 'en';

export function getLocale(): Locale {
  return currentLocale;
}

export async function initI18n(): Promise<void> {
  currentLocale = loadLocale();
}

export async function initI18nFromPreferences(): Promise<void> {
  currentLocale = getPreferences().locale;
}

export async function setLocale(locale: Locale): Promise<void> {
  currentLocale = locale;
  saveLocale(locale);
}

export function t(key: MessageKey, vars?: Record<string, string | number>): string {
  let msg = MESSAGES[currentLocale][key] ?? MESSAGES.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(`{${k}}`, String(v));
    }
  }
  return msg;
}

export function applyStaticTranslations(root: ParentNode = document): void {
  root.querySelectorAll<HTMLElement>(`[${DATA_I18N}]`).forEach((el) => {
    const key = el.getAttribute(DATA_I18N) as MessageKey | null;
    if (!key) return;
    el.textContent = t(key);
  });

  const map: Array<[string, MessageKey]> = [
    ['header-subtitle', 'appSubtitle'],
    ['lang-label', 'langLabel'],
    ['progress-label', 'progressLabel'],
    ['req-title', 'reqTitle'],
    ['req-chrome', 'reqChrome'],
    ['req-os', 'reqOs'],
    ['req-ram', 'reqRam'],
    ['req-storage', 'reqStorage'],
    ['req-flags', 'reqFlags'],
    ['docs-link', 'docsLink'],
    ['prepare-btn', 'prepareAi'],
    ['retry-btn', 'retry'],
    ['ready-strip-label', 'stateReady'],
    ['cognitive-intro', 'cognitiveIntro'],
    ['ai-disclaimer', 'aiDisclaimer'],
    ['source-label', 'sourceLabel'],
    ['summarize-btn', 'summarizeBtn'],
    ['easy-read-btn', 'easyReadBtn'],
    ['stop-btn', 'stopBtn'],
    ['result-heading', 'resultHeading'],
    ['writing-indicator', 'writing'],
    ['support-link', 'footerSupport'],
    ['profile-label', 'profileLabel'],
    ['profile-cognitive-label', 'profileCognitive'],
    ['profile-visual-label', 'profileVisual'],
    ['profile-motor-label', 'profileMotor'],
    ['profile-visual-soon', 'profileComingSoon'],
    ['profile-motor-soon', 'profileComingSoon'],
    ['font-size-label', 'fontSizeLabel'],
    ['history-btn', 'historyBtn'],
    ['visual-portal-title', 'visualPortalTitle'],
    ['visual-portal-body', 'visualPortalBody'],
    ['motor-portal-title', 'motorPortalTitle'],
    ['motor-portal-body', 'motorPortalBody'],
  ];

  for (const [id, key] of map) {
    const el = root.getElementById?.(id) ?? document.getElementById(id);
    if (el) el.textContent = t(key);
  }
}

export { DATA_I18N };
