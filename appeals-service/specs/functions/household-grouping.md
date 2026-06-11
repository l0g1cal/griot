# Function: Household Grouping

Groups related Cases into a household so that Income Assessment can assess
combined household income, and so concession handling treats the household
as one unit.

## Business rules

1. **A shared address NEVER forms a household on its own.** Flat-shares and
   HMOs share an address but not finances — UAT incident 2025-05-09 grouped
   four unrelated tenants and combined their incomes, wrongly assessing all
   four at standard. Address may only *flag* a possible link for review.
2. **A household requires a declared financial link** between applicants:
   a declared partner or a joint account. Links are declared by the
   applicant or recorded by a case officer; they are never inferred.
3. **Links are transitive.** If A is linked to B and B to C, all three form
   one household unit.
4. One household unit, one combined assessment: all members' payslips feed
   the household unit's Income Assessment, and a joint assessment is
   recorded against every member Case.

## Code

`src/household/householdGrouping.ts`
