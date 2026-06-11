#!/usr/bin/env node
/**
 * Groit flywheel step: a human answers an open question.
 *
 * Marks the question answered, writes the answer back into the graph as a
 * human-verified claim (confidence 100%), and reminds you to regenerate
 * rules. This is the moment tribal knowledge becomes a permanent asset.
 *
 * Usage:
 *   node answer-question.mjs <question-id> "<answer text>" --by "<name>" [--classification accident|invariant]
 *
 * Demo:
 *   node answer-question.mjs q-001 "No reason — leftover from an earlier draft where normalizeRef could fail. Safe to remove." --by "Dan Okafor" --classification accident
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const graphPath = join(HERE, 'knowledge', 'graph.json');

const args = process.argv.slice(2);
const [questionId, answerText] = args;
function argValue(flag, fallback) {
  const i = args.indexOf(flag);
  return i !== -1 && args[i + 1] ? args[i + 1] : fallback;
}
const by = argValue('--by', 'unknown');
const classification = argValue('--classification', 'accident');

if (!questionId || !answerText) {
  console.error('Usage: node answer-question.mjs <question-id> "<answer>" --by "<name>" [--classification accident|invariant]');
  process.exit(1);
}

const graph = JSON.parse(readFileSync(graphPath, 'utf8'));
const question = graph.questions.find((q) => q.id === questionId);
if (!question) {
  console.error(`No question ${questionId}. Open questions: ${graph.questions.filter((q) => q.status === 'open').map((q) => q.id).join(', ') || 'none'}`);
  process.exit(1);
}
if (question.status === 'answered') {
  console.error(`${questionId} is already answered. Run 'npm run reset' to restore the seed graph.`);
  process.exit(1);
}

const now = new Date().toISOString();
const claimId = `c-${String(graph.claims.length + 1).padStart(3, '0')}`;

question.status = 'answered';
question.answer = { text: answerText, by, date: now, resultingClaimId: claimId };

graph.claims.push({
  id: claimId,
  kind: 'rationale',
  classification,
  statement: `The ${question.subject ?? question.codeLinks.map((l) => `${l.symbol} in ${l.file}`).join(', ')} is confirmed ${
    classification === 'accident' ? 'accidental — safe to remove' : 'intentional'
  }.`,
  why: answerText,
  provenance: { type: 'human', source: `answer to ${questionId}`, author: by, date: now.slice(0, 10) },
  confidence: 1,
  status: 'verified',
  codeLinks: question.codeLinks,
});

writeFileSync(graphPath, JSON.stringify(graph, null, 2) + '\n');

console.log(`✅ ${questionId} answered by ${by} → recorded as ${claimId} (human-verified, classification: ${classification}).`);
console.log('   This answer never has to be re-discovered.');
console.log('   Now run: npm run generate   (rules will pick it up)');
