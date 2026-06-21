import { createTaskSession, promptText } from './languageModel.js';
import type { Locale } from '../storage.js';

export type StructuredNote = {
  title: string;
  body: string;
};

function structureNoteSystemPrompt(locale: Locale): string {
  if (locale === 'es') {
    return [
      'Eres un asistente de AccessPortal para el perfil motor.',
      'Recibes una transcripción dictada y devuelves SOLO un objeto JSON válido con claves "title" y "body".',
      'title: frase corta (máx. 120 caracteres). body: texto estructurado en párrafos claros.',
      'No inventes hechos. Si falta información, usa un título genérico como "Nota de accesibilidad".',
    ].join(' ');
  }
  return [
    'You are an AccessPortal assistant for the motor profile.',
    'You receive a dictated transcript and return ONLY a valid JSON object with keys "title" and "body".',
    'title: short phrase (max 120 chars). body: structured text in clear paragraphs.',
    'Do not invent facts. If information is missing, use a generic title like "Accessibility note".',
  ].join(' ');
}

function parseStructuredNote(raw: string, fallbackTranscript: string): StructuredNote {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { title?: unknown; body?: unknown };
      const title = typeof parsed.title === 'string' ? parsed.title.trim() : '';
      const body = typeof parsed.body === 'string' ? parsed.body.trim() : '';
      if (title || body) {
        return {
          title: title || fallbackTitle(fallbackTranscript),
          body: body || fallbackTranscript.trim(),
        };
      }
    } catch {
      /* fall through */
    }
  }

  const lines = trimmed.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length >= 2) {
    return { title: lines[0]!.slice(0, 120), body: lines.slice(1).join('\n\n') };
  }

  return {
    title: fallbackTitle(fallbackTranscript),
    body: fallbackTranscript.trim() || trimmed,
  };
}

function fallbackTitle(transcript: string): string {
  const line = transcript.split(/\r?\n/).find((l) => l.trim())?.trim() ?? transcript.trim();
  if (!line) return 'Accessibility note';
  return line.length > 120 ? `${line.slice(0, 117)}…` : line;
}

export async function structureAccessibilityNote(
  transcript: string,
  locale: Locale,
  signal?: AbortSignal,
): Promise<StructuredNote> {
  const text = transcript.trim();
  if (!text) {
    return { title: '', body: '' };
  }

  await createTaskSession(locale, structureNoteSystemPrompt(locale));

  const userPrompt =
    locale === 'es'
      ? `Transcripción dictada:\n\n${text}\n\nResponde solo con JSON {"title":"...","body":"..."}.`
      : `Dictated transcript:\n\n${text}\n\nReply with JSON only: {"title":"...","body":"..."}.`;

  const raw = await promptText(userPrompt, signal);
  return parseStructuredNote(raw, text);
}
