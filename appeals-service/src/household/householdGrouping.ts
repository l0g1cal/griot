import type { AppealCase } from '../intake/case';

/**
 * A declared financial link between two applicants' cases. Links are
 * declared by the applicant or recorded by a case officer — never inferred
 * (specs/functions/household-grouping.md §2).
 */
export interface FinancialLink {
  caseId: string;
  linkedCaseId: string;
  kind: 'declared-partner' | 'joint-account';
  declaredOn: string; // yyyy-mm-dd
}

export interface HouseholdGroup {
  id: string;
  memberCaseIds: string[];
}

/**
 * Groups cases into households over declared financial links (transitive).
 * A shared address alone never forms a household — see the 2025-05-09 UAT
 * incident in the spec. Cases with no links form no group.
 */
export function groupHouseholds(cases: AppealCase[], links: FinancialLink[]): HouseholdGroup[] {
  const parent = new Map<string, string>();
  const known = new Set(cases.map((c) => c.id));

  function find(id: string): string {
    let root = id;
    while (parent.get(root) !== undefined && parent.get(root) !== root) root = parent.get(root)!;
    return root;
  }

  function union(a: string, b: string): void {
    const [ra, rb] = [find(a), find(b)];
    if (ra !== rb) parent.set(ra, rb);
  }

  for (const link of links) {
    if (known.has(link.caseId) && known.has(link.linkedCaseId)) {
      union(link.caseId, link.linkedCaseId);
    }
  }

  const members = new Map<string, string[]>();
  for (const c of cases) {
    const root = find(c.id);
    if (!members.has(root)) members.set(root, []);
    members.get(root)!.push(c.id);
  }

  let seq = 0;
  const groups: HouseholdGroup[] = [];
  for (const ids of members.values()) {
    if (ids.length < 2) continue; // a household is two or more linked cases
    seq += 1;
    groups.push({ id: `HH-${String(seq).padStart(4, '0')}`, memberCaseIds: ids.sort() });
  }
  return groups;
}

/**
 * Cases sharing an address without a declared link — surfaced to case
 * officers as "possible links to review", never auto-grouped.
 */
export function possibleLinksToReview(cases: AppealCase[], links: FinancialLink[]): string[][] {
  const grouped = new Set(groupHouseholds(cases, links).flatMap((g) => g.memberCaseIds));
  const byAddress = new Map<string, string[]>();
  for (const c of cases) {
    if (!c.address || grouped.has(c.id)) continue;
    const key = c.address.trim().toLowerCase();
    if (!byAddress.has(key)) byAddress.set(key, []);
    byAddress.get(key)!.push(c.id);
  }
  return [...byAddress.values()].filter((ids) => ids.length > 1);
}
