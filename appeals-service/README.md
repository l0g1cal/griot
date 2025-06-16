# appeals-service

Backend service for managing tribunal appeals: intake, means assessment,
fee calculation, review queue and applicant correspondence. Also bridges
records from the legacy ticketing system while migration is in flight.

## Specs

`specs/` is the shared source of truth, maintained by BAs and developers
together — domain meanings in `specs/domains/`, business rules in
`specs/functions/`. See [specs/README.md](specs/README.md).

## Modules

- `src/intake` — new appeal cases (validation, lifecycle)
- `src/assessment` — payslips and income assessment (tier determination)
- `src/household` — household grouping over declared financial links
- `src/documents` — evidence documents and retention
- `src/search` — unified search across intake and legacy records
- `src/legacy` — read-side of the old ticketing system
- `src/pricing` — filing fee calculation and the regulator audit ledger
- `src/review` — review queue and decisions
- `src/notifications` — applicant correspondence (module keeps its legacy name)

## Development

```sh
npm install
npm test
npm run typecheck
```
