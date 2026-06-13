#!/usr/bin/env node
/**
 * ContextCaddy flywheel step (prong 3): the daily-huddle facilitator records the
 * resolution action for a flagged discussion item.
 *
 * Marks the item resolved. When the outcome verifies a fact about the code
 * (verified-accident / verified-invariant), the resolution is also written
 * back as a human-verified rule on the related domain or function — so the
 * decision feeds new joiners, the history log, and every coding agent, and
 * never has to be re-discovered.
 *
 * Usage:
 *   node resolve-item.mjs <item-id> "<resolution action>" --owner "<who acts>" \
 *     --by "<facilitator>" [--outcome verified-accident|verified-invariant|code-change|spec-change|terminology-aligned]
 *
 * Demo:
 *   node resolve-item.mjs h-102 "No reason — leftover from an earlier draft where normalizeRef could fail. Dan to remove the dead check this sprint." --owner "Dan Okafor" --by "Amara Diallo" --outcome verified-accident
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const graphPath = join(HERE, 'knowledge', 'graph.json');

const args = process.argv.slice(2);
const [itemId, action] = args;
function argValue(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const owner = argValue('--owner', 'unassigned');
const recordedBy = argValue('--by', 'facilitator');
const outcome = argValue('--outcome', 'code-change');

if (!itemId || !action) {
  console.error('Usage: node resolve-item.mjs <item-id> "<resolution action>" --owner "<who>" --by "<facilitator>" [--outcome <kind>]');
  process.exit(1);
}

const graph = JSON.parse(readFileSync(graphPath, 'utf8'));
const item = graph.huddle.items.find((i) => i.id === itemId);
if (!item) {
  const open = graph.huddle.items.filter((i) => i.status === 'open').map((i) => i.id);
  console.error(`No huddle item ${itemId}. Open items: ${open.join(', ') || 'none'}`);
  process.exit(1);
}
if (item.status === 'resolved') {
  console.error(`${itemId} is already resolved. Run 'npm run reset' to restore the seed graph.`);
  process.exit(1);
}

const now = new Date().toISOString();
item.status = 'resolved';
item.resolution = { action, owner, recordedBy, date: now.slice(0, 10), outcome };

// Verified facts about the code become permanent, human-verified rules on
// the related domain/function.
if (outcome === 'verified-accident' || outcome === 'verified-invariant') {
  const classification = outcome === 'verified-accident' ? 'accident' : 'invariant';
  const target =
    graph.functions.find((f) => (item.relatesTo ?? []).includes(f.id)) ??
    graph.domains.find((d) => (item.relatesTo ?? []).includes(d.id));
  if (target) {
    const ruleId = `r-huddle-${itemId}`;
    target.rules.push({
      id: ruleId,
      kind: 'rationale',
      classification,
      statement: `${item.title} — confirmed ${classification === 'accident' ? 'accidental, safe to remove' : 'intentional, never change'}.`,
      why: action,
      provenance: { type: 'human', source: `huddle resolution of ${itemId}`, author: owner, date: now.slice(0, 10) },
      confidence: 1,
      status: 'verified',
      codeLinks: item.codeLinks ?? [],
    });
    console.log(`   → recorded as ${ruleId} on ${target.name} (human-verified, ${classification}).`);
  }
}

writeFileSync(graphPath, JSON.stringify(graph, null, 2) + '\n');

console.log(`✅ ${itemId} resolved by ${recordedBy} → action owned by ${owner} (outcome: ${outcome}).`);
console.log('   This decision never has to be re-discovered.');
console.log('   Now run: npm run generate   (agent rules will pick it up)');
