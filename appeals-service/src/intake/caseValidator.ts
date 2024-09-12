import type { CaseDraft } from './case';

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateDraft(draft: CaseDraft): ValidationResult {
  const errors: string[] = [];

  if (draft.applicantName.trim().length === 0) {
    errors.push('applicantName is required');
  }
  if (draft.grounds.trim().length < 20) {
    errors.push('grounds must set out the basis of the appeal (min 20 chars)');
  }

  return { ok: errors.length === 0, errors };
}
