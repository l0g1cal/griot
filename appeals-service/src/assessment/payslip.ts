import type { Pence } from '../shared/money';

export type PayFrequency = 'weekly' | 'fortnightly' | 'monthly';

/** Structured pay data extracted from an uploaded payslip Document. */
export interface Payslip {
  id: string;
  caseId: string;
  documentId: string;
  employer: string;
  payDate: string; // yyyy-mm-dd — the pay date on the slip, not the upload date
  grossPence: Pence;
  netPence: Pence;
  frequency: PayFrequency;
}

/**
 * Net pay as a weekly-equivalent figure. Monthly pay is annualised then
 * divided by 52 (MT-4 §2.5) — "month ÷ 4.33" drifts against the statutory
 * definition of a week.
 */
export function weeklyEquivalentPence(payslip: Payslip): Pence {
  switch (payslip.frequency) {
    case 'weekly':
      return payslip.netPence;
    case 'fortnightly':
      return Math.round(payslip.netPence / 2);
    case 'monthly':
      return Math.round((payslip.netPence * 12) / 52);
  }
}
