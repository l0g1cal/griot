import { useState } from 'react';
import { ConfidenceBar, ProvenanceBadge } from './Badges';
import History from './History';

function DomainCard({ domain }) {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className="card entity">
      <div className="claim-head">
        <h3>{domain.name}</h3>
        <span className="spacer" />
        <ProvenanceBadge provenance={domain.provenance} />
        <ConfidenceBar value={domain.confidence} />
      </div>
      <p>{domain.description}</p>

      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Meaning</th>
            <th>Code</th>
          </tr>
        </thead>
        <tbody>
          {domain.attributes.map((a) => (
            <tr key={a.name}>
              <td className="term">{a.name}</td>
              <td>{a.meaning}</td>
              <td>
                <code>{a.code}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {(domain.aliases ?? []).map((a) => (
        <div className="card trap" key={a.term}>
          ⚠️ <strong>{a.term}</strong> ({a.where}) is the <em>same concept</em> as <strong>{domain.name}</strong>. {a.note}
        </div>
      ))}

      <div className="claim-foot">
        <span className="code-links">{domain.spec && <code>{domain.spec.replace(/^appeals-service\//, '')}</code>}</span>
        <button className="ghost" onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? 'Hide history' : '🕘 Context history'}
        </button>
      </div>

      {showHistory && <History entityId={domain.id} />}
    </div>
  );
}

export default function Domains({ graph }) {
  return (
    <div>
      <h2>Domain models</h2>
      <p className="hint">
        The business objects of the system, as BAs, devs and clients agreed to understand them — each backed by a spec
        in the repo and a live decision log from commit history. New joiners self-serve here instead of interrupting
        seniors.
      </p>
      {graph.domains.map((d) => (
        <DomainCard key={d.id} domain={d} />
      ))}
    </div>
  );
}
