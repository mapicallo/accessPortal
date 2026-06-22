import type { Locale } from '../storage.js';
import type { ProfileId } from '../profiles/types.js';

export type GuideStep = {
  title: string;
  body: string;
  tip?: string;
};

export type GuideSection = {
  title: string;
  steps: GuideStep[];
};

export type UserGuideDocument = {
  title: string;
  intro: string;
  adaptedForLabel: string;
  profileName: string;
  firstTimeTitle: string;
  firstTimeSteps: GuideStep[];
  mainSection: GuideSection;
  extensionSection: GuideSection;
  footer: string;
};

type GuidePack = Record<ProfileId, Omit<UserGuideDocument, 'adaptedForLabel' | 'profileName'>>;

const EN: GuidePack = {
  cognitive: {
    title: 'How to use AccessPortal — Cognitive profile',
    intro:
      'Short steps for understanding web articles and documents. Everything stays on your device.',
    firstTimeTitle: 'First time only',
    firstTimeSteps: [
      {
        title: 'Wait for local AI',
        body: 'When AccessPortal opens, Chrome may check or download Gemini Nano. This can take up to a minute the first time.',
        tip: 'You only need to do this once per Chrome profile.',
      },
      {
        title: 'Look for “Local AI is ready”',
        body: 'When the green message appears, you can use Summarize, Simplify, and Translate.',
      },
    ],
    mainSection: {
      title: 'In AccessPortal (this page)',
      steps: [
        {
          title: 'Bring your text',
          body: 'Paste text, attach a .txt / .md / .pdf file, or import from the Chrome extension (see below).',
        },
        {
          title: 'Summarize key points',
          body: 'Click the blue button to get bullet points. Check against the original for important decisions.',
        },
        {
          title: 'Simplify or translate',
          body: 'Use “Simplify selection” on highlighted text, or choose a language and click Translate.',
        },
        {
          title: 'History',
          body: 'Open History in the toolbar to reopen past work. Data stays on this device only.',
        },
      ],
    },
    extensionSection: {
      title: 'From any web page (Chrome extension)',
      steps: [
        {
          title: 'Open the article',
          body: 'Stay on the news page or site you want to understand.',
        },
        {
          title: 'Click the AccessPortal icon',
          body: 'A floating panel opens. Choose “Adapt this page” or “Adapt selection”.',
        },
        {
          title: 'Confirm and wait',
          body: 'The panel shows progress. A new AccessPortal tab loads your text here.',
          tip: 'Use “Go to AccessPortal tab” in the panel when it flashes.',
        },
        {
          title: 'Work here',
          body: 'Return to this tab to summarize, simplify, or translate the imported text.',
        },
      ],
    },
    footer: 'AccessPortal does not read pages in the background without your click.',
  },
  visual: {
    title: 'How to use AccessPortal — Visual profile',
    intro:
      'Large, clear steps focused on images and screen-reader-friendly descriptions.',
    firstTimeTitle: 'First time only',
    firstTimeSteps: [
      {
        title: 'Prepare local AI',
        body: 'On first open, wait until you see the green bar: “Local AI is ready”.',
        tip: 'Keep Chrome open during download.',
      },
    ],
    mainSection: {
      title: 'Describe an image',
      steps: [
        {
          title: 'Switch to Visual profile',
          body: 'At the top, select the Visual radio button if it is not already selected.',
        },
        {
          title: 'Choose or photograph an image',
          body: 'Use “Choose image” or “Take photo”. The preview appears below.',
        },
        {
          title: 'Describe image',
          body: 'Press the large “Describe image” button. The description appears for screen readers (aria-live).',
        },
        {
          title: 'Copy or download',
          body: 'Use Copy result or Download .txt to keep the description.',
        },
      ],
    },
    extensionSection: {
      title: 'Text from a web page',
      steps: [
        {
          title: 'Use the extension for page text',
          body: 'For articles without an image file, use the Chrome extension → “Adapt this page”, then Cognitive tools in AccessPortal.',
        },
        {
          title: 'Increase text size',
          body: 'In the toolbar, set Text size to Large or Extra large anytime.',
        },
      ],
    },
    footer: 'Image description is generated locally; always verify against the real image.',
  },
  motor: {
    title: 'How to use AccessPortal — Motor profile',
    intro: 'Few steps, large buttons. Voice and simple forms inside AccessPortal.',
    firstTimeTitle: 'First time only',
    firstTimeSteps: [
      {
        title: 'Local AI ready',
        body: 'Wait for the green “Local AI is ready” message before dictation or form fill.',
      },
    ],
    mainSection: {
      title: 'Voice note (inside AccessPortal)',
      steps: [
        {
          title: 'Select Motor profile',
          body: 'Choose Motor at the top of the page.',
        },
        {
          title: 'Start dictation',
          body: 'Press the large green “Start dictation” button. Speak clearly; text appears in the transcript box.',
        },
        {
          title: 'Fill form with AI',
          body: 'Press “Fill form with AI” to move your words into Title and Body fields.',
        },
        {
          title: 'Save or copy',
          body: 'Use Copy result or Download .txt. “Clear form” starts over.',
        },
      ],
    },
    extensionSection: {
      title: 'Import text from a website',
      steps: [
        {
          title: 'Extension → Adapt this page',
          body: 'On the site you are reading, open the AccessPortal floating panel and confirm.',
        },
        {
          title: 'Switch to Cognitive',
          body: 'Imported articles open in Cognitive profile for summarize — large buttons at the bottom.',
        },
      ],
    },
    footer: 'AccessPortal does not autofill forms on other websites — only this portal’s note form.',
  },
};

