export default function Rules({ markdown }) {
  return (
    <div>
      <h2>Generated agent rules</h2>
      <p className="hint">
        Live contents of <code>appeals-service/CLAUDE.md</code> (a <code>.cursor/rules</code> twin is generated
        alongside). This file is written to disk — answer a question and watch it change.
      </p>
      <pre className="rules">{markdown}</pre>
    </div>
  );
}
