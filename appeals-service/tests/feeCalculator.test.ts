import { describe, expect, it } from 'vitest';
import { calculateFilingFee } from '../src/pricing/feeCalculator';
import { AuditLedger } from '../src/pricing/auditLedger';
import type { AppealCase } from '../src/intake/case';

function makeCase(overrides: Partial<AppealCase>): AppealCase {
  return {
    id: 'CASE-000001',
    category: 'parking',
    tier: 'standard',
    region: 'remote',
    applicantName: 'Test Applicant',
    grounds: 'The penalty was issued in error and should be reviewed.',
    status: 'submitted',
    openedAt: '2024-08-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('calculateFilingFee', () => {
  it('charges the base fee for a standard-tier remote-region case', () => {
    const fee = calculateFilingFee(makeCase({}), new AuditLedger());
    expect(fee.total).toBe(12000);
  });

  it('discounts a concession parking appeal in a metro region', () => {
    const appeal = makeCase({ tier: 'concession', region: 'metro' });
    const fee = calculateFilingFee(appeal, new AuditLedger());
    expect(fee.total).toBe(9900);
  });

  it('halves the fee for hardship applicants', () => {
    const appeal = makeCase({ category: 'licensing', tier: 'hardship', region: 'regional' });
    const fee = calculateFilingFee(appeal, new AuditLedger());
    expect(fee.total).toBe(9450);
  });

  it('applies the metro levy to planning appeals', () => {
    const appeal = makeCase({ category: 'planning', region: 'metro' });
    const fee = calculateFilingFee(appeal, new AuditLedger());
    expect(fee.total).toBe(28600);
  });

  it('writes a ledger line per pricing step', () => {
    const ledger = new AuditLedger();
    calculateFilingFee(makeCase({}), ledger);
    expect(ledger.entriesFor('CASE-000001')).toHaveLength(3);
  });
});
