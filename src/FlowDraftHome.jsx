import { useEffect, useRef, useState } from "react";
import { about, profile } from "./data";
import GreetingAvatar from "./GreetingAvatar";

const href = (route = "") => `${import.meta.env.BASE_URL}${route ? `#${route}` : ""}`;
const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
const showreel = "/projects/about/alexander-chen-showreel.mp4";
const featuredPoster = "/projects/work/corcoran/oakville-grand-opening-poster.jpg";

const workHighlights = [
  { value: "3.9×", label: "Recorded newsletter clickers at GTA Imaging", detail: "Across two October campaigns", route: "project/gta-imaging" },
  { value: "105K+", label: "Impressions for Loblaw", detail: "From a two-week recruitment campaign", route: "project/loblaw-employer-brand" },
  { value: "5,500+", label: "New T&T Supermarket followers", detail: "In three months", route: "project/tt-supermarket" },
];

function HeroShowreel({ paused }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const bounds = video.getBoundingClientRect();
    let visible = bounds.bottom > 0 && bounds.top < window.innerHeight;

    const syncPlayback = () => {
      if (paused || !visible || document.hidden || preference.matches) {
        video.pause();
        return;
      }

      video.muted = true;
      if (!video.hasAttribute("src")) video.src = asset(showreel);
      if (video.paused) video.play().catch(() => {});
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    });
    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    preference.addEventListener("change", syncPlayback);
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      preference.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, [paused]);

  return (
    <div className="studio-hero-media" aria-hidden="true">
      <video ref={videoRef} poster={asset(featuredPoster)} preload="none" muted loop playsInline disablePictureInPicture />
    </div>
  );
}

