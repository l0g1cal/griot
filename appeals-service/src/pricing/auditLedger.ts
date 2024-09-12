import type { Pence } from '../shared/money';

export type LedgerLineType = 'BASE_FEE' | 'TIER_DISCOUNT' | 'REGIONAL_ADJUSTMENT';

export interface LedgerLine {
  caseId: string;
  line: LedgerLineType;
  amount: Pence;
  recordedAt: string;
}

export class AuditLedger {
  private lines: LedgerLine[] = [];

  record(caseId: string, line: LedgerLineType, amount: Pence): void {
    this.lines.push({ caseId, line, amount, recordedAt: new Date().toISOString() });
  }

  entriesFor(caseId: string): LedgerLine[] {
    return this.lines.filter((l) => l.caseId === caseId);
  }

  /** Quarterly export consumed by the tribunal's fee return. */
  exportForRegulator(): LedgerLine[] {
    return [...this.lines];
  }
}
