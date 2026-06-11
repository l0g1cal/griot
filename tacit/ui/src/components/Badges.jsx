const PROVENANCE = {
  human: ['✅', 'human-verified', 'prov-human'],
  trace: ['🔗', 'trace-derived', 'prov-trace'],
  code: ['🤖', 'code-derived', 'prov-code'],
};

export function ProvenanceBadge({ provenance }) {
  const [icon, label, cls] = PROVENANCE[provenance.type];
  return (
    <span className={`badge ${cls}`} title={provenance.source}>
      {icon} {label}
    </span>
  );
}

export function ConfidenceBar({ value }) {
  return (
    <span className="confidence" title={`confidence ${Math.round(value * 100)}%`}>
      <span className="confidence-track">
        <span className="confidence-fill" style={{ width: `${value * 100}%` }} />
      </span>
      <span className="confidence-label">{Math.round(value * 100)}%</span>
    </span>
  );
}

export function ClassificationChip({ value }) {
  return <span className={`chip chip-${value}`}>{value.toUpperCase()}</span>;
}

export function CodeLinks({ links = [] }) {
  return (
    <span className="code-links">
      {links.map((l) => (
        <code key={`${l.file}#${l.symbol}`}>
          {l.file}#{l.symbol}
        </code>
      ))}
    </span>
  );
}
