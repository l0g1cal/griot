import { describe, expect, it } from 'vitest';
import type { AppealCase } from '../src/intake/case';
import { groupHouseholds, possibleLinksToReview, type FinancialLink } from '../src/household/householdGrouping';

function makeCase(id: string, address?: string): AppealCase {
  return {
    id,
    category: 'parking',
    tier: 'standard',
    region: 'metro',
    applicantName: `Applicant ${id}`,
    address,
    grounds: 'Signage was obscured.',
    status: 'submitted',
    openedAt: '2026-05-01T00:00:00.000Z',
  };
}

const link = (caseId: string, linkedCaseId: string): FinancialLink => ({
  caseId,
  linkedCaseId,
  kind: 'declared-partner',
  declaredOn: '2026-05-02',
});

describe('groupHouseholds', () => {
  it('groups cases connected by a declared financial link', () => {
    const cases = [makeCase('CASE-000001'), makeCase('CASE-000002')];
    const groups = groupHouseholds(cases, [link('CASE-000001', 'CASE-000002')]);
    expect(groups).toHaveLength(1);
    expect(groups[0].memberCaseIds).toEqual(['CASE-000001', 'CASE-000002']);
  });

  it('does NOT group cases that merely share an address', () => {
    const cases = [makeCase('CASE-000001', '12 Mill Lane'), makeCase('CASE-000002', '12 Mill Lane')];
    expect(groupHouseholds(cases, [])).toHaveLength(0);
  });

  it('treats links as transitive', () => {
    const cases = [makeCase('CASE-000001'), makeCase('CASE-000002'), makeCase('CASE-000003')];
    const groups = groupHouseholds(cases, [
      link('CASE-000001', 'CASE-000002'),
      link('CASE-000002', 'CASE-000003'),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].memberCaseIds).toHaveLength(3);
  });

  it('ignores links that reference unknown cases', () => {
    const cases = [makeCase('CASE-000001')];
    expect(groupHouseholds(cases, [link('CASE-000001', 'CASE-999999')])).toHaveLength(0);
  });
});

describe('possibleLinksToReview', () => {
  it('flags shared-address cases for officer review instead of grouping them', () => {
    const cases = [makeCase('CASE-000001', '12 Mill Lane'), makeCase('CASE-000002', '12 mill lane ')];
    const flagged = possibleLinksToReview(cases, []);
    expect(flagged).toHaveLength(1);
    expect(flagged[0]).toEqual(['CASE-000001', 'CASE-000002']);
  });

  it('does not flag cases already grouped by a declared link', () => {
    const cases = [makeCase('CASE-000001', '12 Mill Lane'), makeCase('CASE-000002', '12 Mill Lane')];
    expect(possibleLinksToReview(cases, [link('CASE-000001', 'CASE-000002')])).toHaveLength(0);
  });
});
