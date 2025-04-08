# Domain: Document

A file uploaded as evidence on a Case: payslips, bank statements, decision
letters, other supporting evidence.

## Attributes

| Attribute | Meaning | Code |
|---|---|---|
| `kind` | payslip, bank-statement, decision-letter or supporting-evidence. | `src/documents/document.ts#DocumentKind` |
| `caseId` | The Case the Document belongs to. | `CaseDocument.caseId` |
| `fileName` | Original upload name; never used as an identifier. | `CaseDocument.fileName` |
| `uploadedAt` / `uploadedBy` | Provenance of the upload. | `CaseDocument` |

## Rules

- **Retention (DPIA-2025-014):** financial evidence (payslips, bank
  statements, supporting evidence) is personal data and is purged **730 days
  after case closure** — held only as long as an appeal can be reopened.
  Decision letters are part of the tribunal record and are kept **7 years**.
- A Payslip record is *extracted from* a Document of kind `payslip`; the
  Document is the evidence, the Payslip is the structured data.
