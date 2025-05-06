import { describe, expect, it } from 'vitest';
import { assessTier } from '../src/assessment/incomeAssessment';
import { weeklyEquivalentPence, type Payslip } from '../src/assessment/payslip';

let seq = 0;
function slip(overrides: Partial<Payslip>): Payslip {
  seq += 1;
  return {
    id: `PAY-${seq}`,
    caseId: 'CASE-000001',
    documentId: `DOC-${seq}`,
    employer: 'Brightside Ltd',
    payDate: '2026-06-05',
    grossPence: 52_000,
    netPence: 41_000,
    frequency: 'weekly',
    ...overrides,
  };
}

const AS_OF = new Date('2026-06-11T00:00:00.000Z');

describe('weeklyEquivalentPence', () => {
  it('passes weekly net through unchanged', () => {
    expect(weeklyEquivalentPence(slip({ netPence: 30_000, frequency: 'weekly' }))).toBe(30_000);
  });

  it('halves fortnightly net', () => {
    expect(weeklyEquivalentPence(slip({ netPence: 60_000, frequency: 'fortnightly' }))).toBe(30_000);
  });

  it('annualises monthly net then divides by 52 (MT-4 §2.5)', () => {
    expect(weeklyEquivalentPence(slip({ netPence: 130_000, frequency: 'monthly' }))).toBe(30_000);
  });
});

describe('assessTier', () => {
  it('assesses hardship at or below £215 weekly net', () => {
    const result = assessTier('CASE-000001', [slip({ netPence: 21_500 })], AS_OF);
    expect(result.tier).toBe('hardship');
  });

  it('assesses concession between hardship and £380 weekly net', () => {
    const result = assessTier('CASE-000001', [slip({ netPence: 35_000 })], AS_OF);
    expect(result.tier).toBe('concession');
  });

  it('assesses standard above £380 weekly net', () => {
    const result = assessTier('CASE-000001', [slip({ netPence: 41_000 })], AS_OF);
    expect(result.tier).toBe('standard');
  });

  it('averages weekly equivalents across mixed frequencies', () => {
    const result = assessTier(
      'CASE-000001',
      [slip({ netPence: 30_000, frequency: 'weekly' }), slip({ netPence: 130_000, frequency: 'monthly', payDate: '2026-05-28' })],
      AS_OF,
    );
    expect(result.weeklyNetPence).toBe(30_000);
    expect(result.payslipsConsidered).toBe(2);
  });

  it('excludes payslips with pay dates outside the lookback window', () => {
    const result = assessTier(
      'CASE-000001',
      [slip({ netPence: 20_000, payDate: '2026-01-09' }), slip({ netPence: 41_000, payDate: '2026-06-05' })],
      AS_OF,
    );
    expect(result.payslipsConsidered).toBe(1);
    expect(result.tier).toBe('standard');
  });

  it('assesses standard when no payslips fall in the window — never guesses a lower tier', () => {
    const result = assessTier('CASE-000001', [slip({ netPence: 10_000, payDate: '2025-01-02' })], AS_OF);
    expect(result.payslipsConsidered).toBe(0);
    expect(result.tier).toBe('standard');
  });
});
