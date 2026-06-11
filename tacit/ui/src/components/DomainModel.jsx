import { ProvenanceBadge, ConfidenceBar } from './Badges';

export default function DomainModel({ graph }) {
  const contextName = (id) => graph.contexts.find((c) => c.id === id)?.name ?? id;
  const traps = graph.terms.flatMap((t) => (t.aliases ?? []).map((a) => ({ term: t, alias: a })));

  return (
    <div>
      <h2>Bounded contexts</h2>
      <div className="context-grid">
        {graph.contexts.map((ctx) => (
          <div className="card" key={ctx.id}>
            <h3>{ctx.name}</h3>
            <p>{ctx.description}</p>
            <div className="code-links">
              {ctx.modules.map((m) => (
                <code key={m}>{m}</code>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2>Ubiquitous language</h2>
      <table>
        <thead>
          <tr>
            <th>Term</th>
            <th>Context</th>
            <th>Definition</th>
            <th>Provenance</th>
          </tr>
        </thead>
        <tbody>
          {graph.terms.map((t) => (
            <tr key={t.id}>
              <td className="term">{t.term}</td>
              <td>{contextName(t.contextId)}</td>
              <td>
                {t.definition}
                <div className="code-links">
                  {t.codeSymbols.map((s) => (
                    <code key={s}>{s}</code>
                  ))}
                </div>
              </td>
              <td>
                <ProvenanceBadge provenance={t.provenance} />
                <ConfidenceBar value={t.confidence} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {traps.length > 0 && (
        <>
          <h2>⚠️ Terminology traps</h2>
          {traps.map(({ term, alias }) => (
            <div className="card trap" key={`${term.id}-${alias.term}`}>
              <strong>
                {alias.term} ({contextName(alias.contextId)})
              </strong>{' '}
              is the <em>same concept</em> as <strong>{term.term}</strong> ({contextName(term.contextId)}). {alias.note}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
