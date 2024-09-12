import type { AppealCase } from '../intake/case';

export type Outcome = 'upheld' | 'dismissed';

export interface Decision {
  caseId: string;
  outcome: Outcome;
  reason: string;
  decidedAt: string;
}

export function recordDecision(appeal: AppealCase, outcome: Outcome, reason: string): Decision {
  if (appeal.status === 'decided') {
    throw new Error(`case ${appeal.id} already has a decision`);
  }
  appeal.status = 'decided';
  return {
    caseId: appeal.id,
    outcome,
    reason,
    decidedAt: new Date().toISOString(),
  };
}
