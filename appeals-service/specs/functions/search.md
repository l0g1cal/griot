# Function: Search

Finds Cases across the whole estate: intake cases AND records bridged from
the legacy ticketing system, as one result set.

## Business rules

1. **One result set, no double counting.** A bridged legacy Ticket IS a Case
   (PR #61). Results are deduplicated by normalized reference — a record that
   exists on both sides must appear once.
2. **Both reference schemes work.** Case officers still quote legacy refs
   from old paperwork. A query for `TKT-000482` and a query for
   `CASE-LEG-000482` must find the same record.
3. **Match on reference or applicant name**, optionally filtered by status.
   Applicant name matching is case-insensitive substring — officers search
   from handwritten notes.

## Code

`src/search/caseSearch.ts` (reference normalization shared with
`src/legacy/ticketAdapter.ts`)
