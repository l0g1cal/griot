# Domain: Case

A single appeal lodged by an applicant, from draft through decision. The
canonical concept of the system — everything else hangs off a Case.

## Attributes

| Attribute | Meaning | Code |
|---|---|---|
| `id` | Case reference, `CASE-nnnnnn`. Bridged legacy records use `CASE-LEG-nnnnnn`. | `src/intake/case.ts#AppealCase` |
| `category` | What is being appealed: parking, licensing or planning. | `CaseCategory` |
| `tier` | Applicant fee category: standard, concession or hardship. Set by Income Assessment, not by the applicant. | `ApplicantTier` |
| `region` | Where the matter arose: metro, regional or remote. Drives the regional fee levy. | `Region` |
| `grounds` | The applicant's stated basis for the appeal. | `AppealCase.grounds` |
| `status` | draft → submitted → under-review → decided. | `CaseStatus` |

## Rules

- A Case is created by intake validation (`src/intake/caseValidator.ts`); it
  cannot enter the review queue unless `status` is `submitted`.
- **Terminology:** the legacy ticketing system calls this concept a **Ticket**
  (`band` ↔ `tier`, `zone` ↔ `region`, `body` ↔ `grounds`). A bridged Ticket
  IS a Case — never count them as two records (PR #61).
