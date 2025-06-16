import { describe, expect, it } from 'vitest';
import type { AppealCase } from '../src/intake/case';
import type { Ticket } from '../src/legacy/ticket';
import { searchCases } from '../src/search/caseSearch';

const intakeCase: AppealCase = {
  id: 'CASE-000007',
  category: 'planning',
  tier: 'standard',
  region: 'regional',
  applicantName: 'M. Osei',
  grounds: 'Notice period was miscalculated.',
  status: 'submitted',
  openedAt: '2026-05-20T00:00:00.000Z',
};

const legacyTicket: Ticket = {
  ref: 'TKT-000482',
  kind: 'PARK',
  band: 'B',
  zone: 1,
  holder: 'R. Patterson',
  body: 'Signage at the contested bay was obscured.',
  state: 'OPEN',
  lodgedOn: '2024-06-14',
};

describe('searchCases', () => {
  it('finds a bridged legacy record by its legacy reference', () => {
    const results = searchCases([intakeCase], [legacyTicket], { text: 'TKT-000482' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('CASE-LEG-000482');
  });

  it('finds the same record by its normalized case reference', () => {
    const results = searchCases([intakeCase], [legacyTicket], { text: 'CASE-LEG-000482' });
    expect(results).toHaveLength(1);
    expect(results[0].applicantName).toBe('R. Patterson');
  });

  it('never returns a bridged record twice when it exists on both sides', () => {
    const alreadyBridged: AppealCase = { ...intakeCase, id: 'CASE-LEG-000482', applicantName: 'R. Patterson' };
    const results = searchCases([alreadyBridged], [legacyTicket], { text: 'patterson' });
    expect(results).toHaveLength(1);
  });

  it('matches applicant names case-insensitively', () => {
    const results = searchCases([intakeCase], [legacyTicket], { text: 'osei' });
    expect(results).toHaveLength(1);
    expect(results[0].id).toBe('CASE-000007');
  });

  it('filters by status across both sources', () => {
    const results = searchCases([intakeCase], [legacyTicket], { status: 'submitted' });
    expect(results).toHaveLength(2);
  });
});
