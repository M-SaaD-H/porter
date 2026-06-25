import type { ScannedField, ClassifiedField, Profile } from './types';

export const KEYWORD_MAP: Readonly<Record<string, readonly string[]>> = {
  name: [
    'name',
    'full name',
    'first name',
    'last name',
    'first and last name',
    'fullname',
  ],
  github: [
    'github',
    'github profile',
    'github url',
    'github link',
    'github username',
    'github handle',
  ],
  linkedin: [
    'linkedin',
    'linkedin profile',
    'linkedin url',
    'linkedin link',
    'linked in',
  ],
  portfolio: [
    'portfolio',
    'personal website',
    'personal site',
    'personal url',
    'website',
    'project website',
    'your website',
    'web portfolio',
  ],
  twitter: [
    'twitter',
    'twitter profile',
    'twitter url',
    'twitter handle',
    'x profile',
    'x account',
    'x handle',
    'x url',
  ],
  resume: [
    'resume',
    'resume url',
    'resume link',
    'cv',
    'curriculum vitae',
    'upload resume',
    'attach resume',
  ],
  email: [
    'email',
    'email address',
    'e-mail',
    'e mail',
    'your email',
    'work email',
    'contact email',
  ],
  phone: [
    'phone',
    'phone number',
    'mobile',
    'mobile number',
    'cell',
    'cell phone',
    'contact number',
    'telephone',
  ],
  location: [
    'location',
    'city',
    'current location',
    'city/state',
    'city, state',
    'where are you located',
    'your location',
  ],
} as const;

function normalizeLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function classifyLabel(normalizedLabel: string): string | null {
  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const keyword of keywords) {
      if (normalizedLabel.includes(keyword) || keyword.includes(normalizedLabel)) {
        return category;
      }
    }
  }

  return null;
}

export function classifyFields(
  scannedFields: ScannedField[],
  profile: Profile,
): ClassifiedField[] {
  const profileIds = new Set(profile.map((f) => f.id));
  // Fields with no KEYWORD_MAP entry are user-defined
  // Better than checking 'isPredefined' to eliminate any chance of error
  const customFields = profile.filter((f) => !KEYWORD_MAP[f.id]);
  const classified: ClassifiedField[] = [];

  for (const { element, label } of scannedFields) {
    const normalizedScannedLabel = normalizeLabel(label);
    if (!normalizedScannedLabel) continue;

    // Try to classify using KEYWORD_MAP (predefined labels)
    const category = classifyLabel(normalizedScannedLabel);
    if (category && profileIds.has(category)) {
      classified.push({ element, category });
      continue;
    }

    for (const customField of customFields) {
      const normalizedCustomLabel = normalizeLabel(customField.label);
      if (!normalizedCustomLabel) continue;

      if (normalizedScannedLabel.includes(normalizedCustomLabel) || normalizedCustomLabel.includes(normalizedScannedLabel)) {
        classified.push({ element, category: customField.id });
        break;
      }
    }
  }

  return classified;
}
