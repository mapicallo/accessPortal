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
  | 'stateCheckTimeout'
  | 'stateCheckTimeoutDetail'
  | 'statePrepareTimeout'
  | 'statePrepareTimeoutDetail'
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
  | 'motorPortalBody'
  | 'attachDocument'
  | 'attachDocumentHint'
  | 'documentAttachedHint'
  | 'errorFileTooLarge'
  | 'errorFileUnsupported'
  | 'errorFileEmpty'
  | 'errorPdfFailed'
  | 'errorFileRead'
  | 'copyResultBtn'
  | 'downloadResultBtn'
  | 'copyResultDone'
  | 'copyResultFailed'
  | 'stoppedPartial'
  | 'visualIntro'
  | 'visualUploadBtn'
  | 'visualCameraBtn'
  | 'visualDescribeBtn'
  | 'visualResultTitle'
  | 'visualImageReady'
  | 'visualImageResized'
  | 'visualPreviewAlt'
  | 'visualErrorNoImage'
  | 'visualHistoryFrom'
  | 'historyModeDescribe'
  | 'errorImageTooLarge'
  | 'errorImageUnsupported'
  | 'errorImageFailed'
  | 'importBannerPage'
  | 'importBannerSelection'
  | 'motorIntro'
  | 'motorSpeechDisclaimer'
  | 'motorStartDictation'
  | 'motorStopDictation'
  | 'motorStructureBtn'
  | 'motorTranscriptLabel'
  | 'motorDictationIdle'
  | 'motorDictationListening'
  | 'motorDictationUnsupported'
  | 'motorDictationError'
  | 'motorErrorEmptyTranscript'
  | 'motorStructureDone'
  | 'motorFormHeading'
  | 'motorNoteTitleLabel'
  | 'motorNoteBodyLabel'
  | 'motorClearBtn'
  | 'motorHistoryLoaded'
  | 'historyModeMotorNote'
  | 'capabilitiesBtn'
  | 'capabilitiesTitle'
  | 'capabilitiesClose'
  | 'capabilitiesCanDo'
  | 'capabilitiesCannotDo'
  | 'footerPrivacy';

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
    stateCheckTimeout: 'Chrome did not respond in time',
    stateCheckTimeoutDetail:
      'Gemini Nano check timed out. Enable chrome://flags/#prompt-api-for-gemini-nano (and BypassPerfRequirement in dev), then click Prepare local AI or Check again.',
    statePrepareTimeout: 'Model preparation timed out',
    statePrepareTimeoutDetail:
      'Download took too long. Keep Chrome open, check free disk space (~22 GB), then click Check again.',
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
      'Paste text or attach a document (.txt, .md, .pdf). Processing stays on this device.',
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
    attachDocument: 'Attach document',
    attachDocumentHint: 'Pick a local PDF or text file. Text is extracted on this device only.',
    documentAttachedHint: 'Document “{name}” loaded. You can summarize or simplify it.',
    errorFileTooLarge: 'File is too large. Try a smaller file (max ~16 MB).',
    errorFileUnsupported: 'Unsupported file type. Use PDF, .txt, or .md.',
    errorFileEmpty: 'No readable text found in this file.',
    errorPdfFailed: 'Could not read this PDF. Try a text export or another file.',
    errorFileRead: 'Could not read this file. Try again with another file.',
    copyResultBtn: 'Copy result',
    downloadResultBtn: 'Download .txt',
    copyResultDone: 'Result copied to clipboard.',
    copyResultFailed: 'Could not copy. Select the text and copy manually.',
    stoppedPartial: 'Stopped. Partial result is shown below.',
    visualIntro:
      'Upload or capture an image to get an accessible description. Processing stays on this device.',
    visualUploadBtn: 'Choose image',
    visualCameraBtn: 'Take photo',
    visualDescribeBtn: 'Describe image',
    visualResultTitle: 'Image description',
    visualImageReady: 'Image “{name}” loaded. Click Describe image.',
    visualImageResized: '{name} (resized to fit model limits)',
    visualPreviewAlt: 'Preview of {name}',
    visualErrorNoImage: 'Choose or capture an image first.',
    visualHistoryFrom: 'Description from: {name} (image not stored)',
    historyModeDescribe: 'Image description',
    errorImageTooLarge: 'Image is too large. Try a smaller file (max ~8 MB).',
    errorImageUnsupported: 'Unsupported image type. Use PNG, JPEG, WebP, or GIF.',
    errorImageFailed: 'Could not load this image. Try another file.',
    importBannerPage: 'Page sent from extension',
    importBannerSelection: 'Selection sent from extension',
    motorIntro:
      'Use voice to draft an accessibility note inside AccessPortal. Large buttons, few steps.',
    motorSpeechDisclaimer:
      'Dictation may use your browser or operating system speech service — not always fully offline.',
    motorStartDictation: 'Start dictation',
    motorStopDictation: 'Stop dictation',
    motorStructureBtn: 'Fill form with AI',
    motorTranscriptLabel: 'Dictation transcript',
    motorDictationIdle: 'Ready to dictate.',
    motorDictationListening: 'Listening… speak clearly.',
    motorDictationUnsupported: 'Speech recognition is not available in this browser.',
    motorDictationError: 'Dictation stopped due to an error. Try again.',
    motorErrorEmptyTranscript: 'Dictate or type some text first.',
    motorStructureDone: 'Form filled. Review and edit before use.',
    motorFormHeading: 'Accessibility note',
    motorNoteTitleLabel: 'Title',
    motorNoteBodyLabel: 'Body',
    motorClearBtn: 'Clear form',
    motorHistoryLoaded: 'Note loaded from history.',
    historyModeMotorNote: 'Accessibility note',
    capabilitiesBtn: 'What can AccessPortal do?',
    capabilitiesTitle: 'Capabilities & limits',
    capabilitiesClose: 'Close',
    capabilitiesCanDo: 'Can do',
    capabilitiesCannotDo: 'Cannot do',
    footerPrivacy: 'Privacy',
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
    stateCheckTimeout: 'Chrome no respondió a tiempo',
    stateCheckTimeoutDetail:
      'La comprobación de Gemini Nano tardó demasiado. Activa chrome://flags/#prompt-api-for-gemini-nano (y BypassPerfRequirement en dev) y pulsa Preparar IA local o Comprobar de nuevo.',
    statePrepareTimeout: 'La preparación del modelo tardó demasiado',
    statePrepareTimeoutDetail:
      'La descarga tardó demasiado. Mantén Chrome abierto, comprueba espacio libre (~22 GB) y pulsa Comprobar de nuevo.',
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
      'Pega texto o adjunta un documento (.txt, .md, .pdf). El procesamiento se queda en este dispositivo.',
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
    attachDocument: 'Adjuntar documento',
    attachDocumentHint: 'Elige un PDF o archivo de texto local. El texto se extrae solo en este dispositivo.',
    documentAttachedHint: 'Documento “{name}” cargado. Puedes resumirlo o simplificarlo.',
    errorFileTooLarge: 'Archivo demasiado grande. Prueba uno más pequeño (máx. ~16 MB).',
    errorFileUnsupported: 'Tipo de archivo no admitido. Usa PDF, .txt o .md.',
    errorFileEmpty: 'No se encontró texto legible en este archivo.',
    errorPdfFailed: 'No se pudo leer este PDF. Prueba una exportación a texto u otro archivo.',
    errorFileRead: 'No se pudo leer este archivo. Prueba con otro.',
    copyResultBtn: 'Copiar resultado',
    downloadResultBtn: 'Descargar .txt',
    copyResultDone: 'Resultado copiado al portapapeles.',
    copyResultFailed: 'No se pudo copiar. Selecciona el texto y cópialo manualmente.',
    stoppedPartial: 'Detenido. El resultado parcial aparece abajo.',
    visualIntro:
      'Sube o captura una imagen para obtener una descripción accesible. El procesamiento se queda en este dispositivo.',
    visualUploadBtn: 'Elegir imagen',
    visualCameraBtn: 'Hacer foto',
    visualDescribeBtn: 'Describir imagen',
    visualResultTitle: 'Descripción de la imagen',
    visualImageReady: 'Imagen “{name}” cargada. Pulsa Describir imagen.',
    visualImageResized: '{name} (redimensionada para el modelo)',
    visualPreviewAlt: 'Vista previa de {name}',
    visualErrorNoImage: 'Elige o captura una imagen primero.',
    visualHistoryFrom: 'Descripción de: {name} (imagen no guardada)',
    historyModeDescribe: 'Descripción de imagen',
    errorImageTooLarge: 'Imagen demasiado grande. Prueba un archivo más pequeño (máx. ~8 MB).',
    errorImageUnsupported: 'Tipo de imagen no admitido. Usa PNG, JPEG, WebP o GIF.',
    errorImageFailed: 'No se pudo cargar esta imagen. Prueba con otra.',
    importBannerPage: 'Página enviada desde la extensión',
    importBannerSelection: 'Selección enviada desde la extensión',
    motorIntro:
      'Usa la voz para redactar una nota de accesibilidad dentro de AccessPortal. Botones grandes, pocos pasos.',
    motorSpeechDisclaimer:
      'El dictado puede usar el servicio de voz del navegador o del sistema — no siempre totalmente offline.',
    motorStartDictation: 'Iniciar dictado',
    motorStopDictation: 'Detener dictado',
    motorStructureBtn: 'Rellenar formulario con IA',
    motorTranscriptLabel: 'Transcripción del dictado',
    motorDictationIdle: 'Listo para dictar.',
    motorDictationListening: 'Escuchando… habla con claridad.',
    motorDictationUnsupported: 'El reconocimiento de voz no está disponible en este navegador.',
    motorDictationError: 'El dictado se detuvo por un error. Inténtalo de nuevo.',
    motorErrorEmptyTranscript: 'Dicta o escribe texto primero.',
    motorStructureDone: 'Formulario rellenado. Revísalo y edítalo antes de usarlo.',
    motorFormHeading: 'Nota de accesibilidad',
    motorNoteTitleLabel: 'Título',
    motorNoteBodyLabel: 'Cuerpo',
    motorClearBtn: 'Limpiar formulario',
    motorHistoryLoaded: 'Nota cargada del historial.',
    historyModeMotorNote: 'Nota de accesibilidad',
    capabilitiesBtn: '¿Qué puede hacer AccessPortal?',
    capabilitiesTitle: 'Capacidades y límites',
    capabilitiesClose: 'Cerrar',
    capabilitiesCanDo: 'Puede',
    capabilitiesCannotDo: 'No puede',
    footerPrivacy: 'Privacidad',
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
    ['privacy-link', 'footerPrivacy'],
    ['capabilities-chip', 'capabilitiesBtn'],
    ['profile-label', 'profileLabel'],
    ['profile-cognitive-label', 'profileCognitive'],
    ['profile-visual-label', 'profileVisual'],
    ['profile-motor-label', 'profileMotor'],
    ['profile-visual-soon', 'profileComingSoon'],
    ['profile-motor-soon', 'profileComingSoon'],
    ['font-size-label', 'fontSizeLabel'],
    ['history-btn', 'historyBtn'],
    ['visual-ready-label', 'stateReady'],
    ['visual-intro', 'visualIntro'],
    ['visual-disclaimer', 'aiDisclaimer'],
    ['visual-upload-label', 'visualUploadBtn'],
    ['visual-camera-label', 'visualCameraBtn'],
    ['describe-btn', 'visualDescribeBtn'],
    ['visual-stop-btn', 'stopBtn'],
    ['visual-result-heading', 'visualResultTitle'],
    ['visual-writing-indicator', 'writing'],
    ['visual-copy-result-btn', 'copyResultBtn'],
    ['visual-download-result-btn', 'downloadResultBtn'],
    ['motor-portal-title', 'motorPortalTitle'],
    ['motor-portal-body', 'motorPortalBody'],
    ['attach-document-label', 'attachDocument'],
    ['copy-result-btn', 'copyResultBtn'],
    ['download-result-btn', 'downloadResultBtn'],
  ];

  for (const [id, key] of map) {
    const el = root.getElementById?.(id) ?? document.getElementById(id);
    if (el) el.textContent = t(key);
  }
}

export { DATA_I18N };
