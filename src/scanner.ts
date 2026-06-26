import type { ScannedField } from './types';

const SKIP_INPUT_TYPES = new Set([
  'password',
  'file',
  'checkbox',
  'radio',
  'hidden',
  'submit',
  'button',
  'image',
  'reset',
  'color',
  'range',
]);

// Priority: label[for] > wrapping label > aria-label > aria-labelledby > placeholder > name > id
export function extractLabel(
  el: HTMLInputElement | HTMLTextAreaElement
): string {
  if (el.id) {
    const linked = document.querySelector<HTMLLabelElement>(
      `label[for="${CSS.escape(el.id)}"]`,
    );
    const text = linked?.textContent?.trim();
    if (text) return text;
  }

  const wrappingLabel = el.closest('label');
  if (wrappingLabel) {
    // Clone before reading textContent to avoid picking up the input's own value
    const clone = wrappingLabel.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('input, textarea, select').forEach((n) => n.remove());
    const text = clone.textContent?.trim();
    if (text) return text;
  }

  const ariaLabel = el.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;

  const labelledById = el.getAttribute('aria-labelledby');
  if (labelledById) {
    const text = document.getElementById(labelledById)?.textContent?.trim();
    if (text) return text;
  }

  if ('placeholder' in el && el.placeholder?.trim()) {
    return el.placeholder.trim();
  }

  if (el.name?.trim()) return el.name.trim();
  if (el.id?.trim()) return el.id.trim();

  return '';
}

function isVisible(el: HTMLElement): boolean {
  if (el.offsetParent === null && el.tagName !== 'BODY') return false;
  const style = window.getComputedStyle(el);
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0'
  );
}

export function scanInputs(): ScannedField[] {
  const elements = document.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement
  >('input, textarea');

  const results: ScannedField[] = [];

  for (const el of elements) {
    if (
      el instanceof HTMLInputElement &&
      SKIP_INPUT_TYPES.has(el.type) ||
      el.disabled ||
      (el as HTMLInputElement).readOnly ||
      !isVisible(el)
    ) {
      continue;
    }

    const autocomplete = el.autocomplete || el.getAttribute('autocomplete') || undefined;
    
    const label = extractLabel(el);
    if (!label && !autocomplete) continue;

    results.push({ element: el, label, autocomplete });
  }

  return results;
}
