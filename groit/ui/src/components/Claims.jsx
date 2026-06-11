import { ClassificationChip, CodeLinks, ConfidenceBar, ProvenanceBadge } from './Badges';

const ORDER = { invariant: 0, accident: 1, unknown: 2 };

export default function Claims({ graph }) {
  const claims = [...graph.claims].sort(
    (a, b) => ORDER[a.classification] - ORDER[b.classification] || b.confidence - a.confidence,
  );

  return (
    <div>
      <h2>Claims</h2>
      <p className="hint">
        Every claim carries provenance and confidence. Only claims clearing the confidence bar become hard rules for
        coding agents; the rest are surfaced as labelled uncertainty — never as facts.
      </p>
      {claims.map((c) => (
        <div className={`card claim ${c.provenance.type === 'human' ? 'claim-verified' : ''}`} key={c.id}>
          <div className="claim-head">
            <ClassificationChip value={c.classification} />
            <span className="kind">{c.kind}</span>
            <span className="spacer" />
            <ProvenanceBadge provenance={c.provenance} />
            <ConfidenceBar value={c.confidence} />
          </div>
          <p className="statement">{c.statement}</p>
          <p className="why">
            <strong>Why:</strong> {c.why}
          </p>
          <div className="claim-foot">
            <CodeLinks links={c.codeLinks} />
            <span className="source">
              {c.provenance.source}
              {c.provenance.author ? ` — ${c.provenance.author}` : ''}
              {c.provenance.date ? `, ${c.provenance.date}` : ''}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
