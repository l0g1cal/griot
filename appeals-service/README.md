# appeals-service

Backend service for managing tribunal appeals: intake, fee assessment,
review queue and decision notifications. Also bridges records from the
legacy ticketing system while migration is in flight.

## Modules

- `src/intake` — new appeal cases (validation, lifecycle)
- `src/legacy` — read-side of the old ticketing system
- `src/pricing` — filing fee assessment
- `src/review` — review queue and decisions
- `src/notifications` — applicant notifications

## Development

```sh
npm install
npm test
npm run typecheck
```
