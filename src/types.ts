export interface ProfileField {
  readonly id: string;
  label: string;
  value: string;
  // true for built-in fields, false for user-added
  readonly isPredefined: boolean;
}

export type Profile = ProfileField[];

export interface ScannedField {
  element: HTMLInputElement | HTMLTextAreaElement;
  label: string;
  autocomplete?: string;
}

export interface ClassifiedField {
  element: HTMLInputElement | HTMLTextAreaElement;
  // matches a ProfileField.id
  category: string;
}

export interface FillResult {
  filled: number;
  skipped: number;
}

export interface FillAllMessage {
  type: 'FILL_ALL';
}

export type ExtensionMessage = FillAllMessage;

export interface FillAllResponse {
  success: boolean;
  result?: FillResult;
  error?: string;
}
