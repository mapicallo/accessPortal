import type { ParsedImage } from '../imageContext.js';
import type { Locale } from '../storage.js';
import {
  createTaskSession,
  describeImageSystemPrompt,
  getWarmSession,
  promptStreaming,
  type PromptInput,
  warmUpLanguageModel,
} from './languageModel.js';

function buildDescribePrompt(image: ParsedImage, locale: Locale): PromptInput {
  const truncNote =
    image.truncated
      ? locale === 'es'
        ? ' [La imagen se redimensionó para el modelo.]'
        : ' [Image was resized for the model.]'
      : '';

  const instruction =
    locale === 'es'
      ? `Describe esta imagen de forma accesible para una persona con baja visión o que usa un lector de pantalla.
Archivo: ${image.fileName}${truncNote}

Incluye texto visible, objetos principales y contexto.`
      : `Describe this image accessibly for someone with low vision or using a screen reader.
File: ${image.fileName}${truncNote}

Include visible text, main objects, and context.`;

  return [
    {
      role: 'user',
      content: [
        { type: 'text', value: instruction },
        { type: 'image', value: image.blob },
      ],
    },
  ];
}

export async function streamDescribeImage(
  image: ParsedImage,
  locale: Locale,
  onUpdate: (accumulated: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (!getWarmSession()) {
    await warmUpLanguageModel();
  }

  await createTaskSession(locale, describeImageSystemPrompt(locale));
  return promptStreaming(buildDescribePrompt(image, locale), onUpdate, signal);
}
