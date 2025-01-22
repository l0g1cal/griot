import type { Ticket } from './ticket';
import type { AppealCase, ApplicantTier, CaseCategory, Region } from '../intake/case';

const KIND_TO_CATEGORY: Record<Ticket['kind'], CaseCategory> = {
  PARK: 'parking',
  LIC: 'licensing',
  PLAN: 'planning',
};

const BAND_TO_TIER: Record<Ticket['band'], ApplicantTier> = {
  A: 'standard',
  B: 'concession',
  C: 'hardship',
};

const ZONE_TO_REGION: Record<Ticket['zone'], Region> = {
  1: 'metro',
  2: 'regional',
  3: 'remote',
};

export function ticketToCase(ticket: Ticket): AppealCase {
  const caseId = normalizeRef(ticket.ref);
  if (caseId == null) {
    throw new Error(`legacy ticket ${ticket.ref} could not be normalized`);
  }

  return {
    id: caseId,
    category: KIND_TO_CATEGORY[ticket.kind],
    tier: BAND_TO_TIER[ticket.band],
    region: ZONE_TO_REGION[ticket.zone],
    applicantName: ticket.holder,
    grounds: ticket.body,
    status: ticket.state === 'OPEN' ? 'submitted' : 'decided',
    openedAt: new Date(`${ticket.lodgedOn}T00:00:00.000Z`).toISOString(),
  };
}

function normalizeRef(ref: string): string {
  return ref.replace(/^TKT-/, 'CASE-LEG-');
}
