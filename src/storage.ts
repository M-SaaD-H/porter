import type { Profile, ProfileField } from './types';

const STORAGE_KEY = 'porter_profile' as const;

export const PREDEFINED_FIELDS: ReadonlyArray<ProfileField> = [
  { id: 'name',      label: 'Name',        value: '', isPredefined: true },
  { id: 'email',     label: 'Email',       value: '', isPredefined: true },
  { id: 'phone',     label: 'Phone',       value: '', isPredefined: true },
  { id: 'location',  label: 'Location',    value: '', isPredefined: true },
  { id: 'github',    label: 'GitHub',      value: '', isPredefined: true },
  { id: 'linkedin',  label: 'LinkedIn',    value: '', isPredefined: true },
  { id: 'portfolio', label: 'Portfolio',   value: '', isPredefined: true },
  { id: 'twitter',   label: 'Twitter / X', value: '', isPredefined: true },
  { id: 'resume',    label: 'Resume URL',  value: '', isPredefined: true },
] as const;

const predefinedIds = new Set(PREDEFINED_FIELDS.map((f) => f.id));

// Keeps predefined fields in sync across extension updates while preserving
// user-added custom fields and any values they've already filled in.
function mergeWithPredefined(saved: Profile): Profile {
  const savedMap = new Map(saved.map((f) => [f.id, f]));

  const predefined: ProfileField[] = PREDEFINED_FIELDS.map((pf) => ({
    ...pf,
    value: savedMap.get(pf.id)?.value ?? '',
  }));

  const custom = saved.filter((f) => !predefinedIds.has(f.id));
  return [...predefined, ...custom];
}

export function getProfile(): Promise<Profile> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      const saved = result[STORAGE_KEY] as Profile | undefined;
      resolve(!saved || !Array.isArray(saved)
        ? PREDEFINED_FIELDS.map((f) => ({ ...f }))
        : mergeWithPredefined(saved));
    });
  });
}

export function saveProfile(profile: Profile): Promise<void> {
  // replace tmp ids for custom fields
  const newProfile = profile.map((f) => {
    if (!predefinedIds.has(f.id) && f.id.startsWith("tmp_custom_")) {
      return {
        ...f,
        id: `custom_${f.label.toLowerCase().replace(/\s/g, '_')}`,
      }
    }
    return f;
  })

  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: newProfile }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}
