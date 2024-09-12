import type { Pence } from '../shared/money';
import type { AppealCase } from '../intake/case';
import { BASE_FEES } from './feeSchedule';
import { applyTierDiscount } from './discounts';
import { applyRegionalAdjustment } from './regional';
import type { AuditLedger } from './auditLedger';

export interface FeeBreakdown {
  caseId: string;
  baseFee: Pence;
  total: Pence;
}

export function calculateFilingFee(appeal: AppealCase, ledger: AuditLedger): FeeBreakdown {
  const baseFee = BASE_FEES[appeal.category];
  ledger.record(appeal.id, 'BASE_FEE', baseFee);

  const adjusted = applyRegionalAdjustment(baseFee, appeal.region);
  ledger.record(appeal.id, 'REGIONAL_ADJUSTMENT', adjusted);

  const total = applyTierDiscount(adjusted, appeal.tier);
  ledger.record(appeal.id, 'TIER_DISCOUNT', total);

  return { caseId: appeal.id, baseFee, total };
}
