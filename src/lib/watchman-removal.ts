import { z } from 'zod';

export const MIN_REMOVAL_REASON = 15;
export const REMOVAL_CONFIRM_MS = 5000;
export const removalReasonSchema = z.string().trim().min(MIN_REMOVAL_REASON, 'Please explain why in at least 15 characters.').max(500);

export function removalNotice(message: string | null) {
  const text = message ?? '';
  const split = text.indexOf(' Reason: ');
  return {
    message: split < 0 ? text : text.slice(0, split),
    reason: split < 0 ? null : text.slice(split + ' Reason: '.length),
  };
}