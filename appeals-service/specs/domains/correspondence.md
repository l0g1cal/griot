# Domain: Correspondence

Any outbound message to an applicant about their Case: submission
acknowledgements, fee notices, decision letters.

## Attributes

| Attribute | Meaning | Code |
|---|---|---|
| `to` | The applicant the message is addressed to. | `src/notifications/notifier.ts#OutboundMessage` |
| `body` | Rendered message text, built from a template. | `src/notifications/templates.ts` |
| `queuedAt` | When the message entered the outbox. | `OutboundMessage.queuedAt` |

## Rules

- All Correspondence is queued through the outbox — nothing is sent inline.
  The delivery worker owns transport.
- Every piece of Correspondence relates to exactly one Case and must be
  reconstructable for the tribunal record.
- **Terminology:** the business says **Correspondence**; the existing code
  module is `src/notifications/` and calls each item a *notification*. Same
  concept. New code and specs use Correspondence; the module keeps its name
  until the migration window.
