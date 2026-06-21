import {
  addHistoryEntry,
  clearHistory,
  deleteHistoryEntry,
  historyTitleForEntry,
  listHistory,
  type HistoryEntry,
} from '../db/indexedDb.js';
import { getLocale, t } from '../i18n.js';
import type { HistoryMode } from '../profiles/types.js';
import { getActiveProfile } from '../profiles/selector.js';

export type HistorySavePayload = {
  mode: HistoryMode;
  sourceText: string;
  resultText: string;
};

type HistoryOpenHandler = (entry: HistoryEntry) => void;

let onOpen: HistoryOpenHandler | null = null;

function panel(): HTMLElement | null {
  return document.getElementById('history-panel');
}

function listEl(): HTMLElement | null {
  return document.getElementById('history-list');
}

function emptyEl(): HTMLElement | null {
  return document.getElementById('history-empty');
}

function formatWhen(ts: number, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(ts);
  } catch {
    return new Date(ts).toLocaleString();
  }
}

function modeLabel(mode: HistoryMode): string {
  if (mode === 'summary') return t('historyModeSummary');
  if (mode === 'easyRead') return t('historyModeEasyRead');
  return t('historyModeDescribe');
}

function renderList(entries: HistoryEntry[]): void {
  const list = listEl();
  const empty = emptyEl();
  if (!list || !empty) return;

  list.replaceChildren();
  empty.hidden = entries.length > 0;
  list.hidden = entries.length === 0;

  const locale = getLocale() === 'es' ? 'es-ES' : 'en-US';

  for (const entry of entries) {
    const li = document.createElement('li');
    li.className = 'ap-history-item';

    const openBtn = document.createElement('button');
    openBtn.type = 'button';
    openBtn.className = 'ap-history-open';
    openBtn.setAttribute('aria-label', t('historyOpenItem', { title: entry.title }));

    const title = document.createElement('span');
    title.className = 'ap-history-title';
    title.textContent = entry.title;

    const meta = document.createElement('span');
    meta.className = 'ap-history-meta';
    meta.textContent = `${modeLabel(entry.mode)} · ${formatWhen(entry.createdAt, locale)}`;

    openBtn.append(title, meta);
    openBtn.addEventListener('click', () => {
      onOpen?.(entry);
      closeHistoryPanel();
    });

    const delBtn = document.createElement('button');
    delBtn.type = 'button';
    delBtn.className = 'ap-btn ap-btn-ghost ap-history-delete';
    delBtn.textContent = t('historyDelete');
    delBtn.setAttribute('aria-label', t('historyDeleteItem', { title: entry.title }));
    delBtn.addEventListener('click', () => {
      void deleteHistoryEntry(entry.id).then(refreshHistoryList);
    });

    li.append(openBtn, delBtn);
    list.append(li);
  }
}

export async function refreshHistoryList(): Promise<void> {
  const entries = await listHistory();
  renderList(entries);
}

export function openHistoryPanel(): void {
  const el = panel();
  if (!el) return;
  el.removeAttribute('hidden');
  void refreshHistoryList();
  document.getElementById('history-close-btn')?.focus();
}

export function closeHistoryPanel(): void {
  panel()?.setAttribute('hidden', '');
  document.getElementById('history-btn')?.focus();
}

export function initHistoryPanel(onOpenEntry: HistoryOpenHandler): void {
  onOpen = onOpenEntry;

  document.getElementById('history-btn')?.addEventListener('click', () => {
    openHistoryPanel();
  });

  document.getElementById('history-close-btn')?.addEventListener('click', () => {
    closeHistoryPanel();
  });

  document.getElementById('history-clear-btn')?.addEventListener('click', () => {
    if (!confirm(t('historyClearConfirm'))) return;
    void clearHistory().then(refreshHistoryList);
  });

  panel()?.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeHistoryPanel();
  });
}

export async function saveToHistory(payload: HistorySavePayload): Promise<void> {
  if (!payload.resultText.trim()) return;

  await addHistoryEntry({
    profile: getActiveProfile(),
    mode: payload.mode,
    title: historyTitleForEntry(payload.mode, payload.sourceText, getLocale()),
    sourceText: payload.sourceText,
    resultText: payload.resultText,
  });
}

export function refreshHistoryLabels(): void {
  const map: Array<[string, Parameters<typeof t>[0]]> = [
    ['history-title', 'historyTitle'],
    ['history-empty', 'historyEmpty'],
    ['history-close-btn', 'historyClose'],
    ['history-clear-btn', 'historyClearAll'],
  ];
  for (const [id, key] of map) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }
}
