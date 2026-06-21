import { buildCapabilitiesDocument } from '../productCapabilities.js';
import { getLocale, t } from '../i18n.js';

function panel(): HTMLElement | null {
  return document.getElementById('capabilities-panel');
}

function contentEl(): HTMLElement | null {
  return document.getElementById('capabilities-content');
}

function renderContent(): void {
  const root = contentEl();
  if (!root) return;

  void buildCapabilitiesDocument(getLocale()).then((doc) => {
    root.replaceChildren();

    const intro = document.createElement('p');
    intro.className = 'ap-capabilities-intro';
    intro.textContent = doc.intro;
    root.appendChild(intro);

    const status = document.createElement('p');
    status.className = 'ap-capabilities-status';
    status.setAttribute('role', 'status');
    status.textContent = doc.statusLine;
    root.appendChild(status);

    for (const block of doc.blocks) {
      const section = document.createElement('section');
      section.className = 'ap-capabilities-block';

      const heading = document.createElement('h3');
      heading.className = 'ap-capabilities-block-title';
      heading.textContent = block.title;
      section.appendChild(heading);

      const canHeading = document.createElement('h4');
      canHeading.className = 'ap-capabilities-list-heading';
      canHeading.textContent = t('capabilitiesCanDo');
      section.appendChild(canHeading);

      const canList = document.createElement('ul');
      canList.className = 'ap-capabilities-list';
      for (const item of block.canDo) {
        const li = document.createElement('li');
        li.textContent = item;
        canList.appendChild(li);
      }
      section.appendChild(canList);

      const cannotHeading = document.createElement('h4');
      cannotHeading.className = 'ap-capabilities-list-heading';
      cannotHeading.textContent = t('capabilitiesCannotDo');
      section.appendChild(cannotHeading);

      const cannotList = document.createElement('ul');
      cannotList.className = 'ap-capabilities-list ap-capabilities-list--limits';
      for (const item of block.cannotDo) {
        const li = document.createElement('li');
        li.textContent = item;
        cannotList.appendChild(li);
      }
      section.appendChild(cannotList);

      root.appendChild(section);
    }

    const note = document.createElement('p');
    note.className = 'ap-capabilities-note';
    note.textContent = doc.privacyNote;
    root.appendChild(note);
  });
}

export function openCapabilitiesPanel(): void {
  const el = panel();
  if (!el) return;
  el.removeAttribute('hidden');
  renderContent();
  document.getElementById('capabilities-close-btn')?.focus();
}

export function closeCapabilitiesPanel(): void {
  panel()?.setAttribute('hidden', '');
  document.getElementById('capabilities-chip')?.focus();
}

export function initCapabilitiesPanel(): void {
  document.getElementById('capabilities-chip')?.addEventListener('click', () => {
    openCapabilitiesPanel();
  });

  document.getElementById('capabilities-close-btn')?.addEventListener('click', () => {
    closeCapabilitiesPanel();
  });

  panel()?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCapabilitiesPanel();
  });

  panel()?.addEventListener('click', (e) => {
    if (e.target === panel()) closeCapabilitiesPanel();
  });
}

export function refreshCapabilitiesLabels(): void {
  const map: Array<[string, Parameters<typeof t>[0]]> = [
    ['capabilities-title', 'capabilitiesTitle'],
    ['capabilities-close-btn', 'capabilitiesClose'],
    ['capabilities-chip', 'capabilitiesBtn'],
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }

  if (panel() && !panel()?.hasAttribute('hidden')) {
    renderContent();
  }
}
