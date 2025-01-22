import { describe, expect, it } from 'vitest';
import { ticketToCase } from '../src/legacy/ticketAdapter';
import { openTickets } from '../src/legacy/ticketStore';

describe('ticketToCase', () => {
  it('maps legacy vocabulary onto the case model', () => {
    const [parking] = openTickets();
    const appeal = ticketToCase(parking);

    expect(appeal.id).toBe('CASE-LEG-000482');
    expect(appeal.category).toBe('parking');
    expect(appeal.tier).toBe('concession');
    expect(appeal.region).toBe('metro');
    expect(appeal.status).toBe('submitted');
  });

  it('adapts every open ticket in the snapshot', () => {
    const adapted = openTickets().map(ticketToCase);
    expect(adapted).toHaveLength(2);
    expect(adapted.every((c) => c.id.startsWith('CASE-LEG-'))).toBe(true);
  });
});
