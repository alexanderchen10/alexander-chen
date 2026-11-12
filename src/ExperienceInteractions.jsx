import { useEffect, useRef, useState } from 'react';
import './ExperienceInteractions.css';

let openingExperience = false;

export function ExperienceCardLink({ href, route, label, navigate }) {
  const open = async (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (openingExperience) return;
    const card = event.currentTarget.closest('.home-experience-item');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealPage = () => {
      navigate(null, '/', route);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        const heading = document.querySelector('main h1');
        if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
      }));
    };
    if (!card || reduced || !card.animate) { revealPage(); return; }
    openingExperience = true;
    const bounds = card.getBoundingClientRect();
    const overlay = document.createElement('div');
    overlay.className = 'experience-zoom-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.inert = true;
    const replica = card.cloneNode(true);
    replica.classList.add('experience-zoom-replica');
    replica.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    replica.removeAttribute('aria-labelledby');
    const style = getComputedStyle(card);
    Object.assign(replica.style, { position: 'fixed', left: `${bounds.left}px`, top: `${bounds.top}px`, width: `${bounds.width}px`, height: `${bounds.height}px`, margin: '0', transform: 'none', background: style.background, boxSizing: 'border-box' });
    overlay.append(replica);
    document.body.append(overlay);
    try {
      const scale = Math.max(innerWidth / bounds.width, innerHeight / bounds.height, 1.3) * 1.08;
      const x = (innerWidth - bounds.width) / 2 - bounds.left;
      const y = (innerHeight - bounds.height) / 2 - bounds.top;
      await replica.animate([
        { transform: 'translate3d(0,0,0) scale(1)', opacity: 1 },
        { transform: `translate3d(${x}px,${y}px,0) scale(${scale})`, opacity: 1 }
      ], { duration: 520, easing: 'cubic-bezier(.22,.72,.18,1)', fill: 'forwards' }).finished;
      revealPage();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      await overlay.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 230, fill: 'forwards' }).finished;
    } catch { revealPage(); }
    finally { overlay.remove(); openingExperience = false; }
  };
  return <a className="experience-card-open" href={href} aria-label={`Explore ${label} experience`} onClick={open}><span>Explore experience</span><span aria-hidden="true">↗</span></a>;
}

function AnimatedValue({ value, run, delay }) {
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    if (!run || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setDisplay(value); return; }
    const match = String(value).match(/^([^\d]*)([\d,.]+)([^\d]*)$/);
    if (!match) return;
    const number = Number(match[2].replaceAll(',', ''));
    if (!Number.isFinite(number)) return;
    const decimals = (match[2].split('.')[1] || '').length;
    let frame;
    let start;
    const tick = now => {
      start ??= now;
      const progress = Math.max(0, Math.min(1, (now - start - delay) / 1250));
      const current = number * (1 - Math.pow(1 - progress, 3));
      setDisplay(match[1] + current.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + match[3]);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, run, delay]);
  return <strong className={`interactive-stat-value${String(value).length > 9 ? " is-compound" : ""}`} aria-label={value}><span aria-hidden="true">{display}</span></strong>;
}

export function InteractiveStats({ metrics, id = 'structured-proof' }) {
  const section = useRef(null);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!window.IntersectionObserver) { setRun(1); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setRun(1); observer.disconnect(); }
    }, { threshold: .25 });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);
  return <section className="interactive-stats" id={id} ref={section} aria-label="Project results">
    <header><p>Results at a glance</p><button type="button" onClick={() => setRun(value => value + 1)} aria-label="Replay statistics">Replay <span aria-hidden="true">↻</span></button></header>
    <div className="interactive-stats-grid">{metrics.map((metric, index) => <article key={metric.label}>
      <span className="interactive-stat-index">{String(index + 1).padStart(2, '0')}</span>
      <AnimatedValue value={metric.value} run={run} delay={index * 100} />
      <p>{metric.label}</p>
    </article>)}</div>
  </section>;
}

export function LoopingPreview({ src, poster, alt = '', fit, background }) {
  const frame = useRef(null);
  const video = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!src) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = false;
    const update = () => { const active = visible && !motion.matches && !document.hidden; setPlaying(active); if (active) setLoaded(true); };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { rootMargin: '100px' });
    observer.observe(frame.current);
    motion.addEventListener('change', update);
    document.addEventListener('visibilitychange', update);
    return () => { observer.disconnect(); motion.removeEventListener('change', update); document.removeEventListener('visibilitychange', update); };
  }, [src]);
  useEffect(() => {
    if (playing && loaded) video.current?.play().catch(() => {});
    else video.current?.pause();
  }, [playing, loaded]);
  return <span className="looping-project-preview" ref={frame}>
    <img src={poster} alt={alt} loading="lazy" style={{ objectFit: fit, background }} />
    {loaded && <video ref={video} src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} />}
    {src && <span className="looping-preview-badge" aria-hidden="true">↻ Video preview</span>}
  </span>;
}
