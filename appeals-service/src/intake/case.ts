export type CaseCategory = 'parking' | 'licensing' | 'planning';

export type ApplicantTier = 'standard' | 'concession' | 'hardship';

export type Region = 'metro' | 'regional' | 'remote';

export type CaseStatus = 'draft' | 'submitted' | 'under-review' | 'decided';

export interface AppealCase {
  id: string;
  category: CaseCategory;
  tier: ApplicantTier;
  region: Region;
  applicantName: string;
  grounds: string;
  status: CaseStatus;
  openedAt: string; // ISO date
}

export interface CaseDraft {
  category: CaseCategory;
  tier: ApplicantTier;
  region: Region;
  applicantName: string;
  grounds: string;
}