const ES: GuidePack = {
  cognitive: {
    title: 'Cómo usar AccessPortal — Perfil cognitivo',
    intro:
      'Pasos breves para entender artículos y documentos. Todo se queda en tu dispositivo.',
    firstTimeTitle: 'Solo la primera vez',
    firstTimeSteps: [
      {
        title: 'Espera a la IA local',
        body: 'Al abrir AccessPortal, Chrome puede comprobar o descargar Gemini Nano. La primera vez puede tardar hasta un minuto.',
        tip: 'Solo hace falta una vez por perfil de Chrome.',
      },
      {
        title: 'Busca «IA local lista»',
        body: 'Cuando aparece el mensaje verde, ya puedes Resumir, Simplificar y Traducir.',
      },
    ],
    mainSection: {
      title: 'En AccessPortal (esta página)',
      steps: [
        {
          title: 'Trae tu texto',
          body: 'Pega texto, adjunta .txt / .md / .pdf, o importa con la extensión Chrome (abajo).',
        },
        {
          title: 'Resumir puntos clave',
          body: 'Pulsa el botón azul para obtener viñetas. Comprueba el original en decisiones importantes.',
        },
        {
          title: 'Simplificar o traducir',
          body: 'Usa «Simplificar selección» en texto marcado, o elige idioma y pulsa Traducir.',
        },
        {
          title: 'Historial',
          body: 'Abre Historial en la barra superior. Los datos solo están en este dispositivo.',
        },
      ],
    },
    extensionSection: {
      title: 'Desde cualquier web (extensión Chrome)',
      steps: [
        {
          title: 'Abre el artículo',
          body: 'Quédate en la noticia o página que quieres entender.',
        },
        {
          title: 'Clic en el icono AccessPortal',
          body: 'Se abre el panel flotante. Elige «Adaptar esta página» o «Adaptar selección».',
        },
        {
          title: 'Confirma y espera',
          body: 'El panel muestra el progreso. Una pestaña AccessPortal carga el texto aquí.',
          tip: 'Usa «Ir a la pestaña AccessPortal» cuando parpadee el aviso.',
        },
        {
          title: 'Trabaja aquí',
          body: 'Vuelve a esta pestaña para resumir, simplificar o traducir.',
        },
      ],
    },
    footer: 'AccessPortal no lee páginas en segundo plano sin tu clic.',
  },
  visual: {
    title: 'Cómo usar AccessPortal — Perfil visual',
    intro:
      'Pasos claros y visibles, centrados en imágenes y descripciones para lectores de pantalla.',
    firstTimeTitle: 'Solo la primera vez',
    firstTimeSteps: [
      {
        title: 'Preparar IA local',
        body: 'La primera vez, espera la barra verde: «IA local lista».',
        tip: 'Mantén Chrome abierto durante la descarga.',
      },
    ],
    mainSection: {
      title: 'Describir una imagen',
      steps: [
        {
          title: 'Perfil Visual',
          body: 'Arriba, selecciona el botón Visual si no está activo.',
        },
        {
          title: 'Elige o fotografía',
          body: 'Usa «Elegir imagen» o «Hacer foto». Verás la vista previa.',
        },
        {
          title: 'Describir imagen',
          body: 'Pulsa el botón grande «Describir imagen». La descripción se anuncia al lector de pantalla.',
        },
        {
          title: 'Copiar o descargar',
          body: 'Usa Copiar resultado o Descargar .txt.',
        },
      ],
    },
    extensionSection: {
      title: 'Texto de una página web',
      steps: [
        {
          title: 'Extensión para texto',
          body: 'Sin archivo de imagen, usa la extensión → «Adaptar esta página», luego herramientas cognitivas aquí.',
        },
        {
          title: 'Tamaño de texto',
          body: 'En la barra superior, pon Tamaño de texto en Grande o Extra grande.',
        },
      ],
    },
    footer: 'La descripción se genera en local; comprueba siempre la imagen real.',
  },
  motor: {
    title: 'Cómo usar AccessPortal — Perfil motor',
    intro: 'Pocos pasos y botones grandes. Voz y formulario simple dentro de AccessPortal.',
    firstTimeTitle: 'Solo la primera vez',
    firstTimeSteps: [
      {
        title: 'IA local lista',
        body: 'Espera el mensaje verde «IA local lista» antes de dictar o rellenar.',
      },
    ],
    mainSection: {
      title: 'Nota por voz (dentro de AccessPortal)',
      steps: [
        {
          title: 'Perfil Motor',
          body: 'Elige Motor arriba en la página.',
        },
        {
          title: 'Iniciar dictado',
          body: 'Pulsa el botón verde grande «Iniciar dictado». Habla claro; el texto aparece abajo.',
        },
        {
          title: 'Rellenar formulario con IA',
          body: 'Pulsa «Rellenar formulario con IA» para pasar el texto a Título y Cuerpo.',
        },
        {
          title: 'Guardar o copiar',
          body: 'Copiar resultado o Descargar .txt. «Limpiar formulario» empieza de nuevo.',
        },
      ],
    },
    extensionSection: {
      title: 'Importar texto de una web',
      steps: [
        {
          title: 'Extensión → Adaptar esta página',
          body: 'En el sitio que lees, abre el panel AccessPortal y confirma.',
        },
        {
          title: 'Cambiar a Cognitivo',
          body: 'Los artículos importados abren en Cognitivo para resumir — botones grandes abajo.',
        },
      ],
    },
    footer: 'AccessPortal no rellena formularios de otras webs — solo el formulario de este portal.',
  },
};

const PACKS: Record<Locale, GuidePack> = { en: EN, es: ES };

const PROFILE_NAMES: Record<Locale, Record<ProfileId, string>> = {
  en: { cognitive: 'Cognitive', visual: 'Visual', motor: 'Motor' },
  es: { cognitive: 'Cognitivo', visual: 'Visual', motor: 'Motor' },
};

export function buildUserGuide(locale: Locale, profile: ProfileId): UserGuideDocument {
  const pack = PACKS[locale][profile];
  return {
    ...pack,
    adaptedForLabel: locale === 'es' ? 'Guía adaptada para' : 'Guide adapted for',
    profileName: PROFILE_NAMES[locale][profile],
  };
}
