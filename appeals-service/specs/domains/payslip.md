# Domain: Payslip

Structured pay data extracted from an uploaded payslip Document. The
evidence base for Income Assessment.

## Attributes

| Attribute | Meaning | Code |
|---|---|---|
| `documentId` | The evidence Document this was extracted from. | `src/assessment/payslip.ts#Payslip` |
| `employer` | Employer named on the slip. | `Payslip.employer` |
| `payDate` | The pay date on the slip — this is what the lookback window filters on, not the upload date. | `Payslip.payDate` |
| `grossPence` / `netPence` | Gross and net pay for the period, integer pence. | `Payslip` |
| `frequency` | weekly, fortnightly or monthly. | `PayFrequency` |

## Rules

- Assessment uses **net** pay (see `functions/income-assessment.md` for why).
- Weekly-equivalent conversion: fortnightly ÷ 2; monthly × 12 ÷ 52
  (MT-4 §2.5 — a "month ÷ 4.33" approximation drifts against the statutory
  definition of a week and is not acceptable).
- A Payslip is retained and purged with its parent Document
  (see `domains/document.md`).