export default function FlowDraftHome({ collaborators, children, navigate, clock }) {
  const reelDialog = useRef(null);
  const [reelOpen, setReelOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [greeting, setGreeting] = useState(false);
  const [greetingReady, setGreetingReady] = useState(false);
  const greetingTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(greetingTimer.current), []);

  const sayHello = () => {
    if (paused) return;
    setGreeting(true);
    window.clearTimeout(greetingTimer.current);
    greetingTimer.current = window.setTimeout(() => setGreeting(false), 2400);
  };

  const openReel = () => {
    reelDialog.current.showModal();
    setReelOpen(true);
  };

  return (
    <main className={`main-content home-main flow-home reference-paper-home studio-flow${paused ? " flow-is-paused" : ""}`}>
      <section className="studio-opening" aria-labelledby="flow-title">
        <HeroShowreel paused={paused || reelOpen} />
        <div className="studio-opening-inner">
          <div className="studio-opening-copy">
            <p className="studio-eyebrow">{profile.hero.eyebrow}</p>
            <p className="studio-greeting">Hello, I’m</p>
            <h1 id="flow-title">Alexander <span>Chen</span></h1>
            <p className="studio-opening-line">{profile.hero.headline}</p>
            <div className="studio-opening-actions">
              <a className="studio-primary" href={href("projects")} onClick={event => navigate(event, "/", "projects")}>See the work <span aria-hidden="true">↓</span></a>
              <a className="studio-text-link" href={asset("/resume.pdf")} target="_blank" rel="noreferrer">Open résumé <span aria-hidden="true">↗</span></a>
            </div>
          </div>
          <button className="studio-reel-trigger" type="button" onClick={openReel} aria-haspopup="dialog">
            <span className="studio-reel-thumb"><img src={asset(featuredPoster)} alt="" width="1600" height="899" /><span className="studio-play" aria-hidden="true">▶</span></span>
            <span className="studio-reel-title"><strong>Watch showreel</strong><span>54 sec · Sound on</span></span>
          </button>
          <div className="studio-opening-footer">
            <span>{profile.location}, Canada</span>
            <a href={href("home-about")} onClick={event => navigate(event, "/", "home-about")}>A little about me <span aria-hidden="true">↓</span></a>
            <button type="button" className="studio-motion-toggle" onClick={() => { setPaused(value => !value); setGreeting(false); }}>{paused ? "Resume motion" : "Pause motion"}</button>
          </div>
        </div>
      </section>

      <dialog ref={reelDialog} className="studio-reel" aria-labelledby="studio-reel-heading" onClose={() => setReelOpen(false)}>
        <header><h2 id="studio-reel-heading">Alexander Chen showreel</h2><button type="button" onClick={() => reelDialog.current.close()}>Close <span aria-hidden="true">×</span></button></header>
        {reelOpen && <video controls playsInline autoPlay preload="metadata" src={asset(showreel)} poster={asset(featuredPoster)} aria-label="Alexander Chen showreel" />}
      </dialog>

      <div className="flow-content">
        <section className="studio-about studio-section" id="home-about" aria-labelledby="flow-story-title">
          <div className="studio-about-label">
            <p className="studio-eyebrow">About Alex</p>
            <p className="studio-about-role">Designer, storyteller by practice.</p>
            <p>{about.role}</p>
          </div>
          <div className="studio-about-copy">
            <h2 id="flow-story-title">{about.headline}</h2>
            {about.paragraphs.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
            <p>{profile.role}</p>
            <p>{profile.bio}</p>
          </div>
          <ul className="studio-impact" aria-label="Selected project results">
            {workHighlights.map(({ value, label, detail, route }) => (
              <li key={route}>
                <strong>{value}</strong>
                <a href={href(route)}>{label} <span aria-hidden="true">↗</span></a>
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </section>

        {collaborators}

        <section className="studio-practice" id="home-practice" aria-labelledby="studio-practice-title">
          <div className="studio-practice-inner studio-section">
            <div className="studio-practice-copy">
              <p className="studio-eyebrow">What I do</p>
              <h2 id="studio-practice-title">Strategy meets <span>making.</span></h2>
              <p className="studio-practice-summary">{profile.hero.summary}</p>
              <ul className="flow-disciplines" aria-label="Creative disciplines"><li>Product systems</li><li>Social strategy</li><li>Visual stories</li><li>UX + content</li></ul>
              <dl className="flow-current">
                <div><dt>Based in</dt><dd>{profile.location}, Canada</dd></div>
                <div><dt>Now building</dt><dd><a href={href("project/utopia-vinyl")}>Utopia Vinyl</a><a href={href("ao-studio")}>AO Studio</a></dd></div>
              </dl>
              <a className="studio-text-link" href={href("home-contact")} onClick={event => navigate(event, "/", "home-contact")}>Get in touch <span aria-hidden="true">↗</span></a>
            </div>
            <button type="button" className="flow-avatar studio-avatar" aria-label="Say hi to Alex" onClick={sayHello} onPointerEnter={event => { if (event.pointerType !== "touch") sayHello(); }}>
              <GreetingAvatar active={greetingReady && greeting && !paused} paused={paused} onReady={setGreetingReady} />
            </button>
          </div>
        </section>

        {children}

        <section className="flow-contact studio-contact studio-section" id="home-contact" aria-labelledby="flow-contact-title">
          <div>
            <h2 id="flow-contact-title">Say <span>hello.</span></h2>
            <p>{about.cta}</p>
            <a className="studio-text-link studio-contact-address" href={`mailto:${profile.email}`}>{profile.email} <span aria-hidden="true">↗</span></a>
          </div>
          <nav className="flow-links" aria-label="Get in touch">
            <a href={`mailto:${profile.email}`}>Email</a>
            {profile.socials.map(link => <a key={link.label} href={link.href.startsWith("/") ? asset(link.href) : link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
          </nav>
        </section>
        <footer className="flow-footer"><p>Alexander Chen <span>Design · content · visual storytelling</span></p><p>©{new Date().getFullYear()} {profile.name.toLowerCase()}<span>{clock}</span></p></footer>
      </div>
    </main>
  );
}
