import type { Ticket } from './ticket';

/** Snapshot export from the legacy system; refreshed nightly in production. */
const TICKETS: Ticket[] = [
  {
    ref: 'TKT-000482',
    kind: 'PARK',
    band: 'B',
    zone: 1,
    holder: 'R. Patterson',
    body: 'Signage at the contested bay was obscured by roadworks hoarding.',
    state: 'OPEN',
    lodgedOn: '2024-06-14',
  },
  {
    ref: 'TKT-000513',
    kind: 'LIC',
    band: 'A',
    zone: 3,
    holder: 'H. Nguyen',
    body: 'Renewal posted before the deadline; delivery delay outside applicant control.',
    state: 'OPEN',
    lodgedOn: '2024-07-02',
  },
];

export function openTickets(): Ticket[] {
  return TICKETS.filter((t) => t.state === 'OPEN');
}

export function findTicket(ref: string): Ticket | undefined {
  return TICKETS.find((t) => t.ref === ref);
}
