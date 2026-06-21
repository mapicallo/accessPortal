import { t } from '../i18n.js';
import { AVAILABLE_PROFILES, PROFILE_IDS, type ProfileId } from './types.js';
import { getPreferences, setProfilePreference } from './preferences.js';

type ProfileChangeHandler = (profile: ProfileId) => void;

let onChange: ProfileChangeHandler | null = null;

function portalShell(): HTMLElement | null {
  return document.getElementById('portal-shell');
}

function profileInputs(): NodeListOf<HTMLInputElement> {
  return document.querySelectorAll<HTMLInputElement>('input[name="profile"]');
}

function showPortal(profile: ProfileId): void {
  for (const id of PROFILE_IDS) {
    const el = document.getElementById(`${id}-portal`);
    if (!el) continue;
    if (id === profile) {
      el.removeAttribute('hidden');
    } else {
      el.setAttribute('hidden', '');
    }
  }
}

function syncProfileInputs(profile: ProfileId): void {
  profileInputs().forEach((input) => {
    input.checked = input.value === profile;
  });
}

export function getActiveProfile(): ProfileId {
  return getPreferences().profile;
}

export function initProfileSelector(handler?: ProfileChangeHandler): void {
  onChange = handler ?? null;

  const prefs = getPreferences();
  syncProfileInputs(prefs.profile);
  showPortal(prefs.profile);

  profileInputs().forEach((input) => {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      void selectProfile(input.value as ProfileId);
    });
  });
}

export async function selectProfile(profile: ProfileId): Promise<void> {
  if (!AVAILABLE_PROFILES.includes(profile)) {
    syncProfileInputs(getActiveProfile());
    return;
  }

  await setProfilePreference(profile);
  syncProfileInputs(profile);
  showPortal(profile);
  onChange?.(profile);
}

export function showPortalShell(): void {
  portalShell()?.removeAttribute('hidden');
  showPortal(getActiveProfile());
}

export function hidePortalShell(): void {
  portalShell()?.setAttribute('hidden', '');
}

export function refreshProfileLabels(): void {
  const map: Array<[string, Parameters<typeof t>[0]]> = [
    ['profile-label', 'profileLabel'],
    ['profile-cognitive-label', 'profileCognitive'],
    ['profile-visual-label', 'profileVisual'],
    ['profile-motor-label', 'profileMotor'],
    ['font-size-label', 'fontSizeLabel'],
    ['history-btn', 'historyBtn'],
  ];

  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }

  const fontSelect = document.getElementById('font-size-select') as HTMLSelectElement | null;
  if (fontSelect) {
    for (const opt of fontSelect.options) {
      const key = opt.dataset.i18n as Parameters<typeof t>[0] | undefined;
      if (key) opt.textContent = t(key);
    }
  }
}
