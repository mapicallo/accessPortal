import {
  hasPreferencesRecord,
  loadPreferences,
  savePreferences,
  type UserPreferences,
} from '../db/indexedDb.js';
import { loadLocale as loadLegacyLocale, saveLocale, type Locale } from '../storage.js';
import type { FontSizeId, ProfileId } from './types.js';

let cached: UserPreferences | null = null;

export async function initPreferences(): Promise<UserPreferences> {
  const hasRecord = await hasPreferencesRecord();
  let prefs = await loadPreferences();

  if (!hasRecord) {
    const legacy = loadLegacyLocale();
    if (legacy === 'es') prefs = { ...prefs, locale: 'es' };
    await savePreferences(prefs);
  }

  cached = prefs;
  applyFontSize(prefs.fontSize);
  saveLocale(prefs.locale);
  return prefs;
}

export function getPreferences(): UserPreferences {
  return cached ?? { locale: 'en', profile: 'cognitive', fontSize: 'normal' };
}

export async function persistPreferences(prefs: UserPreferences): Promise<void> {
  cached = prefs;
  saveLocale(prefs.locale);
  await savePreferences(prefs);
}

export async function setLocalePreference(locale: Locale): Promise<void> {
  const next = { ...getPreferences(), locale };
  await persistPreferences(next);
}

export async function setProfilePreference(profile: ProfileId): Promise<void> {
  const next = { ...getPreferences(), profile };
  await persistPreferences(next);
}

export async function setFontSizePreference(fontSize: FontSizeId): Promise<void> {
  const next = { ...getPreferences(), fontSize };
  await persistPreferences(next);
  applyFontSize(fontSize);
}

export function applyFontSize(fontSize: FontSizeId): void {
  document.documentElement.dataset.fontSize = fontSize;
}
