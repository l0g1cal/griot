# Specs — the shared source of truth

This directory is maintained by **BAs and developers together** and lives in the
repo on purpose: every change to a domain meaning or a business rule goes
through a PR, with the rationale in the commit body. The git history of these
files **is** the decision log — there is no separate Confluence page to go stale.

Conventions:

- `domains/` — one file per business object (Case, Correspondence, Assessment,
  Document, Payslip). Attributes, meanings, and the rules that govern them.
- `functions/` — one file per business function (Search, Household Grouping,
  Income Assessment, Fee Calculation). The business rules, in business language,
  with pointers to the code that implements them.
- Spec changes land **before or with** the code change they describe. If code
  must diverge temporarily, say so in the commit body and flag it for the daily
  huddle.
- Write commit messages for the colleague who reads them in a year: what
  changed, **why**, and who decided.
