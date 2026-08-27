import { useEffect, useMemo, useState } from "react";
import { about, playgroundProjects, profile, workProjects } from "./data";

const Arrow = () => <span aria-hidden="true">↗</span>;

function useClock() {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        timeZone: profile.timeZone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    [],
  );
  const [time, setTime] = useState(() => formatter.format(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => setTime(formatter.format(new Date())), 30_000);
    return () => window.clearInterval(timer);
  }, [formatter]);

  return `${time.toLowerCase()}, ${profile.location.toLowerCase()}`;
}

function usePage() {
  const readPage = () => (window.location.pathname.startsWith("/about") ? "about" : "home");
  const [page, setPage] = useState(readPage);

  useEffect(() => {
    const onPopState = () => setPage(readPage());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (event, destination, anchor) => {
    event?.preventDefault();
    window.history.pushState({}, "", destination);
    setPage(destination === "/about" ? "about" : "home");
    window.setTimeout(() => {
      if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return { page, navigate };
}

function NavigationLinks({ page, navigate, closeMenu }) {
  const go = (event, destination, anchor) => {
    closeMenu?.();
    navigate(event, destination, anchor);
  };

  return (
    <nav aria-label="Primary navigation">
      <ol className="numbered-links">
        <li>
          <a href="/#work" className={page === "home" ? "active" : ""} onClick={(e) => go(e, "/", "work")}>
            <span>01.</span><span>work</span>
          </a>
        </li>
        <li>
          <a href="/#playground" onClick={(e) => go(e, "/", "playground")}>
            <span>02.</span><span>playground</span>
          </a>
        </li>
        <li>
          <a href="/about" className={page === "about" ? "active" : ""} onClick={(e) => go(e, "/about")}>
            <span>03.</span><span>about</span>
          </a>
        </li>
      </ol>
    </nav>
  );
}

function ContactLinks() {
  return (
    <ol className="numbered-links contact-links" start="4">
      <li>
        <a href={`mailto:${profile.email}`}>
          <span>04.</span><span>email</span><Arrow />
        </a>
      </li>
      {profile.socials.map((social, index) => (
        <li key={social.label}>
          <a href={social.href} target="_blank" rel="noreferrer">
            <span>{String(index + 5).padStart(2, "0")}.</span>
            <span>{social.label.toLowerCase()}</span>
            <Arrow />
          </a>
        </li>
      ))}
    </ol>
  );
}

function Sidebar({ page, navigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <a className="brand reveal reveal-fast" href="/" onClick={(e) => navigate(e, "/")}>{profile.name}</a>
        <div className="profile-copy reveal">
          <p>{profile.role}</p>
          <p>{profile.bio}</p>
        </div>
        <div className="reveal">
          <NavigationLinks page={page} navigate={navigate} />
          <div className="rule" />
          <ContactLinks />
        </div>
      </div>
      <div className="sidebar-meta reveal">
        <span>©{new Date().getFullYear()} {profile.name.toLowerCase()}</span>
        <span>last updated&nbsp; {profile.updated}</span>
      </div>
    </aside>
  );
}

function MobileHeader({ page, navigate }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <>
      <header className="mobile-header">
        <a className="brand" href="/" onClick={(e) => navigate(e, "/")}>{profile.name}</a>
        <button
          className={`menu-toggle ${open ? "is-open" : ""}`}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span /><span /><span />
        </button>
      </header>
      <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <div className="profile-copy">
          <p>{profile.role}</p>
          <p>{profile.bio}</p>
        </div>
        <div>
          <NavigationLinks page={page} navigate={navigate} closeMenu={() => setOpen(false)} />
          <div className="rule" />
          <ContactLinks />
        </div>
        <div className="mobile-menu-meta">©{new Date().getFullYear()} {profile.name.toLowerCase()}</div>
      </div>
    </>
  );
}

function ProjectVisual({ type }) {
  if (type === "ai") {
    return (
      <div className="visual visual-ai" aria-hidden="true">
        <div className="ai-orbit orbit-one" /><div className="ai-orbit orbit-two" />
        <div className="ai-mark"><i /><i /><i /></div>
        <div className="ai-label">Aster</div>
      </div>
    );
  }

  if (type === "flora") {
    return (
      <div className="visual visual-flora" aria-hidden="true">
        <svg viewBox="0 0 700 560" preserveAspectRatio="xMidYMid slice">
          <path d="M49 584C75 464 123 416 210 384C297 352 311 247 274 147" />
          <path d="M194 392C126 355 96 313 88 241M235 337C315 319 374 270 403 203M278 227C206 191 180 142 189 75" />
          <path d="M405 553C382 450 417 382 505 331C589 282 613 206 592 126" />
          <path d="M479 345C429 294 421 248 438 187M526 315C604 321 650 293 683 243" />
          <g>
            <ellipse cx="91" cy="237" rx="41" ry="16" transform="rotate(31 91 237)" />
            <ellipse cx="187" cy="77" rx="43" ry="17" transform="rotate(-59 187 77)" />
            <ellipse cx="405" cy="203" rx="46" ry="17" transform="rotate(-31 405 203)" />
            <ellipse cx="440" cy="188" rx="38" ry="15" transform="rotate(-77 440 188)" />
            <ellipse cx="594" cy="126" rx="45" ry="16" transform="rotate(-69 594 126)" />
            <ellipse cx="681" cy="242" rx="42" ry="16" transform="rotate(-27 681 242)" />
          </g>
        </svg>
        <div className="flora-sheet sheet-a"><span>01</span><b>name the feeling</b></div>
        <div className="flora-sheet sheet-b"><span>02</span><b>trace the pattern</b></div>
      </div>
    );
  }

  if (type === "banking") {
    return (
      <div className="visual visual-banking" aria-hidden="true">
        <div className="bank-search">⌕&nbsp;&nbsp;Search your accounts</div>
        <div className="bank-card bank-card-a"><span>everyday</span><b>$8,420.16</b></div>
        <div className="bank-card bank-card-b"><span>savings</span><b>$24,075.80</b></div>
        <div className="bank-lines"><i /><i /><i /></div>
      </div>
    );
  }

  if (type === "portal") {
    return (
      <div className="visual visual-portal" aria-hidden="true">
        <div className="portal-window">
          <div className="portal-bar"><i /><i /><i /></div>
          <div className="portal-nav"><b>Campus</b><span>Home</span><span>Classes</span><span>Printing</span><span>Directory</span></div>
          <div className="portal-content"><span>Good morning</span><b>Your week at a glance</b><div /><div /><div /></div>
        </div>
      </div>
    );
  }

  if (type === "illustration") {
    return (
      <div className="visual visual-illustration" aria-hidden="true">
        <div className="sun" /><div className="hill hill-a" /><div className="hill hill-b" />
        <div className="character"><span /><i /></div>
        <div className="flower f-one" /><div className="flower f-two" /><div className="flower f-three" />
      </div>
    );
  }

  if (type === "landscape") {
    return (
      <div className="visual visual-landscape" aria-hidden="true">
        <div className="moon" /><div className="ridge ridge-a" /><div className="ridge ridge-b" />
        <div className="lake" /><div className="cabin"><i /></div>
      </div>
    );
  }

  if (type === "photo") {
    return (
      <div className="visual visual-photo" aria-hidden="true">
        <div className="photo-sky" /><div className="photo-shadow" /><div className="photo-wall" />
        <span>36° 03' N<br />5:42 pm</span>
      </div>
    );
  }

  if (type === "editorial") {
    return (
      <div className="visual visual-editorial" aria-hidden="true">
        <div className="editorial-title">THE SHARED<br />TABLE</div>
        <div className="plate"><i /><b /><span /></div>
        <div className="editorial-note">issue 04 — common knowledge</div>
      </div>
    );
  }

  if (type === "island") {
    return (
      <div className="visual visual-island" aria-hidden="true">
        <div className="water-lines" /><div className="island"><i className="tree t1" /><i className="tree t2" /><i className="tree t3" /><span className="house" /></div>
      </div>
    );
  }

  return (
    <div className="visual visual-comic" aria-hidden="true">
      <div className="comic-panel panel-a"><i /></div><div className="comic-panel panel-b"><i /></div>
      <div className="comic-panel panel-c"><i /></div><div className="comic-panel panel-d"><i /></div>
      <b>THE LONG WAY HOME</b>
    </div>
  );
}

function ProjectCard({ project, index }) {
  return (
    <a
      className="project-card reveal"
      href={project.href}
      style={{ "--aspect": project.aspect, "--delay": `${Math.min(index * 45, 180)}ms` }}
      aria-label={`${project.title}: ${project.description}`}
    >
      <div className="project-media"><ProjectVisual type={project.visual} /></div>
      <div className="project-copy">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>
    </a>
  );
}

function ProjectColumns({ projects }) {
  const midpoint = Math.ceil(projects.length / 2);
  const columns = [projects.slice(0, midpoint), projects.slice(midpoint)];
  return (
    <div className="masonry-columns">
      {columns.map((column, columnIndex) => (
        <div className="masonry-column" key={columnIndex}>
          {column.map((project, index) => (
            <ProjectCard project={project} index={index + columnIndex} key={project.title} />
          ))}
        </div>
      ))}
    </div>
  );
}

function HomePage({ clock }) {
  return (
    <main className="main-content">
      <section id="work" className="portfolio-section">
        <p className="section-label reveal reveal-fast">work</p>
        <ProjectColumns projects={workProjects} />
      </section>
      <section id="playground" className="portfolio-section">
        <p className="section-label reveal">playground + practice</p>
        <ProjectColumns projects={playgroundProjects} />
      </section>
      <MobileFooter clock={clock} />
    </main>
  );
}

function AboutPage({ clock }) {
  return (
    <main className="main-content about-page">
      <section className="about-section">
        <p className="section-label reveal reveal-fast">{about.eyebrow}</p>
        <div className="about-layout">
          <div className="about-collage reveal">
            <div className="snapshot snapshot-one"><span>currently</span><b>making useful things</b></div>
            <div className="snapshot snapshot-two"><i /><i /><i /></div>
            <div className="snapshot snapshot-three"><span>notes from<br />somewhere new</span></div>
            <div className="snapshot snapshot-four"><div className="mini-face" /></div>
          </div>
          <div className="about-copy reveal">
            {about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            <div className="about-cta">
              <h1>{about.callout}</h1>
              <p>{about.availability} Reach me at <a href={`mailto:${profile.email}`}>{profile.email}</a>.</p>
            </div>
          </div>
        </div>
      </section>
      <MobileFooter clock={clock} />
    </main>
  );
}

function MobileFooter({ clock }) {
  return (
    <footer className="mobile-footer">
      <span>©{new Date().getFullYear()} {profile.name.toLowerCase()}</span>
      <span>{clock}</span>
    </footer>
  );
}

export default function App() {
  const { page, navigate } = usePage();
  const clock = useClock();

  useEffect(() => {
    document.documentElement.classList.add("js");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8%", threshold: 0.06 },
    );
    const observe = () => document.querySelectorAll(".reveal:not(.is-visible)").forEach((item) => observer.observe(item));
    const frame = window.requestAnimationFrame(observe);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [page]);

  useEffect(() => {
    document.title = page === "about" ? `${profile.name} — About` : `${profile.name} — Designer`;
  }, [page]);

  return (
    <div className="site-shell">
      <div className="page-fade page-fade-top" /><div className="page-fade page-fade-bottom" />
      <Sidebar page={page} navigate={navigate} />
      <MobileHeader page={page} navigate={navigate} />
      {page === "about" ? <AboutPage clock={clock} /> : <HomePage clock={clock} />}
      <div className="desktop-clock">{clock}</div>
    </div>
  );
}
