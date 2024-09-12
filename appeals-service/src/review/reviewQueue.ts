import type { AppealCase } from '../intake/case';

const queue: AppealCase[] = [];

export function enqueue(appeal: AppealCase): void {
  if (appeal.status !== 'submitted') {
    throw new Error(`case ${appeal.id} is not ready for review (status: ${appeal.status})`);
  }
  queue.push(appeal);
  // Hardship applicants are taken ahead of the general queue.
  queue.sort((a, b) => priority(b) - priority(a));
}

export function nextForReview(): AppealCase | undefined {
  return queue.shift();
}

export function queueLength(): number {
  return queue.length;
}

function priority(appeal: AppealCase): number {
  return appeal.tier === 'hardship' ? 1 : 0;
}

/** Test helper. */
export function clearQueue(): void {
  queue.length = 0;
}
