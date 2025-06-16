import type { AppealCase, CaseStatus } from '../intake/case';
import type { Ticket } from '../legacy/ticket';
import { ticketToCase } from '../legacy/ticketAdapter';

export interface SearchQuery {
  /** Matches case reference (either scheme) or applicant name. */
  text?: string;
  status?: CaseStatus;
}

/**
 * Searches intake cases and bridged legacy tickets as ONE result set.
 * A legacy Ticket IS a Case (#61): results are deduplicated by normalized
 * reference, and a query in either reference scheme (TKT-000482 /
 * CASE-LEG-000482) finds the same record.
 */
export function searchCases(cases: AppealCase[], tickets: Ticket[], query: SearchQuery): AppealCase[] {
  const byRef = new Map<string, AppealCase>();
  for (const c of cases) byRef.set(c.id, c);
  for (const t of tickets) {
    const bridged = ticketToCase(t);
    if (!byRef.has(bridged.id)) byRef.set(bridged.id, bridged);
  }

  const needle = query.text?.trim().toLowerCase();
  return [...byRef.values()].filter((c) => {
    if (query.status && c.status !== query.status) return false;
    if (!needle) return true;
    const ref = c.id.toLowerCase();
    return (
      ref.includes(needle) ||
      refVariants(needle).some((v) => ref.includes(v)) ||
      c.applicantName.toLowerCase().includes(needle)
    );
  });
}

/** Expands a query term across both reference schemes. */
function refVariants(term: string): string[] {
  if (term.startsWith('tkt-')) return [term.replace(/^tkt-/, 'case-leg-')];
  if (term.startsWith('case-leg-')) return [term.replace(/^case-leg-/, 'tkt-')];
  return [];
}
