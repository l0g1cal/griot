import { describe, expect, it } from 'vitest';
import { validateDraft } from '../src/intake/caseValidator';
import type { CaseDraft } from '../src/intake/case';

const validDraft: CaseDraft = {
  category: 'licensing',
  tier: 'standard',
  region: 'regional',
  applicantName: 'H. Nguyen',
  grounds: 'Renewal posted before the deadline; delivery delay outside applicant control.',
};

describe('validateDraft', () => {
  it('accepts a complete draft', () => {
    expect(validateDraft(validDraft)).toEqual({ ok: true, errors: [] });
  });

  it('requires an applicant name', () => {
    const result = validateDraft({ ...validDraft, applicantName: '  ' });
    expect(result.ok).toBe(false);
    expect(result.errors).toContain('applicantName is required');
  });

  it('caps grounds at 4000 characters', () => {
    const result = validateDraft({ ...validDraft, grounds: 'x'.repeat(4001) });
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/4000/);
  });
});
