import type { ClassifiedField, FillResult, Profile } from './types';

// React overrides the input's value setter, so `el.value = x` skips its change detection.
// Calling the native prototype setter makes React register the update.
function getNativeSetter(el: HTMLInputElement | HTMLTextAreaElement) {
  const proto = el instanceof HTMLTextAreaElement
    ? HTMLTextAreaElement.prototype
    : HTMLInputElement.prototype;

  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value');
  return descriptor?.set?.bind(el) ?? null;
}

function setInputValue(
  el: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): void {
  const nativeSetter = getNativeSetter(el);
  nativeSetter ? nativeSetter(value) : (el.value = value);

  const events = ['input', 'change', 'blur'];
  for (const eventName of events) {
    el.dispatchEvent(
      new Event(eventName, { bubbles: true, cancelable: true }),
    );
  }
}

export function fillFields(
  classifiedFields: ClassifiedField[],
  profile: Profile,
): FillResult {
  const profileMap = new Map(profile.map((f) => [f.id, f.value]));
  let filled = 0;
  let skipped = 0;

  for (const { element, category } of classifiedFields) {
    const value = profileMap.get(category);

    if (!value?.trim()) {
      skipped++;
      continue;
    }

    try {
      setInputValue(element, value.trim());
      filled++;
    } catch {
      skipped++;
    }
  }

  return { filled, skipped };
}
