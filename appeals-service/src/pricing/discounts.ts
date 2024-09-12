import { applyRate, type Pence } from '../shared/money';
import type { ApplicantTier } from '../intake/case';
import { TIER_DISCOUNTS } from './feeSchedule';

export function applyTierDiscount(amount: Pence, tier: ApplicantTier): Pence {
  return applyRate(amount, 1 - TIER_DISCOUNTS[tier]);
}
