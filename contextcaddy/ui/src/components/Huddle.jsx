import { useState } from 'react';
import { CodeLinks } from './Badges';

const KIND_LABEL = {
  divergence: 'SPEC ↔ CODE DIVERGENCE',
  terminology: 'TERMINOLOGY',
  oddity: 'UNEXPLAINED ODDITY',
  decision: 'DESIGN DECISION',
  'spec-change': 'SPEC CHANGE',
};

const KIND_CLASS = {
  divergence: 'chip-invariant',
  terminology: 'chip-unknown',
  oddity: 'chip-unknown',
  decision: 'chip-info',
  'spec-change': 'chip-info',
};

// Share-type items default to "discussed"; flags default to a decision outcome.
const SHARE_KINDS = new Set(['decision', 'spec-change']);

function defaultOutcome(kind) {
  if (kind === 'oddity') return 'verified-accident';
  if (SHARE_KINDS.has(kind)) return 'discussed';
  return 'code-change';
}

function ResolutionForm({ item, onResolve }) {
  const [action, setAction] = useState('');
  const [owner, setOwner] = useState('');
  const [by, setBy] = useState('');
  const [outcome, setOutcome] = useState(defaultOutcome(item.kind));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onResolve({ itemId: item.id, action, owner, by, outcome });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="answer-form" onSubmit={submit}>
      <textarea
        required
        placeholder={
          SHARE_KINDS.has(item.kind)
            ? 'Notes from the discussion — or what was agreed, if anything changed.'
            : 'Resolution action — what did the huddle decide, and what happens next?'
        }
        value={action}
        onChange={(e) => setAction(e.target.value)}
      />
      <div className="answer-controls">
        <label>
          Action owner
          <input value={owner} onChange={(e) => setOwner(e.target.value)} placeholder={item.routedTo.name} required />
        </label>
        <label>
          Recorded by (facilitator)
          <input value={by} onChange={(e) => setBy(e.target.value)} required />
        </label>
        <label>
          Outcome
          <select value={outcome} onChange={(e) => setOutcome(e.target.value)}>
            <option value="verified-accident">Verified accident — safe to change</option>
            <option value="verified-invariant">Verified invariant — never change</option>
            <option value="code-change">Code change scheduled</option>
            <option value="spec-change">Spec change scheduled</option>
            <option value="terminology-aligned">Terminology aligned</option>
            <option value="discussed">No action — discussed</option>
          </select>
        </label>
        <button type="submit" disabled={busy}>
          {busy ? 'Recording…' : 'Record resolution'}
        </button>
      </div>
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}

export default function Huddle({ graph, onResolve }) {
  const open = graph.huddle.items.filter((i) => i.status === 'open');
  const resolved = graph.huddle.items.filter((i) => i.status === 'resolved');

  return (
    <div>
      <h2>Discussion queue</h2>
      <p className="hint">
        Built from the past day's spec and code commits: flagged problems — spec/code divergences, terminology drift,
        oddities nobody can explain — alongside spec changes and notable design decisions shared for awareness. The
        team huddles once a day; the facilitator records a resolution for each item ("No action — discussed" is a
        valid one). Every decision becomes permanent knowledge and flows straight into the agent rules. This is the
        loop most domain-driven teams never close.
      </p>

      {open.length === 0 && <div className="card">Queue clear — every item from the past day has a recorded resolution. 🎉</div>}

      {open.map((item) => (
        <div className="card question" key={item.id}>
          <div className="claim-head">
            <span className={`chip ${KIND_CLASS[item.kind] ?? 'chip-unknown'}`}>{KIND_LABEL[item.kind] ?? item.kind}</span>
            <span className="kind">{item.id}</span>
            <span className="spacer" />
            <span className="routed">
              → <strong>{item.routedTo.name}</strong>
            </span>
          </div>
          <p className="statement">{item.title}</p>
          <p className="why">{item.detail}</p>
          {item.suggestion && (
            <p className="why">
              <strong>Caddy's read:</strong> {item.suggestion}
            </p>
          )}
          <div className="claim-foot">
            <CodeLinks links={item.codeLinks} />
            <span className="source">
              from commit {item.source.commit} ({item.source.ref}) — {item.source.author}, {item.source.date}
            </span>
          </div>
          <ResolutionForm item={item} onResolve={onResolve} />
        </div>
      ))}

      {resolved.length > 0 && (
        <>
          <h2>Resolved</h2>
          {resolved.map((item) => (
            <div className="card question answered" key={item.id}>
              <div className="claim-head">
                <span className="chip chip-accident">{item.id} · RESOLVED {item.resolution.date}</span>
                <span className="spacer" />
                <span className="badge prov-human">✅ owner: {item.resolution.owner}</span>
              </div>
              <p className="statement">{item.title}</p>
              <p className="why">
                <strong>Decision:</strong> {item.resolution.action}
                <em> — recorded by {item.resolution.recordedBy} ({item.resolution.outcome})</em>
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
