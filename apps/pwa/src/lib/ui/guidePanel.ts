import { buildUserGuide, type GuideStep } from '../guide/userGuide.js';
import { getLocale, t } from '../i18n.js';
import { getActiveProfile, selectProfile } from '../profiles/selector.js';
import type { ProfileId } from '../profiles/types.js';

function panel(): HTMLElement | null {
  return document.getElementById('guide-panel');
}

function contentEl(): HTMLElement | null {
  return document.getElementById('guide-content');
}

function profilePickers(): NodeListOf<HTMLInputElement> {
  return document.querySelectorAll<HTMLInputElement>('input[name="guide-profile"]');
}

let viewProfile: ProfileId = 'cognitive';

function renderSteps(container: HTMLElement, steps: GuideStep[], profile: ProfileId): void {
  const list = document.createElement('ol');
  list.className = 'ap-guide-steps';
  list.setAttribute('aria-label', t('guideStepsLabel'));

  steps.forEach((step, index) => {
    const item = document.createElement('li');
    item.className = 'ap-guide-step';

    const num = document.createElement('span');
    num.className = 'ap-guide-step-num';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(index + 1);
    item.appendChild(num);

    const body = document.createElement('div');
    body.className = 'ap-guide-step-body';

    const title = document.createElement('h3');
    title.className = 'ap-guide-step-title';
    title.textContent = step.title;
    body.appendChild(title);

    const text = document.createElement('p');
    text.className = 'ap-guide-step-text';
    text.textContent = step.body;
    body.appendChild(text);

    if (step.tip) {
      const tip = document.createElement('p');
      tip.className = 'ap-guide-step-tip';
      tip.textContent = step.tip;
      body.appendChild(tip);
    }

    item.appendChild(body);
    list.appendChild(item);
  });

  container.appendChild(list);

  if (profile === 'motor') {
    list.classList.add('ap-guide-steps--motor');
  }
  if (profile === 'visual') {
    list.classList.add('ap-guide-steps--visual');
  }
}

function renderContent(): void {
  const root = contentEl();
  const shell = panel()?.querySelector('.ap-guide-panel-inner');
  if (!root || !shell) return;

  const profile = viewProfile;
  const doc = buildUserGuide(getLocale(), profile);

  const titleEl = document.getElementById('guide-title');
  if (titleEl) titleEl.textContent = doc.title;

  shell.classList.remove('ap-guide-panel--cognitive', 'ap-guide-panel--visual', 'ap-guide-panel--motor');
  shell.classList.add(`ap-guide-panel--${profile}`);

  profilePickers().forEach((input) => {
    input.checked = input.value === profile;
  });

  root.replaceChildren();

  const intro = document.createElement('p');
  intro.className = 'ap-guide-intro';
  intro.textContent = doc.intro;
  root.appendChild(intro);

  const adapted = document.createElement('p');
  adapted.className = 'ap-guide-adapted';
  adapted.textContent = `${doc.adaptedForLabel}: ${doc.profileName}`;
  root.appendChild(adapted);

  const firstSection = document.createElement('section');
  firstSection.className = 'ap-guide-section';
  const firstHeading = document.createElement('h2');
  firstHeading.className = 'ap-guide-section-title';
  firstHeading.textContent = doc.firstTimeTitle;
  firstSection.appendChild(firstHeading);
  renderSteps(firstSection, doc.firstTimeSteps, profile);
  root.appendChild(firstSection);

  const mainSection = document.createElement('section');
  mainSection.className = 'ap-guide-section';
  const mainHeading = document.createElement('h2');
  mainHeading.className = 'ap-guide-section-title';
  mainHeading.textContent = doc.mainSection.title;
  mainSection.appendChild(mainHeading);
  renderSteps(mainSection, doc.mainSection.steps, profile);
  root.appendChild(mainSection);

  const extSection = document.createElement('section');
  extSection.className = 'ap-guide-section';
  const extHeading = document.createElement('h2');
  extHeading.className = 'ap-guide-section-title';
  extHeading.textContent = doc.extensionSection.title;
  extSection.appendChild(extHeading);
  renderSteps(extSection, doc.extensionSection.steps, profile);
  root.appendChild(extSection);

  const footer = document.createElement('p');
  footer.className = 'ap-guide-footer';
  footer.textContent = doc.footer;
  root.appendChild(footer);
}

export function openGuidePanel(profile?: ProfileId): void {
  const el = panel();
  if (!el) return;
  viewProfile = profile ?? getActiveProfile();
  el.removeAttribute('hidden');
  renderContent();
  document.getElementById('guide-close-btn')?.focus();
}

export function closeGuidePanel(): void {
  panel()?.setAttribute('hidden', '');
  document.getElementById('guide-chip')?.focus();
}

export function refreshGuidePanel(): void {
  if (panel()?.hasAttribute('hidden')) return;
  renderContent();
}

export function initGuidePanel(): void {
  viewProfile = getActiveProfile();

  document.getElementById('guide-chip')?.addEventListener('click', () => {
    openGuidePanel();
  });

  document.getElementById('guide-close-btn')?.addEventListener('click', () => {
    closeGuidePanel();
  });

  document.getElementById('guide-use-profile-btn')?.addEventListener('click', () => {
    void selectProfile(viewProfile).then(() => closeGuidePanel());
  });

  profilePickers().forEach((input) => {
    input.addEventListener('change', () => {
      if (!input.checked) return;
      viewProfile = input.value as ProfileId;
      renderContent();
    });
  });

  panel()?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeGuidePanel();
  });

  panel()?.addEventListener('click', (e) => {
    if (e.target === panel()) closeGuidePanel();
  });
}

export function refreshGuideLabels(): void {
  const map: Array<[string, Parameters<typeof t>[0]]> = [
    ['guide-title', 'guideTitle'],
    ['guide-close-btn', 'guideClose'],
    ['guide-chip', 'guideBtn'],
    ['guide-profile-label', 'guideProfilePickerLabel'],
    ['guide-use-profile-btn', 'guideUseProfileBtn'],
    ['guide-profile-cognitive-label', 'profileCognitive'],
    ['guide-profile-visual-label', 'profileVisual'],
    ['guide-profile-motor-label', 'profileMotor'],
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }

  if (!panel()?.hasAttribute('hidden')) {
    renderContent();
  }
}
