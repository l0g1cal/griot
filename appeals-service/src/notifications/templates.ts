import type { AppealCase } from '../intake/case';
import type { Decision } from '../review/decision';
import { formatPounds } from '../shared/money';
import type { Pence } from '../shared/money';

export function submissionReceived(appeal: AppealCase, feeTotal: Pence): string {
  return [
    `Dear ${appeal.applicantName},`,
    '',
    `Your appeal ${appeal.id} has been received and is awaiting review.`,
    `The filing fee assessed for your case is ${formatPounds(feeTotal)}.`,
  ].join('\n');
}

export function decisionIssued(appeal: AppealCase, decision: Decision): string {
  const verdict = decision.outcome === 'upheld' ? 'upheld' : 'dismissed';
  return [
    `Dear ${appeal.applicantName},`,
    '',
    `A decision has been issued on appeal ${appeal.id}: the appeal was ${verdict}.`,
    `Reason: ${decision.reason}`,
  ].join('\n');
}
