# Domain: Assessment

The means assessment of an applicant's income, which determines their fee
`tier` (standard / concession / hardship). An Assessment is evidence-based:
it is computed from Payslips, never self-declared.

## Attributes

| Attribute | Meaning | Code |
|---|---|---|
| `caseId` | The Case being assessed. | `src/assessment/incomeAssessment.ts#IncomeAssessment` |
| `weeklyNetPence` | Assessed weekly net income, in pence. | `IncomeAssessment.weeklyNetPence` |
| `payslipsConsidered` | How many payslips fell inside the lookback window. | `IncomeAssessment.payslipsConsidered` |
| `tier` | The resulting fee tier. | `IncomeAssessment.tier` |
| `assessedAt` | When the assessment was run. | `IncomeAssessment.assessedAt` |

## Rules

- Assessment rules live in `functions/income-assessment.md` — thresholds and
  the lookback window are policy, not engineering choices.
- An Assessment with zero payslips in the window assesses at **standard**; the
  applicant may re-submit with evidence.
