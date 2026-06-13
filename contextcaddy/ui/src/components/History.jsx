import { useEffect, useState } from 'react';

/**
 * Context history (prong 2): the chronological decision log for a domain or
 * business function, read LIVE from `git log` over its spec + code paths.
 * The commit bodies are the BDR/ADR record — written once, at the moment of
 * the change, by the person who made it.
 */
export default function History({ entityId }) {
  const [commits, setCommits] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/history?id=${encodeURIComponent(entityId)}`)
      .then((x) => x.json())
      .then((d) => (d.error ? setError(d.error) : setCommits(d.commits)))
      .catch((e) => setError(e.message));
  }, [entityId]);

  if (error) return <div className="history-empty">History unavailable: {error}</div>;
  if (!commits) return <div className="history-empty">Reading git history…</div>;
  if (!commits.length) return <div className="history-empty">No commits touch this entity yet.</div>;

  return (
    <div className="history">
      <div className="history-title">
        Context history — {commits.length} commit{commits.length === 1 ? '' : 's'}, read live from <code>git log</code>
      </div>
      {commits.map((c) => (
        <div className="history-entry" key={c.hash}>
          <div className="history-meta">
            <span className="history-date">{c.date}</span>
            <span className="history-author">{c.author}</span>
            <code className="history-hash">{c.hash}</code>
          </div>
          <div className="history-subject">{c.subject}</div>
          {c.body && <pre className="history-body">{c.body}</pre>}
        </div>
      ))}
    </div>
  );
}
