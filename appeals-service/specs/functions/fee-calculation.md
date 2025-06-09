# Function: Fee Calculation

Computes the filing fee for a Case from the base schedule, the applicant's
tier discount, and the regional levy — and writes the audit ledger the
regulator reads.

## Business rules

1. **Order is regulatory, not stylistic.** `applyTierDiscount()` MUST run
   before `applyRegionalAdjustment()`. Under the Tribunal Fees Transparency
   Code (FTC Reg 4.2) the post-discount figure is the **assessed fee**
   reported on the quarterly fee return. Both steps are multiplicative, so
   the final total is identical in either order and every test passes both
   ways — the violation is only visible in the audit ledger line items.
   Source: PR #47 (Priya Sharma, 2024-11-18).
2. **Assessed fee ≠ amount payable.** The assessed fee is post-discount,
   pre-levy. Never report the final total to the regulator.
3. Tier comes from Income Assessment (`income-assessment.md`) — fee
   calculation never derives a tier itself.

## Code

`src/pricing/feeCalculator.ts`, `src/pricing/discounts.ts`,
`src/pricing/regional.ts`, `src/pricing/auditLedger.ts`
