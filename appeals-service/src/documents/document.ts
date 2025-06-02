export type DocumentKind = 'payslip' | 'bank-statement' | 'decision-letter' | 'supporting-evidence';

/** A file uploaded as evidence on a Case. */
export interface CaseDocument {
  id: string;
  caseId: string;
  kind: DocumentKind;
  fileName: string;
  uploadedAt: string; // ISO date
  uploadedBy: string;
}

/**
 * Retention after case closure, in days (DPIA-2025-014). Financial evidence
 * is personal data held only as long as an appeal can be reopened; decision
 * letters are part of the tribunal record.
 */
export const RETENTION_AFTER_CLOSURE_DAYS: Record<DocumentKind, number> = {
  payslip: 730,
  'bank-statement': 730,
  'supporting-evidence': 730,
  'decision-letter': 2_555, // 7 years
};

export function isDueForPurge(doc: CaseDocument, caseClosedAt: string, now: Date = new Date()): boolean {
  const dueAt = new Date(caseClosedAt);
  dueAt.setDate(dueAt.getDate() + RETENTION_AFTER_CLOSURE_DAYS[doc.kind]);
  return now >= dueAt;
}
