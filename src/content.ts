import type { ExtensionMessage, FillAllResponse } from './types';
import { getProfile } from './storage';
import { scanInputs } from './scanner';
import { classifyFields } from './classifier';
import { fillFields } from './filler';

chrome.runtime.onMessage.addListener((
  message: ExtensionMessage,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response: FillAllResponse) => void,
): boolean => {
  if (message.type !== 'FILL_ALL') return false;
  void handleFillAll(sendResponse);
  return true; // keep channel open for async sendResponse
});

async function handleFillAll(
  sendResponse: (response: FillAllResponse) => void
): Promise<void> {
  try {
    const profile = await getProfile();
    const scanned = scanInputs();
    const classified = classifyFields(scanned, profile);
    const result = fillFields(classified, profile);
    sendResponse({ success: true, result });
  } catch (error) {
    sendResponse({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred.',
    });
  }
}
