import { beforeEach, describe, expect, it } from 'vitest';
import { clearCases, getCase, submitCase } from '../src/intake/caseService';
import { resetIds } from '../src/shared/ids';

describe('submitCase', () => {
  beforeEach(() => {
    clearCases();
    resetIds();
  });

  it('assigns an id and marks the case submitted', () => {
    const appeal = submitCase({
      category: 'parking',
      tier: 'standard',
      region: 'metro',
      applicantName: 'R. Patterson',
      grounds: 'Signage at the contested bay was obscured by roadworks hoarding.',
    });

    expect(appeal.id).toBe('CASE-000001');
    expect(appeal.status).toBe('submitted');
    expect(getCase(appeal.id)).toEqual(appeal);
  });

  it('rejects drafts without grounds', () => {
    expect(() =>
      submitCase({
        category: 'parking',
        tier: 'standard',
        region: 'metro',
        applicantName: 'R. Patterson',
        grounds: 'too short',
      }),
    ).toThrow(/grounds/);
  });
});
