import { useEffect, useMemo, useRef, useState } from "react";
import { about, playgroundItems, profile, workProjects } from "./data";

const Arrow = () => <span aria-hidden="true">↗</span>;
const BASE_URL = import.meta.env.BASE_URL;

const routeHref = (route = "") => `${BASE_URL}${route ? `#${route}` : ""}`;
const assetHref = (href = "") => {
  if (/^https?:\/\//.test(href)) return href;
  return `${BASE_URL}${href.replace(/^\//, "")}`;
};
const allProjects = workProjects.flatMap((project) => [project, ...(project.subprojects || [])]);
const projectFromRoute = (route) => allProjects.find((project) => route === `project/${project.slug}`);
const pageFromRoute = (route) => {
  if (route === "about") return "about";
  if (route === "playground") return "playground";
  if (route === "playground/photography") return "playground/photography";
  if (route === "playground/design") return "playground/design";
  if (projectFromRoute(route)) return route;
  return "home";
};

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
  const readRoute = () => window.location.hash.replace(/^#\/?/, "");
  const readPage = () => pageFromRoute(readRoute());
  const [page, setPage] = useState(readPage);

  useEffect(() => {
    const syncRoute = () => {
      const route = readRoute();
      const nextPage = pageFromRoute(route);
      setPage(nextPage);

      window.requestAnimationFrame(() => {
        if (nextPage === "home" && ["work", "playground"].includes(route)) {
          document.getElementById(route)?.scrollIntoView();
        } else {
          window.scrollTo({ top: 0 });
        }
      });
    };

    syncRoute();
    window.addEventListener("hashchange", syncRoute);
    window.addEventListener("popstate", syncRoute);
    return () => {
      window.removeEventListener("hashchange", syncRoute);
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  const navigate = (event, destination, anchor) => {
    event?.preventDefault();
    const route = destination === "/about" ? "about" : destination === "/playground" ? "playground" : anchor || "";
    const nextPage = pageFromRoute(route);

    window.history.pushState({}, "", routeHref(route));
    setPage(nextPage);
    window.setTimeout(() => {
      if (nextPage === "home" && anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
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
          <a href={routeHref("work")} className={page === "home" || page.startsWith("project/") ? "active" : ""} onClick={(e) => go(e, "/", "work")}>
            <span>01.</span><span>work</span>
          </a>
        </li>
        <li>
          <a href={routeHref("playground")} className={page.startsWith("playground") ? "active" : ""} onClick={(e) => go(e, "/playground")}>
            <span>02.</span><span>playground</span>
          </a>
        </li>
        <li>
          <a href={routeHref("about")} className={page === "about" ? "active" : ""} onClick={(e) => go(e, "/about")}>
            <span>03.</span><span>about</span>
          </a>
        </li>
      </ol>
    </nav>
  );
}

function ContactLinks() {
  const start = 4;
  return (
    <ol className="numbered-links contact-links" start={start}>
      <li>
        <a href={`mailto:${profile.email}`}>
          <span>{String(start).padStart(2, "0")}.</span><span>email</span><Arrow />
        </a>
      </li>
      {profile.socials.map((social, index) => (
        <li key={social.label}>
          <a href={assetHref(social.href)} target="_blank" rel="noreferrer">
            <span>{String(index + start + 1).padStart(2, "0")}.</span>
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
        <a className="brand reveal reveal-fast" href={routeHref()} onClick={(e) => navigate(e, "/")}>{profile.name}</a>
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
        <a className="brand" href={routeHref()} onClick={(e) => navigate(e, "/")}>{profile.name}</a>
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
      <div className={`mobile-menu ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
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

function ProjectVisual({ project, surface = "detail" }) {
  const { coverEyebrow, coverMetric, coverTitle, image, imageAlt, poster, video, visual: type } = project;

  if (surface === "card" && project.coverImage) {
    return (
      <div className={`visual project-logo-cover project-logo-cover-${project.coverImageStyle || "default"}`}>
        <img src={assetHref(project.coverImage)} alt={project.coverImageAlt || ""} loading="lazy" />
      </div>
    );
  }

  if (image) {
    return <img className="visual project-asset" src={assetHref(image)} alt={imageAlt || ""} loading="lazy" />;
  }

  if (video) {
    return (
      <video
        className="visual project-asset"
        src={assetHref(video)}
        poster={poster ? assetHref(poster) : undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
    );
  }

  if (["tt", "loblaw", "aves", "chenny"].includes(type)) {
    return (
      <div className={`visual project-cover project-cover-${type}`} aria-hidden="true">
        <span>{coverEyebrow}</span>
        <strong>{coverTitle}</strong>
        <small>{coverMetric}</small>
      </div>
    );
  }

  if (type === "loblaw-careers") {
    return (
      <div className="visual visual-loblaw-careers" aria-hidden="true">
        <div className="loblaw-browser">
          <div className="loblaw-browser-bar"><i /><i /><i /><span>careers.loblaw.ca</span></div>
          <div className="loblaw-careers-hero">
            <span>Careers at Loblaw</span>
            <b>Find your next opportunity.</b>
            <div>Search open roles <Arrow /></div>
          </div>
          <div className="loblaw-careers-tiles"><i /><i /><i /></div>
        </div>
      </div>
    );
  }

  if (type === "loblaw-toolkit") {
    return (
      <div className="visual visual-loblaw-toolkit" aria-hidden="true">
        <div className="toolkit-shell">
          <aside>
            <b>TA toolkit</b>
            <span>Templates</span>
            <span>Banners</span>
            <span>Photography</span>
            <span>LinkedIn</span>
          </aside>
          <div className="toolkit-main">
            <span>Global Talent Acquisition</span>
            <strong>Digital toolkit</strong>
            <div className="toolkit-grid"><i /><i /><i /><i /><i /><i /></div>
          </div>
        </div>
      </div>
    );
  }

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
  const href = project.href || routeHref(`project/${project.slug}`);
  const external = /^https?:\/\//.test(href);
  return (
    <a
      className="project-card reveal"
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={{ "--aspect": project.aspect, "--delay": `${Math.min(index * 45, 180)}ms` }}
      aria-label={`View the ${project.title} case study: ${project.description}`}
    >
      <div className="project-media"><ProjectVisual project={project} surface="card" /></div>
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
      <MobileFooter clock={clock} />
    </main>
  );
}

function PlaygroundObject({ kind }) {
  if (kind === "photo") {
    return <div className="mock-object mock-photo" aria-hidden="true"><i /><i /><i /></div>;
  }
  if (kind === "motion") {
    return <div className="mock-object mock-motion" aria-hidden="true"><i /><span>▶</span></div>;
  }
  if (kind === "poster") {
    return <div className="mock-object mock-poster" aria-hidden="true"><span>A</span><i /><b /></div>;
  }
  if (kind === "type") {
    return <div className="mock-object mock-type" aria-hidden="true"><span>Aa</span><i /></div>;
  }
  if (kind === "sketchbook") {
    return <div className="mock-object mock-sketchbook" aria-hidden="true"><i /><i /><i /><b /></div>;
  }
  return <div className="mock-object mock-blobs" aria-hidden="true"><i /><i /><i /></div>;
}

function PlaygroundItem({ index, item }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragState = useRef(null);
  const suppressClick = useRef(false);

  const content = item.image ? (
    <img src={assetHref(item.image)} alt={item.alt || ""} loading="lazy" draggable="false" />
  ) : item.video ? (
    <video src={assetHref(item.video)} poster={item.poster ? assetHref(item.poster) : undefined} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
  ) : (
    <PlaygroundObject kind={item.kind} />
  );
  const className = `plaything plaything-${item.slot}${isDragging ? " is-dragging" : ""}`;
  const style = {
    "--play-delay": `${index * -0.65}s`,
    "--sticker-position": item.position || "center",
    "--sticker-rotation": item.rotation || "0deg",
    "--sticker-scale": item.scale || 1,
    transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
  };
  const label = <span className="plaything-label">{item.label}{item.href && <i aria-hidden="true">↗</i>}</span>;

  const handlePointerDown = (event) => {
    if (event.button !== 0) return;
    const element = event.currentTarget;
    const stage = element.closest(".playground-stage");
    const elementRect = element.getBoundingClientRect();
    const stageRect = stage?.getBoundingClientRect();

    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offset.x,
      originY: offset.y,
      minX: stageRect ? offset.x + stageRect.left - elementRect.left : -Infinity,
      maxX: stageRect ? offset.x + stageRect.right - elementRect.right : Infinity,
      minY: stageRect ? offset.y + stageRect.top - elementRect.top : -Infinity,
      maxY: stageRect ? offset.y + stageRect.bottom - elementRect.bottom : Infinity,
    };
    suppressClick.current = false;
    element.setPointerCapture?.(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.hypot(deltaX, deltaY) > 4) suppressClick.current = true;

    setOffset({
      x: Math.min(drag.maxX, Math.max(drag.minX, drag.originX + deltaX)),
      y: Math.min(drag.maxY, Math.max(drag.minY, drag.originY + deltaY)),
    });
  };

  const finishDrag = (event) => {
    if (!dragState.current || dragState.current.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    dragState.current = null;
    setIsDragging(false);
  };

  const handleKeyDown = (event) => {
    const movement = {
      ArrowLeft: [-10, 0],
      ArrowRight: [10, 0],
      ArrowUp: [0, -10],
      ArrowDown: [0, 10],
    }[event.key];
    if (!movement) return;
    event.preventDefault();
    setOffset((current) => ({ x: current.x + movement[0], y: current.y + movement[1] }));
  };

  const interactionProps = {
    onPointerDown: handlePointerDown,
    onPointerMove: handlePointerMove,
    onPointerUp: finishDrag,
    onPointerCancel: finishDrag,
    onKeyDown: handleKeyDown,
    onDragStart: (event) => event.preventDefault(),
  };

  if (item.href) {
    const external = /^https?:\/\//.test(item.href);
    return (
      <a
        {...interactionProps}
        className={className}
        href={assetHref(item.href)}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        style={style}
        onClick={(event) => {
          if (!suppressClick.current) return;
          event.preventDefault();
          suppressClick.current = false;
        }}
      >
        <div className="plaything-media">{content}</div>
        {label}
      </a>
    );
  }

  return (
    <div {...interactionProps} aria-label={`${item.label}, draggable object`} className={className} role="group" style={style} tabIndex="0">
      <div className="plaything-media">{content}</div>
      {label}
    </div>
  );
}

function PlaygroundNavigation({ clock, navigate }) {
  return (
    <header className="playground-nav">
      <a className="playground-nav-brand" href={routeHref()} onClick={(event) => navigate(event, "/")}>{profile.name}</a>
      <nav aria-label="Playground navigation">
        <a href={routeHref("work")} onClick={(event) => navigate(event, "/", "work")}><span>01.</span> work</a>
        <a className="active" href={routeHref("playground")} onClick={(event) => navigate(event, "/playground")}><span>02.</span> playground</a>
        <a href={routeHref("about")} onClick={(event) => navigate(event, "/about")}><span>03.</span> about</a>
      </nav>
      <div className="playground-nav-meta">
        <a href={`mailto:${profile.email}`}>email <Arrow /></a>
        <span>{clock}</span>
      </div>
    </header>
  );
}

function PlaygroundPage({ clock, navigate }) {
  return (
    <main className="playground-page">
      <PlaygroundNavigation clock={clock} navigate={navigate} />
      <section
        className="playground-stage"
        aria-labelledby="playground-title"
        style={{ "--playground-background": `url(${assetHref("/projects/playground/playground-table-background.jpg")})` }}
      >
        <h1 className="playground-title" id="playground-title">Playground</h1>
        <p className="playground-kicker">personal archive · ongoing</p>
        <p className="playground-note">A space for things made from curiosity.</p>
        {playgroundItems.map((item, index) => <PlaygroundItem index={index} item={item} key={item.id} />)}
      </section>
    </main>
  );
}

function PhotographyPage({ clock, navigate }) {
  return (
    <main className="playground-page photography-page">
      <PlaygroundNavigation clock={clock} navigate={navigate} />
      <section
        className="photography-hero"
        aria-labelledby="photography-title"
        style={{ "--photography-background": `url(${assetHref("/projects/playground/photography/toronto-waterfront-deck.jpg")})` }}
      >
        <div className="photography-hero-copy reveal">
          <a className="photography-back" href={routeHref("playground")} onClick={(event) => navigate(event, "/playground")}>
            <span aria-hidden="true">←</span> playground
          </a>
          <p className="photography-kicker">personal archive · my art</p>
          <h1 id="photography-title">My Art</h1>
          <p className="photography-lede">My evolving collection of portraits, events, sports, and everyday moments that catch my eye.</p>
          <div className="photography-meta" aria-label="My Art archive details">
            <span>2020—present</span>
            <span>Toronto + elsewhere</span>
          </div>
        </div>
        <div className="photography-camera-stage reveal">
          <span>sony α7r iii</span>
          <img src={assetHref("/projects/playground/stickers/a7riii-sticker.png")} alt="Sony A7R III camera sticker" />
        </div>
      </section>
      <section className="photography-archive-intro" aria-labelledby="photography-archive-title">
        <p>selected frames</p>
        <div>
          <h2 id="photography-archive-title">The archive starts here.</h2>
          <p>Selected photography projects will be added to this space as the collection is curated.</p>
        </div>
      </section>
    </main>
  );
}

function DesignPage({ clock, navigate }) {
  return (
    <main className="playground-page photography-page design-page">
      <PlaygroundNavigation clock={clock} navigate={navigate} />
      <section
        className="photography-hero design-hero"
        aria-labelledby="design-title"
        style={{ "--photography-background": `url(${assetHref("/projects/playground/photography/toronto-waterfront-deck.jpg")})` }}
      >
        <div className="photography-hero-copy reveal">
          <a className="photography-back" href={routeHref("playground")} onClick={(event) => navigate(event, "/playground")}>
            <span aria-hidden="true">←</span> playground
          </a>
          <p className="photography-kicker">personal archive · UX design</p>
          <h1 id="design-title">My Design</h1>
          <p className="photography-lede">A selection of UX projects shaped by research, strategy, thoughtful interactions, and clear visual systems.</p>
          <div className="photography-meta" aria-label="My Design archive details">
            <span>UX/UI design</span>
            <span>Research → prototype</span>
          </div>
        </div>
        <div className="photography-camera-stage design-laptop-stage reveal">
          <span>Selected UX work</span>
          <img src={assetHref("/projects/playground/stickers/macbook-sticker.png")} alt="MacBook sticker" />
        </div>
      </section>
      <section className="photography-archive-intro design-projects-intro" aria-labelledby="design-projects-title">
        <p>UX case studies</p>
        <div>
          <h2 id="design-projects-title">The project space is ready.</h2>
          <p>Each case study can show the challenge, my role, research, design process, prototype, and outcome.</p>
        </div>
      </section>
    </main>
  );
}

function CaseStudyPage({ clock, navigate, project }) {
  const backRoute = project.parentSlug ? `project/${project.parentSlug}` : "work";
  const backLabel = project.parentTitle || "selected work";

  return (
    <main className="main-content case-study-page">
      <article className="case-study">
        <a className="case-study-back reveal reveal-fast" href={routeHref(backRoute)} onClick={(event) => navigate(event, "/", backRoute)}>
          <span aria-hidden="true">←</span> {backLabel}
        </a>
        <div className="case-study-media reveal" style={{ "--aspect": project.aspect }}>
          <ProjectVisual project={project} />
        </div>
        <header className="case-study-header reveal">
          <p>{project.coverEyebrow}</p>
          <h1>{project.title}</h1>
          <div className="case-study-intro">{project.description}</div>
        </header>
        <dl className="case-study-meta reveal">
          <div><dt>Role</dt><dd>{project.role}</dd></div>
          <div><dt>Organization</dt><dd>{project.organization}</dd></div>
          <div><dt>Timeline</dt><dd>{project.period}</dd></div>
        </dl>
        {project.mediaSections?.map((section, sectionIndex) => (
          <section className="case-study-feature reveal" aria-labelledby={`${project.slug}-feature-${sectionIndex}`} key={section.title}>
            <div className="case-study-feature-copy">
              <p>{section.eyebrow}</p>
              <div>
                <h2 id={`${project.slug}-feature-${sectionIndex}`}>{section.title}</h2>
                {section.description && <p>{section.description}</p>}
              </div>
            </div>
            <div className={`case-study-gallery${section.layout ? ` case-study-gallery-${section.layout}` : ""}`}>
              {section.items.map((item, itemIndex) => (
                <figure className="case-study-gallery-item" key={item.src || item.videoId} style={{ "--media-aspect": item.aspect || "1 / 1" }}>
                  {item.type === "youtube" ? (
                    <div className="case-study-embed">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${item.videoId}`}
                        title={item.title || section.title}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    </div>
                  ) : item.type === "video" ? (
                    <video
                      controls
                      playsInline
                      preload="metadata"
                      poster={item.poster ? assetHref(item.poster) : undefined}
                      aria-label={item.caption || `${section.title} video ${itemIndex + 1}`}
                    >
                      <source src={assetHref(item.src)} type="video/mp4" />
                      Your browser does not support embedded video.
                    </video>
                  ) : (
                    <img src={assetHref(item.src)} alt={item.alt || ""} loading="lazy" />
                  )}
                  {item.caption && (
                    <figcaption>
                      <span>{String(itemIndex + 1).padStart(2, "0")}</span>
                      {item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.caption}<Arrow /></a> : item.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        ))}
        {project.subprojects?.length > 0 && (
          <section className="case-study-subprojects reveal" aria-labelledby={`${project.slug}-projects`}>
            <div className="case-study-subprojects-heading">
              <p>Featured projects</p>
              <h2 id={`${project.slug}-projects`}>Explore the Loblaw work.</h2>
            </div>
            <div className="case-study-subproject-grid">
              {project.subprojects.map((subproject, index) => (
                <ProjectCard project={subproject} index={index} key={subproject.slug} />
              ))}
            </div>
          </section>
        )}
        <section className="case-study-impact reveal" aria-labelledby={`${project.slug}-impact`}>
          <h2 id={`${project.slug}-impact`}>Selected impact</h2>
          <ol>
            {project.impact.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </section>
      </article>
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
  const selectedProject = projectFromRoute(page);
  const isPlayground = page.startsWith("playground");

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
    if (page === "about") document.title = `${profile.name} — About`;
    else if (page === "playground/photography") document.title = `${profile.name} — My Art`;
    else if (page === "playground/design") document.title = `${profile.name} — My Design`;
    else if (page === "playground") document.title = `${profile.name} — Playground`;
    else if (selectedProject) document.title = `${selectedProject.title} — ${profile.name}`;
    else document.title = `${profile.name} — Digital Designer & Content Strategist`;
  }, [page, selectedProject]);

  return (
    <div className="site-shell">
      {!isPlayground && <><div className="page-fade page-fade-top" /><div className="page-fade page-fade-bottom" /></>}
      {!isPlayground && <Sidebar page={page} navigate={navigate} />}
      {!isPlayground && <MobileHeader page={page} navigate={navigate} />}
      {page === "about" ? (
        <AboutPage clock={clock} />
      ) : page === "playground/photography" ? (
        <PhotographyPage clock={clock} navigate={navigate} />
      ) : page === "playground/design" ? (
        <DesignPage clock={clock} navigate={navigate} />
      ) : page === "playground" ? (
        <PlaygroundPage clock={clock} navigate={navigate} />
      ) : selectedProject ? (
        <CaseStudyPage clock={clock} navigate={navigate} project={selectedProject} />
      ) : (
        <HomePage clock={clock} />
      )}
      {!isPlayground && <div className="desktop-clock">{clock}</div>}
    </div>
  );
}
