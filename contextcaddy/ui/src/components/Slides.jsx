import { useCallback, useEffect, useState } from 'react';

const SLIDES = [
  { file: 'slide-four-prongs.html', title: 'The four prongs' },
  { file: 'slide-flywheel.html', title: 'The daily context loop' },
  { file: 'slide-architecture.html', title: 'Architecture' },
];

/**
 * The pitch deck, in-app. Each slide is a self-scaling 1600×900 HTML page
 * served from demo-assets/ and embedded in a 16:9 stage. Click the slide or
 * use ←/→ to advance; ⛶ presents the stage fullscreen for recording.
 */
export default function Slides() {
  const [index, setIndex] = useState(0);

  const prev = useCallback(() => setIndex((i) => Math.max(i - 1, 0)), []);
  const next = useCallback(() => setIndex((i) => Math.min(i + 1, SLIDES.length - 1)), []);

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'ArrowRight' || e.key === ' ') next();
      if (e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  function present() {
    document.getElementById('slide-stage')?.requestFullscreen?.();
  }

  const slide = SLIDES[index];

  return (
    <div>
      <div className="slides-bar">
        <div className="slides-tabs">
          {SLIDES.map((s, i) => (
            <button key={s.file} className={i === index ? 'active' : ''} onClick={() => setIndex(i)}>
              <span className="slide-no">{i + 1}</span>
              {s.title}
            </button>
          ))}
        </div>
        <div className="slides-actions">
          <button className="ghost" onClick={prev} disabled={index === 0} title="Previous (←)">
            ←
          </button>
          <button className="ghost" onClick={next} disabled={index === SLIDES.length - 1} title="Next (→)">
            →
          </button>
          <button className="ghost" onClick={present} title="Present fullscreen — Esc to exit">
            ⛶ Present
          </button>
        </div>
      </div>

      <div
        className="slide-stage"
        id="slide-stage"
        onClick={() => setIndex((i) => (i + 1) % SLIDES.length)}
        title="Click to advance"
      >
        <iframe key={slide.file} src={`/slides/${slide.file}`} title={slide.title} />
        <div className="slide-clickguard" />
      </div>

      <p className="hint slides-hint">
        Click the slide or use ← → to advance · ⛶ Present for fullscreen (Esc exits) · slide {index + 1} of{' '}
        {SLIDES.length}
      </p>

      <div className="caddy-note">
        <div className="caddy-note-head">⛳ Why “ContextCaddy”?</div>
        <p>
          Standard coding agents — and new joiners — are playing golf in the dark. A great caddy never swings the
          club: they <strong>read the course</strong>, <strong>remember every round played on it</strong>, and hand
          the player the right club at the right moment. ContextCaddy does exactly that for delivery teams — it reads
          the course (your specs and code), tracks every round (the team's domain decisions, live from git history and
          the daily huddle), and hands your developers <em>and their coding agents</em> the exact business context
          they need to make the right call.
        </p>
      </div>
    </div>
  );
}
