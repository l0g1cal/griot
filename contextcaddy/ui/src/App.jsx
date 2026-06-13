import { useCallback, useEffect, useState } from 'react';
import Domains from './components/Domains';
import Functions from './components/Functions';
import Huddle from './components/Huddle';
import Slides from './components/Slides';

const TABS = ['Overview', 'Domain Models', 'Business Functions', 'Daily Huddle'];

export default function App() {
  const [graph, setGraph] = useState(null);
  const [tab, setTab] = useState(TABS[0]);
  const [error, setError] = useState(null);
  const [flash, setFlash] = useState(null);

  const refresh = useCallback(async () => {
    const g = await fetch('/api/graph').then((x) => x.json());
    setGraph(g);
  }, []);

  useEffect(() => {
    refresh().catch((e) => setError(e.message));
  }, [refresh]);

  async function resolve(payload) {
    const res = await fetch('/api/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json()).error ?? 'resolve failed');
    await refresh();
    setFlash('Resolution recorded — the decision is now part of the knowledge base, and CLAUDE.md / .cursor rules were regenerated.');
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

  const allRules = [...graph.domains, ...graph.functions].flatMap((e) => e.rules);
  const verifiedCount = allRules.filter((r) => r.provenance.type === 'human').length;
  const openCount = graph.huddle.items.filter((i) => i.status === 'open').length;

  return (
    <div className="app">
      <header>
        <div>
          <h1>
            ContextCaddy <span className="project">/ {graph.project}</span>
          </h1>
          <p className="tagline">
            Reads the course, remembers every round — and hands your devs and their agents the right context, every shot.
          </p>
        </div>
        <div className="header-right">
          <div className="stats">
            <span>{graph.domains.length} domains</span>
            <span>{graph.functions.length} functions</span>
            <span>{allRules.length} rules</span>
            <span className="stat-verified">{verifiedCount} human-verified</span>
            <span className={openCount ? 'stat-open' : ''}>{openCount} huddle item{openCount === 1 ? '' : 's'}</span>
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
            {t === 'Daily Huddle' && openCount > 0 && <span className="pill">{openCount}</span>}
          </button>
        ))}
      </nav>

      {flash && <div className="flash">{flash}</div>}

      <main>
        {tab === 'Overview' && <Slides />}
        {tab === 'Domain Models' && <Domains graph={graph} />}
        {tab === 'Business Functions' && <Functions graph={graph} />}
        {tab === 'Daily Huddle' && <Huddle graph={graph} onResolve={resolve} />}
      </main>
    </div>
  );
}
