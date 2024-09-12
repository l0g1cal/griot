import type { AppealCase, CaseDraft } from './case';
import { validateDraft } from './caseValidator';
import { newCaseId } from '../shared/ids';

const cases = new Map<string, AppealCase>();

export function submitCase(draft: CaseDraft): AppealCase {
  const result = validateDraft(draft);
  if (!result.ok) {
    throw new Error(`invalid case draft: ${result.errors.join('; ')}`);
  }

  const appeal: AppealCase = {
    id: newCaseId(),
    ...draft,
    status: 'submitted',
    openedAt: new Date().toISOString(),
  };
  cases.set(appeal.id, appeal);
  return appeal;
}

export function getCase(id: string): AppealCase | undefined {
  return cases.get(id);
}

export function registerCase(appeal: AppealCase): void {
  cases.set(appeal.id, appeal);
}

/** Test helper. */
export function clearCases(): void {
  cases.clear();
}
