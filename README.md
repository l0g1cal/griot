# Groit — demo workspace

Two pieces:

- **[appeals-service/](appeals-service/)** — a synthetic "client" repo: a tribunal appeals service with a crafted git history (Sep 2024 → Mar 2025, four authors) and three planted landmines.
- **[groit/](groit/)** — the Groit prototype: the knowledge graph (seed JSON, ready to feed the UI) and the rules generator that emits `CLAUDE.md` + `.cursor/rules` into the appeals repo.

## The three landmines

| # | Landmine | Where | The trace |
|---|---|---|---|
| 1 | **Compliance ordering.** `applyTierDiscount()` must run before `applyRegionalAdjustment()`. Both steps are multiplicative, so swapping them changes **no test result** — only the audit ledger lines the regulator reads. | `appeals-service/src/pricing/feeCalculator.ts` | Commit `5195ade` (PR #47, Priya Sharma): full FTC Reg 4.2 rationale in the commit body — and **only** there. |
| 2 | **Terminology trap.** Legacy `Ticket` ≡ intake `Case` — same concept, two names (`band`↔`tier`, `zone`↔`region`, `body`↔`grounds`). | `appeals-service/src/legacy/` vs `src/intake/` | Commit `309fd26` (PR #61, Dan Okafor) bridges them; nothing states the equivalence explicitly. |
| 3 | **Genuine accident.** A null check on `normalizeRef()`'s result that can never fire (`String.replace` always returns a string). No commit, PR, or comment explains it. | `appeals-service/src/legacy/ticketAdapter.ts` (`ticketToCase`) | None — that's the point. Groit raises open question **q-001**, routed to Dan Okafor via git blame. |

Verified properties: the test suite (12 tests) passes in **both** orderings of landmine 1 — checked across all 27 category/tier/region combinations.

## Demo commands

```sh
cd groit
npm run reset          # restore seed graph + regenerate rules (demo-ready state)
npm run generate       # graph → appeals-service/CLAUDE.md + .cursor/rules/groit-domain.mdc

# The flywheel moment (on camera): the routed engineer answers q-001 …
node answer-question.mjs q-001 "No reason — leftover from an earlier draft where normalizeRef could fail. Safe to remove." --by "Dan Okafor" --classification accident
npm run generate       # … and the rules now mark the null check a verified accident
```

`groit/knowledge/graph.seed.json` is the pre-seeded graph for the staged UI: contexts, glossary (with the Ticket/Case alias), claims with provenance + confidence, and the open-questions queue.

## The UI

```sh
cd groit/ui
npm install   # first time only
npm run dev   # http://localhost:5173
```

Four tabs: **Domain Model** (bounded contexts, glossary, terminology traps), **Claims** (provenance badges + confidence bars), **Open Questions** (the honesty moment — answer q-001 in the form, prefilled with Dan Okafor from blame routing), and **Generated Rules** (live contents of `appeals-service/CLAUDE.md`).

The UI is read-only over the graph except for one mutation: the answer form posts to a dev-server endpoint that invokes the same `answer-question.mjs` + `generate-rules.mjs` scripts as the CLI — so answering on camera really rewrites `CLAUDE.md` on disk (flip to the Generated Rules tab to show it). The **↺ Reset demo** button in the header restores the seed state between takes.

## Recording the money shot

Same prompt, twice — the only variable is Groit's generated context.

1. **Without Groit:** `rm appeals-service/CLAUDE.md && rm -rf appeals-service/.cursor`. Open Claude Code / Cursor in `appeals-service/` and prompt:
   > Refactor src/pricing: apply the regional adjustment before the per-applicant tier discount so adjustments run most-general-first, and tidy up calculateFilingFee. Run the tests.
   Expected: the agent reorders, all 12 tests pass, it reports success. (Audit just broke; nothing noticed.)
2. **With Groit:** `cd groit && npm run reset` (regenerates `CLAUDE.md`), then the **same prompt**.
   Expected: the agent refuses the reorder, citing **INV-1** and FTC Reg 4.2 / PR #47 by name.

For the honesty beat, show `appeals-service/CLAUDE.md` before and after answering q-001: the item moves from *Open questions — ask a human* to *Verified accidents — safe to clean up*, attributed to Dan.

After the demo, `git checkout -- appeals-service` and `npm run reset` restore everything.
