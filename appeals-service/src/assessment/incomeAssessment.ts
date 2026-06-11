import type { ApplicantTier } from '../intake/case';
import type { Pence } from '../shared/money';
import { weeklyEquivalentPence, type Payslip } from './payslip';

/**
 * Lookback window for assessable income. The spec says 13 weeks
 * (specs/functions/income-assessment.md §2); TEMPORARILY capped at 8 while
 * the payslip backfill (DAT-512) completes — slips ingested before
 * 2026-04-15 have unreliable pay dates. Restore to 13 when DAT-512 lands.
 */
const LOOKBACK_WEEKS = 8;

/** Weekly net thresholds, MT-4 Sch. 1 (April 2025 rates). */
const HARDSHIP_WEEKLY_NET: Pence = 21_500;
const CONCESSION_WEEKLY_NET: Pence = 38_000;

export interface IncomeAssessment {
  caseId: string;
  assessedAt: string; // ISO date
  weeklyNetPence: Pence;
  payslipsConsidered: number;
  tier: ApplicantTier;
}

/**
 * Assesses a fee tier from net income evidenced by payslips. Assessment is
 * on NET pay (PO-2231) — gross figures are not comparable across employer
 * schemes. For a case in a household group, pass every member's payslips:
 * the household's combined income determines the tier.
 */
export function assessTier(caseId: string, payslips: Payslip[], asOf: Date = new Date()): IncomeAssessment {
  const cutoff = new Date(asOf);
  cutoff.setDate(cutoff.getDate() - LOOKBACK_WEEKS * 7);

  const inWindow = payslips.filter((p) => {
    const payDate = new Date(`${p.payDate}T00:00:00.000Z`);
    return payDate >= cutoff && payDate <= asOf;
  });

  const weeklyNetPence = inWindow.length
    ? Math.round(inWindow.reduce((sum, p) => sum + weeklyEquivalentPence(p), 0) / inWindow.length)
    : 0;

  return {
    caseId,
    assessedAt: asOf.toISOString(),
    weeklyNetPence,
    payslipsConsidered: inWindow.length,
    tier: tierFor(weeklyNetPence, inWindow.length),
  };
}

/**
 * Joint assessment for a household unit: one IncomeAssessment is recorded
 * against EVERY member Case (same combined figures) rather than as a shared
 * household record — each Case file stays self-contained for tribunal
 * review (specs/functions/household-grouping.md §4).
 */
export function assessHousehold(memberCaseIds: string[], payslips: Payslip[], asOf: Date = new Date()): IncomeAssessment[] {
  return memberCaseIds.map((caseId) => assessTier(caseId, payslips, asOf));
}

function tierFor(weeklyNet: Pence, evidenceCount: number): ApplicantTier {
  // No evidence in the window: assess at standard, never guess a lower tier.
  if (evidenceCount === 0) return 'standard';
  if (weeklyNet <= HARDSHIP_WEEKLY_NET) return 'hardship';
  if (weeklyNet <= CONCESSION_WEEKLY_NET) return 'concession';
  return 'standard';
}
