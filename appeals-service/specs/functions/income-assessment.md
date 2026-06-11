# Function: Income Assessment

Determines an applicant's fee `tier` from the net income evidenced by their
Payslips. Tier drives the filing fee discount (see `fee-calculation.md`).

## Business rules

1. **Net, not gross.** Assessment uses net pay. Deductions at source vary by
   employer scheme (salary sacrifice, court orders, pension auto-enrolment
   rates), so gross figures are not comparable across applicants. Decided by
   the policy team, PO-2231, 2025-04-02.
2. **13-week lookback.** Only payslips whose *pay date* falls within the 13
   weeks before assessment count. 13 weeks aligns with the tribunal's
   means-test guidance MT-4 §2.3; a shorter window over-weights one-off
   payments, a longer one hides recent job loss.
3. **Household income.** Where the Case belongs to a household group
   (see `household-grouping.md`), the assessment combines the net income of
   all household members — the household pays one set of bills.
4. **Thresholds (MT-4 Sch. 1).** Weekly net income ≤ £215.00 → hardship;
   ≤ £380.00 → concession; above → standard (April 2025 rates, in force).
   **From 1 July 2026**, per the MT-4 Sch. 1 uprating circular (April 2026
   rates): hardship ≤ £223.50, concession ≤ £394.50. Assessments *run* on or
   after that date use the new rates — the pay dates of the evidence do not
   matter.
5. **No evidence → standard.** Zero payslips in the window assesses at
   standard; the applicant may re-submit with evidence. Never guess a tier.

## Code

`src/assessment/incomeAssessment.ts`, `src/assessment/payslip.ts`
