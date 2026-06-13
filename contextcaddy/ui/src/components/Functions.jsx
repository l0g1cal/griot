import { useState } from 'react';
import { ClassificationChip, CodeLinks, ConfidenceBar, ProvenanceBadge } from './Badges';
import History from './History';

function Rule({ rule }) {
  return (
    <div className={`rule ${rule.provenance.type === 'human' ? 'claim-verified' : ''}`}>
      <div className="claim-head">
        <ClassificationChip value={rule.classification} />
        <span className="kind">{rule.kind}</span>
        <span className="spacer" />
        <ProvenanceBadge provenance={rule.provenance} />
        <ConfidenceBar value={rule.confidence} />
      </div>
      <p className="statement">{rule.statement}</p>
      <p className="why">
        <strong>Why:</strong> {rule.why}
      </p>
      <div className="claim-foot">
        <CodeLinks links={rule.codeLinks} />
        <span className="source">
          {rule.provenance.source}
          {rule.provenance.author ? ` — ${rule.provenance.author}` : ''}
          {rule.provenance.date ? `, ${rule.provenance.date}` : ''}
        </span>
      </div>
    </div>
  );
}

function FunctionCard({ fn }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="card entity">
      <div className="claim-head">
        <h3>{fn.name}</h3>
        <span className="spacer" />
        <span className="kind">
          {fn.rules.length} rule{fn.rules.length === 1 ? '' : 's'}
        </span>
      </div>
      <p>{fn.description}</p>

      {fn.rules.map((r) => (
        <Rule key={r.id} rule={r} />
      ))}

      <div className="claim-foot">
        <span className="code-links">
          {fn.spec ? (
            <code>{fn.spec.replace(/^appeals-service\//, '')}</code>
          ) : (
            <span className="kind">⚠ no spec file yet</span>
          )}
        </span>
        <button className="ghost" onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? 'Hide history' : '🕘 Context history'}
        </button>
      </div>

      {showHistory && <History entityId={fn.id} />}
    </div>
  );
}

export default function Functions({ graph }) {
  return (
    <div>
      <h2>Business functions</h2>
      <p className="hint">
        The business rules of each capability, in business language, with provenance and confidence on every rule —
        and the evolution of those rules read live from commit history. Only rules clearing the confidence bar become
        hard constraints for coding agents; the rest are surfaced as labelled uncertainty, never as facts.
      </p>
      {graph.functions.map((f) => (
        <FunctionCard key={f.id} fn={f} />
      ))}
    </div>
  );
}
