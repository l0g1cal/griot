import { useCallback, useEffect, useState } from 'react';
import DomainModel from './components/DomainModel';
import Claims from './components/Claims';
import Questions from './components/Questions';
import Rules from './components/Rules';

const TABS = ['Domain Model', 'Claims', 'Open Questions', 'Generated Rules'];

export default function App() {
  const [graph, setGraph] = useState(null);
  const [rules, setRules] = useState('');
  const [tab, setTab] = useState(TABS[0]);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  const refresh = useCallback(async () => {
    const [g, r] = await Promise.all([
      fetch('/api/graph').then((x) => x.json()),
      fetch('/api/rules').then((x) => x.json()),
    ]);
    setGraph(g);
    setRules(r.markdown);
  }, []);

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [refresh]);

  async function answer(payload) {
    const res = await fetch('/api/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'answer failed');
    await refresh();
    setFlash('Answer recorded as a human-verified claim — CLAUDE.md and .cursor rules regenerated.');
    setTimeout(() => setFlash(null), 6000);
  }

  async function reset() {
    await fetch('/api/reset', { method: 'POST' });
    await refresh();
    setFlash('Graph reset to seed state.');
    setTimeout(() => setFlash(null), 4000);
  }

  if (error) return <div className="screen-msg">Failed to load: {error}</div>;
  if (!graph) return <div className="screen-msg">Loading knowledge graph…</div>;

  const openCount = graph.questions.filter((q) => q.status === 'open').length;
  const verifiedCount = graph.claims.filter((c) => c.provenance.type === 'human').length;

  return (
    <div className="app">
      <header>
        <div>
          <h1>
            Groit <span className="project">/ {graph.project}</span>
          </h1>
          <p className="tagline">The living domain knowledge layer — what the code can't tell you, and what nobody knows yet.</p>
        </div>
        <div className="header-right">
          <div className="stats">
            <span>{graph.contexts.length} contexts</span>
            <span>{graph.terms.length} terms</span>
            <span>{graph.claims.length} claims</span>
            <span className="stat-verified">{verifiedCount} human-verified</span>
            <span className={openCount ? 'stat-open' : ''}>{openCount} open question{openCount === 1 ? '' : 's'}</span>
          </div>
          <button className="ghost" onClick={reset} title="Restore the seed graph (between demo takes)">
            ↺ Reset demo
          </button>
        </div>
      </header>

      <nav>
        {TABS.map((t) => (
          <button key={t} className={t === tab ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
            {t === 'Open Questions' && openCount > 0 && <span className="pill">{openCount}</span>}
          </button>
        ))}
      </nav>

      {flash && <div className="flash">{flash}</div>}

      <main>
        {tab === 'Domain Model' && <DomainModel graph={graph} />}
        {tab === 'Claims' && <Claims graph={graph} />}
        {tab === 'Open Questions' && <Questions graph={graph} onAnswer={answer} />}
        {tab === 'Generated Rules' && <Rules markdown={rules} />}
      </main>
    </div>
  );
}
