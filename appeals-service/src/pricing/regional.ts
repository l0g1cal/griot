import { applyRate, type Pence } from '../shared/money';
import type { Region } from '../intake/case';
import { REGIONAL_LEVIES } from './feeSchedule';

export function applyRegionalAdjustment(amount: Pence, region: Region): Pence {
  return applyRate(amount, 1 + REGIONAL_LEVIES[region]);
}
