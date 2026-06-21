import type { Locale } from './storage.js';
import { checkAiReadiness, hasBuiltInAiApi } from './ai/capabilities.js';

export type CapabilityBlock = {
  title: string;
  canDo: string[];
  cannotDo: string[];
};

export type CapabilitiesDocument = {
  intro: string;
  blocks: CapabilityBlock[];
  privacyNote: string;
  statusLine: string;
};

const DOCS: Record<Locale, Omit<CapabilitiesDocument, 'statusLine'>> = {
  en: {
    intro:
      'AccessPortal adapts content you choose using Chrome’s built-in AI on your device. It complements—but does not replace—official assistive tools or legal accessibility requirements.',
    blocks: [
      {
        title: 'Cognitive profile',
        canDo: [
          'Summarize pasted text or local documents (.txt, .md, .pdf).',
          'Simplify selected text into easier language.',
          'Save preferences and history on this device only.',
        ],
        cannotDo: [
          'Fetch content from arbitrary URLs — paste text, attach a file, or use the Chrome extension.',
          'Guarantee certified “easy read” or medical/legal accuracy.',
          'Process unlimited text — very long input may be truncated (~40k characters).',
        ],
      },
      {
        title: 'Visual profile',
        canDo: [
          'Describe images you upload or capture (local multimodal AI).',
          'Present results for screen readers (aria-live regions).',
        ],
        cannotDo: [
          'Describe the whole web without an image you provide.',
          'Replace professional OCR or orientation/mobility aids.',
        ],
      },
      {
        title: 'Motor profile',
        canDo: [
          'Dictate into a transcript (browser/OS speech services).',
          'Fill an internal “Accessibility note” form (title + body) with local AI.',
          'Large buttons and keyboard-friendly flows.',
        ],
        cannotDo: [
          'Autofill forms on external websites.',
          'Promise fully offline speech recognition on every platform.',
        ],
      },
      {
        title: 'Chrome extension',
        canDo: [
          'Send visible page text or your selection to the PWA after you confirm on the page.',
          'Open or focus the AccessPortal tab.',
        ],
        cannotDo: [
          'Read tabs in the background without your click.',
          'Run on Microsoft Edge in v1 (Chrome-only built-in AI).',
        ],
      },
      {
        title: 'Privacy',
        canDo: [
          'Process core adaptations on-device with Gemini Nano.',
          'Keep history and preferences in IndexedDB on this device.',
        ],
        cannotDo: [
          'Upload your content to AI4Context servers for AI processing.',
          'Control Google Chrome’s model download or update policies.',
        ],
      },
    ],
    privacyNote:
      'Chrome manages Gemini Nano. Dictation may use browser or OS speech services. See Privacy in the footer for details.',
  },
  es: {
    intro:
      'AccessPortal adapta contenido que tú eliges usando la IA integrada de Chrome en tu dispositivo. Complementa —no sustituye— ayudas oficiales ni requisitos legales de accesibilidad.',
    blocks: [
      {
        title: 'Perfil cognitivo',
        canDo: [
          'Resumir texto pegado o documentos locales (.txt, .md, .pdf).',
          'Simplificar texto seleccionado en lenguaje más fácil.',
          'Guardar preferencias e historial solo en este dispositivo.',
        ],
        cannotDo: [
          'Obtener contenido de URLs arbitrarias — pega texto, adjunta un archivo o usa la extensión Chrome.',
          'Garantizar “lectura fácil” certificada ni exactitud médica/legal.',
          'Procesar texto ilimitado — entradas muy largas pueden truncarse (~40k caracteres).',
        ],
      },
      {
        title: 'Perfil visual',
        canDo: [
          'Describir imágenes que subes o capturas (IA multimodal local).',
          'Presentar resultados para lectores de pantalla (regiones aria-live).',
        ],
        cannotDo: [
          'Describir toda la web sin una imagen que tú proporciones.',
          'Sustituir OCR profesional u orientación/movilidad.',
        ],
      },
      {
        title: 'Perfil motor',
        canDo: [
          'Dictar a una transcripción (servicios de voz del navegador/SO).',
          'Rellenar un formulario interno “Nota de accesibilidad” (título + cuerpo) con IA local.',
          'Botones grandes y flujos navegables con teclado.',
        ],
        cannotDo: [
          'Autocompletar formularios en sitios web externos.',
          'Prometer dictado 100 % offline en todas las plataformas.',
        ],
      },
      {
        title: 'Extensión Chrome',
        canDo: [
          'Enviar texto visible de la página o tu selección a la PWA tras confirmar en la página.',
          'Abrir o enfocar la pestaña de AccessPortal.',
        ],
        cannotDo: [
          'Leer pestañas en segundo plano sin tu clic.',
          'Funcionar en Microsoft Edge en v1 (IA integrada solo en Chrome).',
        ],
      },
      {
        title: 'Privacidad',
        canDo: [
          'Procesar adaptaciones principales en el dispositivo con Gemini Nano.',
          'Mantener historial y preferencias en IndexedDB en este dispositivo.',
        ],
        cannotDo: [
          'Subir tu contenido a servidores de AI4Context para procesarlo con IA.',
          'Controlar las políticas de descarga o actualización del modelo de Google Chrome.',
        ],
      },
    ],
    privacyNote:
      'Chrome gestiona Gemini Nano. El dictado puede usar servicios de voz del navegador o SO. Consulta Privacidad en el pie de página.',
  },
};

async function runtimeStatusLine(locale: Locale): Promise<string> {
  if (!hasBuiltInAiApi()) {
    return locale === 'es'
      ? 'Estado: la API de IA integrada no está disponible en este Chrome.'
      : 'Status: built-in AI API is not available in this Chrome.';
  }
  const { combined } = await checkAiReadiness();
  if (combined === 'unavailable') {
    return locale === 'es'
      ? 'Estado: Gemini Nano no está disponible en este equipo.'
      : 'Status: Gemini Nano is not available on this device.';
  }
  if (combined === 'downloadable') {
    return locale === 'es'
      ? 'Estado: Gemini Nano listo para descargar — pulsa “Preparar IA local”.'
      : 'Status: Gemini Nano ready to download — click “Prepare local AI”.';
  }
  return locale === 'es'
    ? 'Estado: Gemini Nano está listo en este navegador.'
    : 'Status: Gemini Nano is ready in this browser.';
}

export async function buildCapabilitiesDocument(locale: Locale): Promise<CapabilitiesDocument> {
  const base = DOCS[locale];
  return {
    ...base,
    statusLine: await runtimeStatusLine(locale),
  };
}

export function capabilityChipLabel(locale: Locale): string {
  return locale === 'es' ? '¿Qué puede hacer AccessPortal?' : 'What can AccessPortal do?';
}
