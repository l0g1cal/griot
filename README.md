# ContextCaddy — demo workspace

**ContextCaddy solves context fragmentation in agile teams.** It assumes two practices
the team already has (or wants): a **spec-to-code pipeline** — BAs and devs
both commit to spec documents in the repo, with rich commit messages carrying
the business and technical rationale — and **domain-driven design**, where BAs
and devs agree on domain meanings that make sense to the business. ContextCaddy
builds on those habits to close the collaboration gaps between business and
tech for agent-augmented agile delivery.

## The four prongs

1. **Onboarding.** New joiners take weeks to become productive because the
   real rules aren't written anywhere, and handover documents go stale on
   arrival. The **Domain Models** tab (Case, Correspondence, Assessment,
   Document, Payslip) and **Business Functions** tab (Search, Household
   Grouping, Income Assessment, Fee Calculation) let BAs, devs — and clients —
   self-serve the system's actual meaning.
2. **Context history.** BDRs and ADRs live scattered across Confluence, Jira,
   Slack and people's heads. With the spec-in-repo habit, `git log` over an
   entity's spec + code paths **is** the chronological decision log. Every
   domain and function in the UI has a Context History timeline read **live
   from git commit messages** — who decided what, when, and why.
3. **The daily huddle.** Domain design decisions get made by devs in isolation
   because requirements move daily. The **Daily Huddle** tab turns the past
   day's spec/code commits into one discussion queue: flagged problems
   (spec↔code divergences, terminology drift, unexplained oddities) alongside
   spec changes and notable design decisions shared for awareness — each with
   a ContextCaddy suggestion. The facilitator records a **resolution action** per
   item ("No action — discussed" is a valid one); the decision becomes
   permanent knowledge. This closes the loop most DDD teams never close.
4. **Domain-aware coding agents.** The same knowledge regenerates
   `CLAUDE.md` + `.cursor/rules` in the client repo, so the in-editor agent
   respects the team's domain decisions in daily dev work.

## Two pieces

- **[appeals-service/](appeals-service/)** — a synthetic "client" repo: a
  tribunal appeals service practicing spec-to-code (`specs/domains/`,
  `specs/functions/`) with a crafted git history (Sep 2024 → Jun 2026, five
  authors: 1 BA + 4 devs) and planted landmines.
- **[contextcaddy/](contextcaddy/)** — the ContextCaddy prototype: knowledge graph (domains,
  functions, huddle queue), the rules generator, the huddle-resolution
  script, and the React UI.

## The planted landmines

| # | Landmine | Where | The trace |
|---|---|---|---|
| 1 | **Compliance ordering.** `applyTierDiscount()` must run before `applyRegionalAdjustment()`. Both multiplicative — swapping changes **no test result**, only the audit ledger the regulator reads. | `appeals-service/src/pricing/` | Commit `5195ade` (#47); promoted to `specs/functions/fee-calculation.md` in `c7a5925` (#92). |
| 2 | **Terminology traps.** Legacy `Ticket` ≡ intake `Case`; business `Correspondence` ≡ code `notification`. | `src/legacy/` vs `src/intake/`; `src/notifications/` | Commits `309fd26` (#61), `5ef25bc` (#78). |
| 3 | **Genuine accident.** A null check on `normalizeRef()` that can never fire. No commit explains it — that's the point. Huddle item **h-102**, routed to Dan Okafor via blame. | `src/legacy/ticketAdapter.ts` | None. |
| 4 | **Spec ↔ code divergence (fresh, "yesterday").** Code caps the income lookback at 8 weeks (DAT-512 workaround); the spec mandates 13 (MT-4 §2.3). All 32 tests pass either way. Huddle item **h-101**. | `src/assessment/incomeAssessment.ts` vs `specs/functions/income-assessment.md` | Commit `cfb96ed` (#112), dated 2026-06-11. |
| 5 | **Terminology drift (fresh, "yesterday").** BA spec commit adopts the client's "household unit"; glossary and code say "household group". Huddle item **h-103**. | `specs/functions/household-grouping.md` | Commit `9221918` (#113), dated 2026-06-11. |

Not landmines, but also dated "yesterday" — the queue's two **share items**:
commit `192d714` (#115), a clean design decision (joint assessments copied per
member Case, h-104, resolvable with "No action — discussed"), and commit
`e9de1e5` (#114), a business-rule change (means-test thresholds uprated from
1 July — not a divergence yet, h-105, natural resolution "Code change
scheduled").

## Demo commands

```sh
cd contextcaddy
npm run reset          # restore seed graph + regenerate rules (demo-ready state)
npm run generate       # graph → appeals-service/CLAUDE.md + .cursor/rules/contextcaddy-domain.mdc

# The huddle moment (on camera): the facilitator records a resolution …
node resolve-item.mjs h-102 "No reason — leftover from an earlier draft where normalizeRef could fail. Dan to remove the dead check this sprint." --owner "Dan Okafor" --by "Amara Diallo" --outcome verified-accident
npm run generate       # … and the agent rules now carry a verified accident
```

## The UI

```sh
cd contextcaddy/ui
npm install   # first time only
npm run dev   # http://localhost:5173
```

Four tabs:

- **Overview** — the pitch deck in-app: the four prongs, the daily context
  loop, and the architecture slides (served from `demo-assets/`). Click or
  use ← → to advance; **⛶ Present** goes fullscreen for recording.
- **Domain Models** — the five business objects with attributes, terminology
  traps, and a 🕘 Context History timeline read live from `git log`.
- **Business Functions** — business rules per capability with provenance +
  confidence, plus the same live history.
- **Daily Huddle** — the discussion queue built from the past day's commits:
  flags (divergence / drift / oddity) plus share items (design decisions,
  spec changes), each with a facilitator resolution form — including a
  "No action — discussed" outcome for share items. Recording a resolution
  really rewrites the graph and regenerates `appeals-service/CLAUDE.md` +
  `.cursor/rules` on disk — open the file in the editor to show the loop
  closing (prong 4).

The **↺ Reset demo** button restores the seed state between takes. The UI
never owns knowledge state: reads come from `graph.json` and live `git log`;
the one mutation goes through the same CLI scripts as the terminal demo.
