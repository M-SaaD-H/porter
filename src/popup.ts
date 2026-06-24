import './popup.css';
import type { Profile, ProfileField, FillAllResponse } from './types';
import { getProfile, saveProfile } from './storage';

let profile: Profile = [];
let statusTimer: ReturnType<typeof setTimeout> | null = null;

function getEl<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`[ApplyKit] Missing DOM element: #${id}`);
  return el as T;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function generateId(): string {
  return `custom_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

type StatusKind = 'success' | 'error';

function showStatus(message: string, kind: StatusKind): void {
  const bar = getEl<HTMLDivElement>('status-bar');
  bar.textContent = message;
  bar.className = `status-bar ${kind}`;

  if (statusTimer) clearTimeout(statusTimer);
  statusTimer = setTimeout(() => {
    bar.className = 'status-bar';
    bar.textContent = '';
  }, 3500);
}

function buildPredefinedRow(field: ProfileField): HTMLElement {
  const row = document.createElement('div');
  row.className = 'field-row predefined';
  row.dataset.fieldId = field.id;

  row.innerHTML = `
    <span
      class="field-static-label"
      title="${escapeAttr(field.label)}"
    >${escapeAttr(field.label)}</span>
    <input
      id="val-${escapeAttr(field.id)}"
      type="text"
      class="field-input"
      placeholder="Add value…"
      value="${escapeAttr(field.value)}"
      autocomplete="off"
      spellcheck="false"
      aria-label="${escapeAttr(field.label)}"
    />
  `;

  return row;
}

function buildCustomRow(field: ProfileField): HTMLElement {
  const row = document.createElement('div');
  row.className = 'field-row custom';
  row.dataset.fieldId = field.id;

  row.innerHTML = `
    <input
      id="lbl-${escapeAttr(field.id)}"
      type="text"
      class="field-input"
      placeholder="Label"
      value="${escapeAttr(field.label)}"
      autocomplete="off"
      spellcheck="false"
      aria-label="Custom field label"
    />
    <input
      id="val-${escapeAttr(field.id)}"
      type="text"
      class="field-input"
      placeholder="Value"
      value="${escapeAttr(field.value)}"
      autocomplete="off"
      spellcheck="false"
      aria-label="Custom field value"
    />
    <button
      class="remove-btn"
      data-remove-id="${escapeAttr(field.id)}"
      type="button"
      aria-label="Remove ${escapeAttr(field.label || 'custom field')}"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
           stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <line x1="18" y1="6"  x2="6"  y2="18"/>
        <line x1="6"  y1="6"  x2="18" y2="18"/>
      </svg>
    </button>
  `;

  return row;
}

function buildSection(
  title: string,
  fields: ProfileField[],
  rowBuilder: (f: ProfileField) => HTMLElement,
): HTMLElement {
  const section = document.createElement('div');
  section.className = 'section';

  const label = document.createElement('p');
  label.className = 'section-label';
  label.textContent = title;
  section.appendChild(label);

  fields.forEach((f) => section.appendChild(rowBuilder(f)));
  return section;
}

function renderForm(): void {
  const form = getEl<HTMLDivElement>('profile-form');
  form.innerHTML = '';

  const predefined = profile.filter((f) => f.isPredefined);
  const custom = profile.filter((f) => !f.isPredefined);

  if (predefined.length > 0) {
    form.appendChild(buildSection('Profile', predefined, buildPredefinedRow));
  }

  if (custom.length > 0) {
    form.appendChild(buildSection('Custom Fields', custom, buildCustomRow));
  }
}

function collectProfile(): Profile {
  return profile.map((field) => {
    const valueEl = document.getElementById(`val-${field.id}`) as HTMLInputElement | null;
    const value = valueEl?.value ?? field.value;

    if (field.isPredefined) {
      return { ...field, value };
    }

    const labelEl = document.getElementById(`lbl-${field.id}`) as HTMLInputElement | null;
    const label = labelEl?.value ?? field.label;
    return { ...field, label, value };
  });
}

function onAddField(): void {
  const newField: ProfileField = {
    id: generateId(),
    label: '',
    value: '',
    isPredefined: false,
  };

  // Flush current DOM values into state before mutating the array
  profile = collectProfile();
  profile.push(newField);
  renderForm();

  (document.getElementById(`lbl-${newField.id}`) as HTMLInputElement | null)?.focus();
}

function onRemoveField(fieldId: string): void {
  profile = collectProfile().filter((f) => f.id !== fieldId);
  renderForm();
}

async function onSave(): Promise<void> {
  const btn = getEl<HTMLButtonElement>('save-btn');
  btn.disabled = true;

  try {
    profile = collectProfile();
    await saveProfile(profile);
    renderForm();
    showStatus('Profile saved.', 'success');
  } catch (err) {
    showStatus('Failed to save profile.', 'error');
    console.error('[ApplyKit] Save error:', err);
  } finally {
    btn.disabled = false;
  }
}

async function onFill(): Promise<void> {
  const btn = getEl<HTMLButtonElement>('fill-btn');
  btn.disabled = true;
  btn.textContent = 'Filling…';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.id) {
      showStatus('No active tab found.', 'error');
      return;
    }

    const response = await chrome.tabs.sendMessage<{ type: string }, FillAllResponse>(
      tab.id,
      { type: 'FILL_ALL' },
    );

    if (response.success && response.result) {
      const { filled, skipped } = response.result;
      if (filled === 0) {
        showStatus('No matching fields found on this page.', 'error');
      } else {
        const note = skipped > 0 ? ` (${skipped} skipped)` : '';
        showStatus(`Filled ${filled} field${filled !== 1 ? 's' : ''} successfully.${note}`, 'success');
      }
    } else {
      showStatus(response.error ?? 'Fill operation failed.', 'error');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Could not establish connection')) {
      showStatus('Reload the page and try again.', 'error');
    } else {
      showStatus(msg, 'error');
    }
    console.error('[ApplyKit] Fill error:', err);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Fill Application';
  }
}

function attachListeners(): void {
  getEl('add-field-btn').addEventListener('click', onAddField);
  getEl('save-btn').addEventListener('click', () => void onSave());
  getEl('fill-btn').addEventListener('click', () => void onFill());

  getEl('profile-form').addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLButtonElement>('[data-remove-id]');
    if (btn?.dataset.removeId) onRemoveField(btn.dataset.removeId);
  });
}

async function init(): Promise<void> {
  try {
    profile = await getProfile();
    renderForm();
    attachListeners();
  } catch (err) {
    console.error('[ApplyKit] Init error:', err);
    showStatus('Failed to load profile.', 'error');
  }
}

void init();
