let counter = 0;

export function newCaseId(): string {
  counter += 1;
  return `CASE-${String(counter).padStart(6, '0')}`;
}

/** Test helper — resets the in-process sequence. */
export function resetIds(): void {
  counter = 0;
}
