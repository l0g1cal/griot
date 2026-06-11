import { useState } from 'react';
import { CodeLinks } from './Badges';

function AnswerForm({ question, onAnswer }) {
  const [text, setText] = useState('');
  const [by, setBy] = useState(question.routedTo.name);
  const [classification, setClassification] = useState('accident');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onAnswer({ questionId: question.id, answer: text, by, classification });
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
        placeholder="What's the reason — or is there no reason?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="answer-controls">
        <label>
          Answered by
          <input value={by} onChange={(e) => setBy(e.target.value)} required />
        </label>
        <label>
          Verdict
          <select value={classification} onChange={(e) => setClassification(e.target.value)}>
            <option value="accident">Accident — safe to change</option>
            <option value="invariant">Intentional — never change</option>
          </select>
        </label>
        <button type="submit" disabled={busy}>
          {busy ? 'Recording…' : 'Record answer'}
        </button>
      </div>
      {error && <div className="form-error">{error}</div>}
    </form>
  );
}

export default function Questions({ graph, onAnswer }) {
  const open = graph.questions.filter((q) => q.status === 'open');
  const answered = graph.questions.filter((q) => q.status === 'answered');

  return (
    <div>
      <h2>Open questions</h2>
      <p className="hint">
        Where the code looks intentional but no trace explains it, Tacit doesn't guess — it asks, and routes the
        question to the likeliest knower via git history. Until answered, agents are told to treat the code as
        intentional.
      </p>

      {open.length === 0 && <div className="card">No open questions — everything oddity-shaped has a verified answer.</div>}

      {open.map((q) => (
        <div className="card question" key={q.id}>
          <div className="claim-head">
            <span className="chip chip-unknown">{q.id.toUpperCase()}</span>
            <span className="spacer" />
            <span className="routed">→ routed to <strong>{q.routedTo.name}</strong></span>
          </div>
          <p className="statement">{q.question}</p>
          {q.hypothesis && (
            <p className="why">
              <strong>Tacit's read:</strong> {q.hypothesis}
            </p>
          )}
          <div className="claim-foot">
            <CodeLinks links={q.codeLinks} />
            <span className="source">{q.routedTo.basis}</span>
          </div>
          <AnswerForm question={q} onAnswer={onAnswer} />
        </div>
      ))}

      {answered.length > 0 && (
        <>
          <h2>Answered</h2>
          {answered.map((q) => (
            <div className="card question answered" key={q.id}>
              <div className="claim-head">
                <span className="chip chip-accident">{q.id.toUpperCase()} · ANSWERED</span>
                <span className="spacer" />
                <span className="badge prov-human">✅ {q.answer.by}</span>
              </div>
              <p className="statement">{q.question}</p>
              <p className="why">
                <strong>Answer:</strong> “{q.answer.text}” — recorded as claim <code>{q.answer.resultingClaimId}</code>,
                human-verified. This never has to be re-discovered.
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
