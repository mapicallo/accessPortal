import type { Locale } from './storage.js';

/** Rough guess for translate button labelling (not for accessibility claims). */
export function guessSourceLocale(text: string): Locale | null {
  const sample = text.slice(0, 4000).toLowerCase();
  if (!sample.trim()) return null;

  const spanishChars = (sample.match(/[áéíóúñü¿¡]/g) ?? []).length;
  const spanishWords =
    sample.match(
      /\b(el|la|de|que|en|los|un|una|por|con|para|del|las|al|como|más|se|su|es|son|hay|está|este|esta|pero|sobre|también|entre|cuando|desde|noticia|noticias|qué|cómo|todos|todas|juegos|olímpic|olimpic)\b/g,
    )?.length ?? 0;
  const englishWords =
    sample.match(
      /\b(the|and|of|to|in|is|for|on|with|as|at|by|from|or|an|be|this|that|it|are|was|were|has|have|had|will|can|news|latest|all|team|game|games|olympic|world|about|named|after|before|more|new|their|there|these|they|what|when|where|which|who|your|our|year|years|youth|refugee|mission|chef)\b/g,
    )?.length ?? 0;

  const spanishScore = spanishChars * 3 + spanishWords;
  const englishScore = englishWords;

  if (spanishScore > englishScore + 2) return 'es';
  if (englishScore > spanishScore + 2) return 'en';
  return null;
}

export function getTranslateTargetLocale(text: string, uiLocale: Locale): Locale {
  const source = guessSourceLocale(text);
  if (source === 'es') return 'en';
  if (source === 'en') return 'es';
  return uiLocale === 'es' ? 'en' : 'es';
}
