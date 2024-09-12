/** All monetary amounts are integer pence. */
export type Pence = number;

export function applyRate(amount: Pence, rate: number): Pence {
  return Math.round(amount * rate);
}

export function formatPounds(amount: Pence): string {
  return `£${(amount / 100).toFixed(2)}`;
}
