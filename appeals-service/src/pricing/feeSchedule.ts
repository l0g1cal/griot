import type { Pence } from '../shared/money';
import type { ApplicantTier, CaseCategory, Region } from '../intake/case';

export const BASE_FEES: Record<CaseCategory, Pence> = {
  parking: 12000,
  licensing: 18000,
  planning: 26000,
};

export const TIER_DISCOUNTS: Record<ApplicantTier, number> = {
  standard: 0,
  concession: 0.25,
  hardship: 0.5,
};

export const REGIONAL_LEVIES: Record<Region, number> = {
  metro: 0.1,
  regional: 0.05,
  remote: 0,
};
