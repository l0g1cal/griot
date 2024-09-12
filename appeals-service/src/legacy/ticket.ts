/**
 * Record shape from the legacy ticketing system (read-only).
 * Field names follow the old system's conventions.
 */
export interface Ticket {
  ref: string; // e.g. "TKT-000482"
  kind: 'PARK' | 'LIC' | 'PLAN';
  band: 'A' | 'B' | 'C';
  zone: 1 | 2 | 3;
  holder: string;
  body: string;
  state: 'OPEN' | 'CLOSED';
  lodgedOn: string; // yyyy-mm-dd
}
