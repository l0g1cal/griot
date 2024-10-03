export interface OutboundMessage {
  to: string;
  body: string;
  queuedAt: string;
}

const outbox: OutboundMessage[] = [];

/** Queues a message for the delivery worker; transport is configured per environment. */
export function notify(to: string, body: string): OutboundMessage {
  const message: OutboundMessage = { to, body, queuedAt: new Date().toISOString() };
  outbox.push(message);
  return message;
}

export function pendingMessages(): readonly OutboundMessage[] {
  return outbox;
}

/** Test helper. */
export function clearOutbox(): void {
  outbox.length = 0;
}
