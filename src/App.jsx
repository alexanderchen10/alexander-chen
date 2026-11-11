import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { about, aoStudioProjectSlugs, playgroundItems, profile, utopiaMetrics, workProjects } from "./data";
import AlexLifeGame from "./AlexLifeGame";
import GtaEmailCaseStudy from "./GtaEmailCaseStudy";
import AlexLifeGameV2 from "./AlexLifeGameV2";

const Arrow = ({ className }) => <span className={className} aria-hidden="true">↗</span>;
const BASE_URL = import.meta.env.BASE_URL;

const routeHref = (route = "") => `${BASE_URL}${route ? `#${route}` : ""}`;
const assetHref = (href = "") => {
  if (/^https?:\/\//.test(href)) return href;
  return `${BASE_URL}${href.replace(/^\//, "")}`;
};
const allProjects = workProjects.flatMap((project) => [project, ...(project.subprojects || [])]);
const projectFromRoute = (route) => allProjects.find((project) => route === `project/${project.slug}`);
const projectDetailRoute = (project, chapter, index) => `project/${project.slug}/${chapter.id}/${index + 1}`;
const detailFromRoute = (route) => {
  for (const project of workProjects) {
    for (const chapter of project.chapters || []) {
      const index = chapter.projects.findIndex((_, projectIndex) => route === projectDetailRoute(project, chapter, projectIndex));
      if (index !== -1) return { project, chapter, entry: chapter.projects[index], index };
    }
  }
  return null;
};
const pageFromRoute = (route) => {
  if (route === "about") return "about";
  if (route === "education") return "education";
  if (route === "ao-studio") return "ao-studio";
  if (route === "playground") return "playground";
  if (route === "playground/photography") return "playground/photography";
  if (route.startsWith("playground/photography/")) return route;
  if (route === "playground/design") return "playground/design";
  if (route === "playground/fa-adventure") return "playground/fa-adventure";
  if (route === "playground/alexs-life") return "playground/alexs-life";
  if (route === "playground/alexs-life-hifi") return "playground/alexs-life-hifi";
  if (projectFromRoute(route) || detailFromRoute(route)) return route;
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

function useIcffActiveSection() {
  const [activeSection, setActiveSection] = useState("icff-context");

  useEffect(() => {
    const updateActiveSection = () => {
      const photoshoot = document.getElementById("icff-photoshoot");
      if (!photoshoot) return;
      const nextSection = photoshoot.getBoundingClientRect().top <= window.innerHeight * 0.28 ? "icff-photoshoot" : "icff-context";
      setActiveSection((current) => current === nextSection ? current : nextSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  return activeSection;
}

const icffHubSections = ["icff-role", "icff-organization", "icff-timeline", "icff-featured-projects"];

function useIcffHubActiveSection() {
  const [activeSection, setActiveSection] = useState(icffHubSections[0]);

  useEffect(() => {
    const updateActiveSection = () => {
      const marker = window.innerHeight * 0.3;
      const currentSection = icffHubSections.reduce((current, sectionId) => {
        const section = document.getElementById(sectionId);
        return section && section.getBoundingClientRect().top <= marker ? sectionId : current;
      }, icffHubSections[0]);
      setActiveSection((current) => current === currentSection ? current : currentSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  return activeSection;
}

function usePage() {
  const readRoute = () => window.location.hash.replace(/^#\/?/, "");
  const readPage = () => pageFromRoute(readRoute());
  const [route, setRoute] = useState(readRoute);
  const [page, setPage] = useState(readPage);

  useEffect(() => {
    const syncRoute = () => {
      const currentRoute = readRoute();
      const nextPage = pageFromRoute(currentRoute);
      setRoute(currentRoute);
      setPage(nextPage);

      window.requestAnimationFrame(() => {
        if (nextPage === "home" && ["work", "experience"].includes(currentRoute)) {
          document.getElementById(currentRoute)?.scrollIntoView();
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
    const standaloneRoutes = { "/about": "about", "/ao-studio": "ao-studio", "/playground": "playground" };
    const route = standaloneRoutes[destination] || anchor || "";
    const nextPage = pageFromRoute(route);

    window.history.pushState({}, "", routeHref(route));
    setRoute(route);
    setPage(nextPage);
    window.setTimeout(() => {
      if (nextPage === "home" && anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    });
  };

  return { page, route, navigate };
}

function useProjectProgress(sections = []) {
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState(sections[0]?.id || "");
  const sectionKey = sections.map((section) => section.id).join("|");

  useEffect(() => {
    const update = () => {
      const root = document.documentElement;
      const scrollable = Math.max(1, root.scrollHeight - window.innerHeight);
      const nextProgress = Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
      const marker = window.innerHeight * 0.38;
      const nextActive = sections.reduce((current, section) => {
        const element = document.getElementById(section.id);
        return element && element.getBoundingClientRect().top <= marker ? section.id : current;
      }, sections[0]?.id || "");
      setProgress((current) => Math.abs(current - nextProgress) > 0.4 ? nextProgress : current);
      setActiveId((current) => current === nextActive ? current : nextActive);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionKey]);

  return { progress, activeId };
}

function ProjectProgressHUD({ sections, label = "Project journey", embedded = false }) {
  const { progress, activeId } = useProjectProgress(sections);
  const activeIndex = Math.max(0, sections.findIndex((section) => section.id === activeId));
  const activeSection = sections[activeIndex] || sections[0];

  if (!sections.length) return null;

  const jumpTo = (sectionId) => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <aside className={`project-progress-hud${embedded ? " project-progress-hud-topbar" : ""}`} aria-label={label}>
      <div className="project-progress-copy">
        <span>{String(activeIndex + 1).padStart(2, "0")} / {String(sections.length).padStart(2, "0")}</span>
        <strong>{activeSection?.label}</strong>
        <small>{Math.round(progress)}%</small>
      </div>
      <div className="project-progress-line" role="progressbar" aria-label={`${label} progress`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={Math.round(progress)}>
        <i style={{ width: `${progress}%` }} />
      </div>
      <nav aria-label={`${label} chapters`}>
        {sections.map((section, index) => (
          <button
            type="button"
            className={section.id === activeId ? "active" : ""}
            onClick={() => jumpTo(section.id)}
            aria-label={`Go to ${section.label}`}
            aria-current={section.id === activeId ? "step" : undefined}
            key={section.id}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

function ZoomableImage({ src, previewSrc, alt = "", loading = "lazy", className = "" }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => event.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button className={`zoomable-image ${className}`} type="button" onClick={() => setOpen(true)} aria-label={`Open ${alt || "project image"} full screen`}>
        <img src={assetHref(previewSrc || src)} alt={alt} loading={loading} decoding="async" />
        <span aria-hidden="true">↗</span>
      </button>
      {open && createPortal(
        <div className="media-lightbox" role="dialog" aria-modal="true" aria-label={alt || "Expanded project image"} onClick={() => setOpen(false)}>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close image">×</button>
          <img src={assetHref(src)} alt={alt} onClick={(event) => event.stopPropagation()} />
          {alt && <p>{alt}</p>}
        </div>,
        document.body,
      )}
    </>
  );
}

function NavigationLinks({ page, route, navigate, closeMenu }) {
  const go = (event, destination, anchor) => {
    closeMenu?.();
    navigate(event, destination, anchor);
  };

  return (
    <nav aria-label="Primary navigation">
      <ol className="numbered-links">
        <li>
          <a href={routeHref("work")} className={route !== "experience" && (page === "home" || page.startsWith("project/")) ? "active" : ""} onClick={(e) => go(e, "/", "work")}>
            <span>01.</span><span>projects</span>
          </a>
        </li>
        <li>
          <a href={routeHref("experience")} className={route === "experience" ? "active" : ""} onClick={(e) => go(e, "/", "experience")}>
            <span>02.</span><span>experience</span>
          </a>
        </li>
        <li>
          <a href={routeHref("playground")} className={page.startsWith("playground") ? "active" : ""} onClick={(e) => go(e, "/playground")}>
            <span>03.</span><span>playground</span>
          </a>
        </li>
        <li>
          <a href={routeHref("about")} className={page === "about" ? "active" : ""} onClick={(e) => go(e, "/about")}>
            <span>04.</span><span>about</span>
          </a>
        </li>
        <li>
          <a href={routeHref("ao-studio")} className={page === "ao-studio" ? "active" : ""} onClick={(e) => go(e, "/ao-studio")}>
            <span>05.</span><span>ao studio</span>
          </a>
        </li>
        <li>
          <a href={routeHref("education")} className={page === "education" ? "active" : ""} onClick={(e) => go(e, "/", "education")}>
            <span>06.</span><span>education</span>
          </a>
        </li>
      </ol>
    </nav>
  );
}

function ContactLinks() {
  const start = 6;
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

function BrandMark() {
  return (
    <picture>
      <source media="(prefers-reduced-motion: reduce)" srcSet={assetHref("/branding/alexander-chen-continuous.png")} />
      <img src={assetHref("/branding/alexander-chen-continuous-beacon.gif")} width="720" height="428" alt="Alexander Chen AC monogram" />
    </picture>
  );
}

function AvailabilityBadge() {
  return (
    <a className="availability-badge" href={`mailto:${profile.email}`}>
      <span className="availability-dot" aria-hidden="true" />
      <span>Open to opportunities</span>
    </a>
  );
}

function Sidebar({ page, route, navigate, clock, projectProgress }) {
  const moveTopbarGlow = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--topbar-x", `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty("--topbar-y", `${event.clientY - bounds.top}px`);
  };

  return (
    <aside
      className="sidebar global-topbar"
      onPointerMove={moveTopbarGlow}
      onPointerLeave={(event) => {
        event.currentTarget.style.removeProperty("--topbar-x");
        event.currentTarget.style.removeProperty("--topbar-y");
      }}
    >
      <div className="topbar-primary">
        <a className="brand brand-logo reveal reveal-fast" aria-label="Alexander Chen home" href={routeHref()} onClick={(e) => navigate(e, "/")}><BrandMark /></a>
        <NavigationLinks page={page} route={route} navigate={navigate} />
        <div className="topbar-actions">
          <AvailabilityBadge />
          <ContactLinks />
        </div>
      </div>
      <div className={`topbar-secondary${projectProgress ? " topbar-secondary-progress" : ""}`}>
        {projectProgress ? (
          <ProjectProgressHUD sections={projectProgress.sections} label={projectProgress.label} embedded />
        ) : (
          <>
            <div className="profile-copy reveal">
              <p>{profile.role}</p>
              <p>{profile.bio}</p>
            </div>
            <div className="sidebar-meta reveal">
              <span>©{new Date().getFullYear()} {profile.name.toLowerCase()}</span>
              <span>updated {profile.updated}</span>
              <span>{clock}</span>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function IcffSidebar({ clock, navigate, project }) {
  const activeSection = useIcffActiveSection();
  const backRoute = project.parentSlug ? `project/${project.parentSlug}` : "work";
  const backLabel = project.parentSlug ? "Back to ICFF" : "Back to work";
  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="sidebar icff-sidebar">
      <div className="icff-sidebar-main">
        <a className="icff-sidebar-back" href={routeHref(backRoute)} onClick={(event) => navigate(event, "/", backRoute)}>{backLabel}</a>
        <nav className="icff-section-nav" aria-label="ICFF page navigation">
          <a className={activeSection === "icff-context" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-context")} aria-current={activeSection === "icff-context" ? "location" : undefined}>context</a>
          <a className={activeSection === "icff-photoshoot" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-photoshoot")} aria-current={activeSection === "icff-photoshoot" ? "location" : undefined}>photoshoot</a>
        </nav>
      </div>
      <div className="sidebar-meta">
        <span>ICFF · {project.period}</span>
        <span>{clock}</span>
      </div>
    </aside>
  );
}

function IcffHubSidebar({ clock, navigate, project }) {
  const activeSection = useIcffHubActiveSection();
  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="sidebar icff-sidebar">
      <div className="icff-sidebar-main">
        <a className="icff-sidebar-back" href={routeHref("work")} onClick={(event) => navigate(event, "/", "work")}>Back to work</a>
        <nav className="icff-section-nav icff-hub-section-nav" aria-label="ICFF collection navigation">
          <a className={activeSection === "icff-role" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-role")}>Role</a>
          <a className={activeSection === "icff-organization" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-organization")}>Organization</a>
          <a className={activeSection === "icff-timeline" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-timeline")}>Timeline</a>
          <a className={activeSection === "icff-featured-projects" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-featured-projects")}>Featured Projects</a>
        </nav>
      </div>
      <div className="sidebar-meta">
        <span>ICFF · {project.period}</span>
        <span>{clock}</span>
      </div>
    </aside>
  );
}

function MobileHeader({ page, route, navigate }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  return (
    <>
      <header className="mobile-header">
        <a className="brand brand-logo" aria-label="Alexander Chen home" href={routeHref()} onClick={(e) => navigate(e, "/")}><BrandMark /></a>
        <AvailabilityBadge />
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
          <NavigationLinks page={page} route={route} navigate={navigate} closeMenu={() => setOpen(false)} />
          <div className="rule" />
          <ContactLinks />
        </div>
        <div className="mobile-menu-meta">©{new Date().getFullYear()} {profile.name.toLowerCase()}</div>
      </div>
    </>
  );
}

function ProjectCardVideo({ project }) {
  const [reduceMotion, setReduceMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  if (reduceMotion) return <img className="visual project-asset" src={assetHref(project.cardImage)} alt={project.imageAlt || ""} loading="lazy" />;
  return <video className="visual project-asset" src={assetHref(project.cardVideo)} poster={assetHref(project.cardImage)} autoPlay muted loop playsInline preload="metadata" disablePictureInPicture aria-label="Utopia Vinyl walkthrough: browsing new arrivals and opening a record" />;
}

function ProjectVisual({ project, surface = "detail" }) {
  const { bannerVideo, cardImage, coverEyebrow, coverMetric, coverTitle, image, imageAlt, poster, video, visual: type } = project;

  if (surface === "card" && project.coverImage) {
    return (
      <div className={`visual project-logo-cover project-logo-cover-${project.coverImageStyle || "default"}`}>
        <img src={assetHref(project.coverImage)} alt={project.coverImageAlt || ""} loading="lazy" />
      </div>
    );
  }

  if (surface === "card" && project.cardVideo) return <ProjectCardVideo project={project} />;

  if (surface === "card" && cardImage) {
    return <img className="visual project-asset" src={assetHref(cardImage)} alt={imageAlt || ""} loading="lazy" />;
  }

  if (surface === "detail" && bannerVideo) {
    return (
      <video
        className="visual project-asset"
        src={assetHref(bannerVideo)}
        poster={assetHref(poster || image)}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
      />
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

  if (["tt", "loblaw", "aves", "chenny", "icff-isabella", "icff-giancarlo"].includes(type)) {
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
        <div className="editorial-note">issue 04 / common knowledge</div>
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
  if (project.slug === "utopia-vinyl") return (
    <article className="project-card project-card-utopia reveal" style={{ "--aspect": project.aspect, "--delay": `${Math.min(index * 45, 180)}ms` }}>
      <a href={href} aria-label="Read the Utopia Vinyl case study"><div className="project-media"><ProjectVisual project={project} surface="card" /></div></a>
      <div className="project-copy">
        <div className="project-copy-heading">
          <h3><a href={href}>{project.title}</a></h3>
          <div className="project-copy-meta"><span className="project-status">{project.status}</span><span>{project.period}</span></div>
        </div>
        <p className="project-card-role">{project.role}</p>
        <p className="project-card-summary">{project.homeDescription}</p>
        <div className="project-card-actions">
          <a className="project-live-button" href={project.liveUrl} target="_blank" rel="noreferrer"><span className="project-live-dot" aria-hidden="true" />Visit live site <Arrow /></a>
          <a className="project-case-link" href={href}>Read case study <Arrow /></a>
        </div>
        <section className="project-impact-summary" aria-label="Utopia Vinyl impact">
          <div className="project-impact-heading"><span>Impact</span><span>As of {utopiaMetrics.asOf}</span></div>
          <dl className="project-impact-metrics">
            <div><dt>Valid orders</dt><dd>{utopiaMetrics.validOrders}</dd></div>
            <div><dt>Displayed order total</dt><dd>{utopiaMetrics.orderTotal}</dd></div>
            <div><dt>Paid · {utopiaMetrics.paidOrders} orders</dt><dd>{utopiaMetrics.paidTotal}</dd></div>
            <div><dt>Awaiting payment · {utopiaMetrics.awaitingOrders} orders</dt><dd>{utopiaMetrics.awaitingTotal}</dd></div>
          </dl>
          <p className="project-impact-note">Order total includes paid and awaiting-payment orders. Cancelled and expired orders excluded.</p>
        </section>
      </div>
    </article>
  );
  return (
    <a
      className="project-card reveal"
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={{ "--aspect": project.aspect, "--delay": `${Math.min(index * 45, 180)}ms` }}
      aria-label={`View the ${project.title} ${project.chapters ? "projects" : "case study"}: ${project.description}`}
    >
      <div className="project-media"><ProjectVisual project={project} surface="card" /></div>
      <div className="project-copy">
        <div className="project-copy-heading">
          <h3>{project.title}</h3>
          <div className="project-copy-meta">
            {project.status && <span className="project-status">{project.status}</span>}
            <span>{project.period}</span>
          </div>
        </div>
        <p className="project-card-role">{project.role}</p>
        <p className="project-card-summary">{project.description}</p>
        {project.homeMetric && (
          <p className="project-card-impact"><span>impact</span>{project.homeMetric}</p>
        )}
      </div>
    </a>
  );
}

function ProjectColumns({ projects }) {
  const visibleProjects = projects.filter((project) => project.showInWork !== false);
  const midpoint = Math.ceil(visibleProjects.length / 2);
  const columns = [visibleProjects.slice(0, midpoint), visibleProjects.slice(midpoint)];
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

function ExperienceProjectLink({ project, label, navigate }) {
  const projectRoute = `project/${project.slug}`;
  const showHoverPreview = ["corcoran-oakville-grand-opening", "icff-lavazza-inclucity"].includes(project.slug);

  return (
    <a
      className={`home-experience-project${showHoverPreview ? " has-preview" : ""}`}
      href={routeHref(projectRoute)}
      onClick={(event) => navigate(event, "/", projectRoute)}
    >
      <span>{label || project.title}</span>
      <Arrow className="home-experience-project-arrow" />
      {showHoverPreview && (
        <span className="home-experience-project-preview" aria-hidden="true">
          <span className="home-experience-project-preview-media" style={{ "--preview-aspect": project.aspect || "16 / 9" }}>
            <ProjectVisual project={project} surface="card" />
          </span>
          <span className="home-experience-project-preview-caption">
            <small>AO Studio project</small>
            <strong>{project.title}</strong>
          </span>
        </span>
      )}
    </a>
  );
}

function HomeExperience({ navigate }) {
  const cardStack = useRef(null);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined" || typeof IntersectionObserver === "undefined") return;

    const stack = cardStack.current;
    const cards = Array.from(stack.children);
    const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const clampProgress = (value) => Math.max(0, Math.min(1, value));
    let isOnScreen = false;
    let frame = 0;

    const queueStackUpdate = () => {
      if (!isOnScreen || !motion.matches || frame) return;

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!isOnScreen || !motion.matches) return;

        // The wrappers stay level, so rotations on the card faces cannot change these measurements.
        const deckTop = parseFloat(getComputedStyle(stack).getPropertyValue("--experience-deck-top"));
        const entryDistance = Math.max(1, window.innerHeight - deckTop);
        const bounds = cards.map((card) => card.getBoundingClientRect());
        cards.forEach((card, index) => {
          const { top, bottom } = bounds[index];
          const next = bounds[index + 1];
          const arrival = index === 0 ? 1 : clampProgress(1 - (top - deckTop) / entryDistance);
          const visibleHeight = Math.max(1, bottom - Math.max(top, deckTop));
          const cover = next ? clampProgress((bottom - next.top) / visibleHeight) : 0;
          card.style.setProperty("--experience-arrival", arrival.toFixed(3));
          card.style.setProperty("--experience-cover", cover.toFixed(3));
          card.toggleAttribute("data-covered", cover === 1);
        });
      });
    };

    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach(({ target }) => {
        target.style.setProperty("--experience-card-height", `${target.offsetHeight}px`);
      });
      queueStackUpdate();
    });
    cards.forEach((card) => resizeObserver.observe(card));

    const visibilityObserver = new IntersectionObserver(([entry]) => {
      isOnScreen = entry.isIntersecting;
      queueStackUpdate();
    });
    const revealFocusedLink = ({ target }) => {
      if (motion.matches && target.matches(":focus-visible")) {
        target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
      }
    };
    stack.classList.add("is-deck");
    visibilityObserver.observe(stack);
    window.addEventListener("scroll", queueStackUpdate, { passive: true });
    window.addEventListener("resize", queueStackUpdate);
    stack.addEventListener("focusin", revealFocusedLink);
    stack.addEventListener("focusout", queueStackUpdate);
    motion.addEventListener("change", queueStackUpdate);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", queueStackUpdate);
      window.removeEventListener("resize", queueStackUpdate);
      stack.removeEventListener("focusin", revealFocusedLink);
      stack.removeEventListener("focusout", queueStackUpdate);
      motion.removeEventListener("change", queueStackUpdate);
      stack.classList.remove("is-deck");
      visibilityObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <section id="experience" className="home-experience" aria-labelledby="home-experience-title">
      <header className="home-experience-heading">
        <p className="home-experience-kicker">02 / experience</p>
        <h2 id="home-experience-title"><span>Professional</span>{" "}<span>experience</span></h2>
        <p className="home-experience-note">Six roles spanning client success, marketing, brand systems, community, and creative production.</p>
      </header>
      <div className="home-experience-ticker" aria-hidden="true">
        <div>
          {[0, 1].map((copy) => (
            <span key={copy}>Client success · Brand systems · Digital strategy · Creative production · </span>
          ))}
        </div>
      </div>
      <div className="home-experience-list">
        <div className="home-experience-stack" ref={cardStack}>
          {about.experience.map((experience, index) => {
            const relatedProjects = (experience.projectSlugs || [])
              .map((slug) => projectFromRoute(`project/${slug}`))
              .filter(Boolean);

            return (
              <div
                className="home-experience-card"
                key={`${experience.organization}-${experience.role}`}
                style={{ "--experience-deal-direction": index % 2 === 0 ? -1 : 1 }}
              >
                <article className="home-experience-item" aria-labelledby={`home-experience-company-${index}`}>
                  <div className="home-experience-side">
                    <span className="home-experience-sequence" aria-hidden="true">{String(index + 1).padStart(2, "0")} / {String(about.experience.length).padStart(2, "0")}</span>
                    <h3 id={`home-experience-company-${index}`}>{experience.organization}</h3>
                    <p>{experience.period}</p>
                    {experience.location && <p>{experience.location}</p>}
                    {relatedProjects.length > 0 && (
                      <nav className="home-experience-projects" aria-label={`Related projects at ${experience.organization}`}>
                        <p>Selected work</p>
                        {relatedProjects.map((project) => (
                          <ExperienceProjectLink
                            key={project.slug}
                            project={project}
                            label={experience.projectLabels?.[project.slug]}
                            navigate={navigate}
                          />
                        ))}
                      </nav>
                    )}
                  </div>
                  <div className="home-experience-content">
                    <h4>{experience.role}</h4>
                    <p className="home-experience-summary">{experience.summary}</p>
                    <ul className="home-experience-highlights">
                      {experience.highlights.map((highlight) => (
                        <li key={highlight.value}>
                          <strong>{highlight.value}</strong>
                          <p>{highlight.detail}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </div>
            );
          })}
        </div>
        <footer className="home-experience-resume reveal" aria-label="Resume education, capabilities, and contact details">
          <header>
            <div>
              <p>Resume / credentials</p>
              <h3>Education, delivery skills, and the tools behind the work.</h3>
            </div>
            <a href={assetHref("/resume.pdf")} target="_blank" rel="noreferrer">Open full résumé <Arrow /></a>
          </header>
          <div className="home-resume-details-grid">
            <section className="home-resume-education" aria-labelledby="home-resume-education-title">
              <h4 id="home-resume-education-title">Education</h4>
              {about.education.map((item) => (
                <article key={item.program}>
                  <p>{item.program}</p>
                  <span>{item.school}</span>
                  <time>{item.period}</time>
                </article>
              ))}
            </section>
            <section className="home-resume-capabilities" aria-labelledby="home-resume-capabilities-title">
              <h4 id="home-resume-capabilities-title">Skills &amp; tools</h4>
              <dl>
                {about.capabilities.map((item) => (
                  <div key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.items}</dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
          <nav className="home-resume-contact" aria-label="Resume contact information">
            <a href={`tel:${profile.phone.replace(/[^+\d]/g, "")}`}><span>Phone</span>{profile.phone}</a>
            <a href={`mailto:${profile.email}`}><span>Email</span>{profile.email}</a>
            <a href={profile.socials[0].href} target="_blank" rel="noreferrer"><span>LinkedIn</span>in/alexanderchen-</a>
          </nav>
        </footer>
      </div>
    </section>
  );
}

function CollaboratorCard({ collaborator, index, navigate, duplicate = false }) {
  const content = <>
    <div className="home-collaborator-mark">
      <img src={assetHref(collaborator.logo)} alt={`${collaborator.name} logo`} loading="lazy" decoding="async" fetchPriority="low" />
    </div>
    <div className="home-collaborator-meta">
      <span>{String(index + 1).padStart(2, "0")}</span>
      <h3>{collaborator.name}</h3>
    </div>
  </>;

  const style = {
    "--logo-scale": collaborator.scale ?? 1,
    "--logo-bg": collaborator.background || "#ffffff",
    "--logo-fg": collaborator.foreground || "#171713",
  };
  if (!collaborator.projectSlug) return <article className="home-collaborator" role={duplicate ? "presentation" : "listitem"} aria-hidden={duplicate || undefined} style={style}>{content}</article>;

  const projectRoute = `project/${collaborator.projectSlug}`;
  return (
    <article className="home-collaborator-item" role={duplicate ? "presentation" : "listitem"} aria-hidden={duplicate || undefined}>
      <a
        className="home-collaborator home-collaborator-linked"
        href={routeHref(projectRoute)}
        onClick={(event) => navigate(event, "/", projectRoute)}
        style={style}
        aria-label={`View ${collaborator.name} portfolio project`}
        tabIndex={duplicate ? -1 : undefined}
      >
        {content}
      </a>
    </article>
  );
}

function HomeHero() {
  const [motionPaused, setMotionPaused] = useState(false);
  const [cameraAimed, setCameraAimed] = useState(false);
  const [cameraHovered, setCameraHovered] = useState(false);
  const [cameraFlash, setCameraFlash] = useState(0);
  const [givenName, ...surname] = profile.name.split(" ");
  const isCameraAimed = cameraAimed || (!motionPaused && cameraHovered);

  const triggerCameraFlash = () => {
    if (motionPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setCameraFlash((value) => value + 1);
  };

  const enterCameraPose = (event) => {
    if (motionPaused || event.pointerType === "touch") return;
    setCameraHovered(true);
    triggerCameraFlash();
  };

  const toggleCameraPose = () => {
    const nextCameraAimed = !cameraAimed;
    setCameraAimed(nextCameraAimed);
    if (nextCameraAimed || cameraHovered) triggerCameraFlash();
  };

  const toggleMotion = () => {
    setMotionPaused((value) => !value);
    setCameraHovered(false);
    setCameraFlash(0);
  };

  const updateParallax = (event) => {
    if (motionPaused || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3);
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3);
    event.currentTarget.style.setProperty("--hero-pointer-x", x);
    event.currentTarget.style.setProperty("--hero-pointer-y", y);
  };

  const resetParallax = (event) => {
    event.currentTarget.style.setProperty("--hero-pointer-x", 0);
    event.currentTarget.style.setProperty("--hero-pointer-y", 0);
  };

  return (
    <section
      className={`home-hero${motionPaused ? " is-paused" : ""}`}
      aria-labelledby="home-hero-title"
      onPointerMove={updateParallax}
      onPointerLeave={resetParallax}
    >
      <div className="home-hero-grid" aria-hidden="true" />
      <div className="home-hero-glow home-hero-glow-purple" aria-hidden="true" />
      <div className="home-hero-glow home-hero-glow-blue" aria-hidden="true" />

      <div className="home-hero-copy">
        <p className="home-hero-eyebrow">{profile.hero.eyebrow}</p>
        <h1 id="home-hero-title">
          <span>{givenName}</span>{" "}
          <span className="home-hero-surname">{surname.join(" ")}</span>
        </h1>
        <div className="home-hero-actions">
          <a href={routeHref("work")}>See the work <span aria-hidden="true">↓</span></a>
          <a href={assetHref("/resume.pdf")} target="_blank" rel="noreferrer">Open résumé <Arrow /></a>
        </div>
      </div>

      <div className="home-hero-portrait-stage">
        <div className="home-hero-orbit-ring" aria-hidden="true" />
        <button
          className="home-hero-motion-toggle"
          type="button"
          aria-pressed={motionPaused}
          onClick={toggleMotion}
        >
          <span aria-hidden="true">{motionPaused ? "▶" : "Ⅱ"}</span>
          {motionPaused ? "Play motion" : "Pause motion"}
        </button>
        <button
          className="home-hero-avatar"
          type="button"
          aria-label="Take a photo with Alex"
          aria-pressed={cameraAimed}
          data-camera-aimed={isCameraAimed}
          onPointerEnter={enterCameraPose}
          onPointerLeave={() => setCameraHovered(false)}
          onClick={toggleCameraPose}
        >
          <span className="home-hero-avatar-art" aria-hidden="true">
            <img
              className="home-hero-avatar-idle"
              src={assetHref("/projects/about/alexander-chen-hero-bust-idle.webp")}
              alt=""
              fetchPriority="high"
              decoding="async"
            />
            <img
              className="home-hero-avatar-camera"
              src={assetHref("/projects/about/alexander-chen-hero-bust-aim.webp")}
              alt=""
              decoding="async"
            />
            {/* Reuse the idle head in both poses so the hair never shifts with the camera. */}
            <img
              className="home-hero-avatar-shared-head"
              src={assetHref("/projects/about/alexander-chen-hero-bust-idle.webp")}
              alt=""
              decoding="async"
            />
            <img
              className="home-hero-avatar-camera-foreground"
              src={assetHref("/projects/about/alexander-chen-hero-bust-aim.webp")}
              alt=""
              decoding="async"
            />
            <img
              className="home-hero-avatar-camera-eye"
              src={assetHref("/projects/about/alexander-chen-hero-bust-aim.webp")}
              alt=""
              decoding="async"
            />
            <img
              className="home-hero-avatar-blink"
              src={assetHref("/projects/about/alexander-chen-hero-bust-blink.webp")}
              alt=""
              decoding="async"
            />
            {cameraFlash > 0 && <span className="home-hero-camera-flash" key={cameraFlash} />}
          </span>
        </button>
        <div className="home-hero-orbit" aria-label="Creative disciplines">
          <span>Product systems</span>
          <span>Social strategy</span>
          <span>Visual stories</span>
          <span>UX + content</span>
        </div>
      </div>

      <div className="home-hero-details">
        <div className="home-hero-focus">
          <p className="home-hero-detail-label">Focus</p>
          <p className="home-hero-summary">{profile.hero.summary}</p>
        </div>
        <dl className="home-hero-current">
          <div>
            <dt className="home-hero-detail-label">Based in</dt>
            <dd>{profile.location}, Canada</dd>
          </div>
          <div>
            <dt className="home-hero-detail-label">Now building</dt>
            <dd className="home-hero-live-project">
              <span className="home-hero-live-dot" aria-hidden="true" />
              <a href={routeHref("project/utopia-vinyl")}>Utopia Vinyl <Arrow /></a>
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

function CollaboratorCarousel({ navigate }) {
  const railRef = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const resumeAt = useRef(0);
  const pauseAutoplay = () => { resumeAt.current = performance.now() + 4000; };
  useEffect(() => {
    const rail = railRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame, previous = 0, position = rail.scrollLeft, direction = 1, held = false, hovered = false;
    const pause = () => { resumeAt.current = performance.now() + 4000; };
    const down = () => { held = true; pause(); };
    const up = () => { held = false; pause(); };
    const enter = (event) => { if (event.pointerType === "mouse") hovered = true; };
    const leave = () => { hovered = false; pause(); };
    const tick = (now) => {
      const elapsed = previous ? Math.min(now - previous, 50) : 0;
      previous = now;
      if (motion.matches || document.hidden || held || hovered || now < resumeAt.current) {
        position = rail.scrollLeft;
      } else {
        const maximum = rail.scrollWidth - rail.clientWidth;
        position = Math.max(0, Math.min(maximum, position + direction * elapsed * 0.032));
        rail.scrollLeft = position;
        if (position >= maximum) direction = -1;
        else if (position <= 0) direction = 1;
      }
      frame = requestAnimationFrame(tick);
    };
    rail.addEventListener("pointerdown", down);
    rail.addEventListener("pointerenter", enter);
    rail.addEventListener("pointerleave", leave);
    rail.addEventListener("wheel", pause, { passive: true });
    rail.addEventListener("focusin", pause);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      rail.removeEventListener("pointerdown", down);
      rail.removeEventListener("pointerenter", enter);
      rail.removeEventListener("pointerleave", leave);
      rail.removeEventListener("wheel", pause);
      rail.removeEventListener("focusin", pause);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, []);
  useEffect(() => {
    const rail = railRef.current;
    const update = () => {
      const start = rail.scrollLeft < 2;
      const end = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 2;
      setEdges((current) => current.start === start && current.end === end ? current : { start, end });
    };
    update();
    rail.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(rail);
    return () => { rail.removeEventListener("scroll", update); observer.disconnect(); };
  }, []);
  const move = (direction) => {
    pauseAutoplay();
    const rail = railRef.current;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };
  return (
    <>
      <div ref={railRef} id="collaborator-carousel" className="home-collaborator-marquee" role="region" aria-label="Organizations Alexander Chen has worked with" tabIndex={0} onKeyDown={(event) => {
        if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
      }}>
        <div className="home-collaborator-track" role="list">
          {profile.collaborators.map((collaborator, index) => <CollaboratorCard collaborator={collaborator} index={index} navigate={navigate} key={collaborator.name} />)}
        </div>
      </div>
      <div className="collaborator-scroll-controls">
        <span>Explore collaborators</span>
        <div>
          <button type="button" aria-label="Scroll collaborators left" aria-controls="collaborator-carousel" disabled={edges.start} onClick={() => move(-1)}>←</button>
          <button type="button" aria-label="Scroll collaborators right" aria-controls="collaborator-carousel" disabled={edges.end} onClick={() => move(1)}>→</button>
        </div>
      </div>
    </>
  );
}

function HomePage({ clock, navigate }) {
  return (
    <main className="main-content home-main">
      <HomeHero />

      <section className="home-collaborators" aria-labelledby="home-collaborators-title">
        <div className="home-collaborators-heading">
          <p>Who I’ve worked with</p>
          <div>
            <h2 id="home-collaborators-title">Trusted across retail, talent, technology, and culture.</h2>
            <p>A selection of organizations I’ve collaborated with across in-house, studio, event, and campaign work.</p>
          </div>
        </div>
        <CollaboratorCarousel navigate={navigate} />
      </section>

      <section id="work" className="portfolio-section home-work-section">
        <div className="home-work-heading reveal">
          <p className="section-label">projects</p>
          <p>Selected independent, client, and creative projects across digital products, brand systems, and visual storytelling.</p>
        </div>
        <ProjectColumns projects={workProjects} />
      </section>
      <HomeExperience navigate={navigate} />
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
    <>
      <img
        className={item.hoverImage ? "plaything-image-default" : undefined}
        src={assetHref(item.image)}
        alt={item.alt || ""}
        loading="lazy"
        draggable="false"
      />
      {item.hoverImage && (
        <img
          className="plaything-image-hover"
          src={assetHref(item.hoverImage)}
          alt=""
          loading="lazy"
          draggable="false"
        />
      )}
    </>
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
        <a href={routeHref("ao-studio")} onClick={(event) => navigate(event, "/ao-studio")}><span>04.</span> ao studio</a>
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
        style={{ "--playground-background": `url(${assetHref("/projects/playground/playground-background-moving.webp")})` }}
      >
        <h1 className="playground-title" id="playground-title">Playground</h1>
        <p className="playground-kicker">personal archive · ongoing</p>
        <p className="playground-note">A space for things made from curiosity.</p>
        {playgroundItems.map((item, index) => <PlaygroundItem index={index} item={item} key={item.id} />)}
      </section>
    </main>
  );
}

const photographyAlbum = {
  id: "icff-lavazza-inclucity",
  title: "ICFF Lavazza IncluCity Festival",
  eyebrow: "Opening night · portraits, candids, atmosphere",
  meta: "22 photographs · Distillery District, Toronto",
  ask: "Create a complete opening-night story that celebrated the festival's guests while also documenting the energy, setting, and unscripted moments around them.",
  creativity: "I worked like a friendly paparazzo, moving between polished portraits and spontaneous interactions, then using the Distillery District's architecture and evening light to give the collection rhythm, warmth, and a clear sense of place.",
  photoBase: "/projects/work/icff",
  previewPhotos: ["dsc01934.jpg", "dsc02010.jpg", "dsc01693.jpg"],
  photos: [
    "dsc01934.jpg", "dsc01827.jpg", "dsc01824.jpg", "dsc01819.jpg", "dsc01796.jpg", "dsc01782.jpg", "dsc01741.jpg", "dsc01723.jpg",
    "dsc02115.jpg", "dsc02101.jpg", "dsc02020.jpg", "dsc02010.jpg", "dsc01870.jpg", "dsc01802.jpg", "dsc01783.jpg",
    "dsc01716.jpg", "dsc01693.jpg", "dsc01668.jpg", "dsc01639.jpg", "dsc01475.jpg", "dsc01263.jpg", "dsc01233.jpg",
  ],
};
const photographySessions = [
  photographyAlbum,
  {
    id: "icff-isabella-rossellini",
    title: "A Night with Isabella Rossellini",
    eyebrow: "ICFF Lavazza · celebrity portraits",
    meta: "15 photographs · July 26, 2024 · The Hearn, Toronto",
    ask: "Create celebrity portrait coverage around Isabella Rossellini while preserving the atmosphere, production, and guest experience of ICFF Lavazza's closing-gala evening.",
    creativity: "I treated the session as more than a portrait assignment. The edit moves from the venue's cinematic architecture and luminous arrival sequence to the live performance, portrait-production details, and the guests inhabiting the space, building a complete visual story around the featured celebrity.",
    photoBase: "/projects/playground/photography/isabella-rossellini",
    previewPhotos: ["dsc02312.jpg", "dsc7395.jpg", "dsc02345.jpg"],
    photos: [
      "dsc02312.jpg", "dsc7395.jpg", "dsc7427.jpg", "dsc7396.jpg", "dsc7391.jpg",
      "dsc7390.jpg", "dsc7399.jpg", "dsc02320.jpg", "dsc7428.jpg", "dsc7423.jpg",
      "dsc02345.jpg", "dsc02348.jpg", "dsc02359.jpg", "dsc7401.jpg", "dsc7389.jpg",
    ],
  },
  {
    id: "icff-susan-sarandon",
    title: "A Night with Susan Sarandon",
    eyebrow: "ICFF Lavazza · celebrity photography",
    meta: "Photographs coming soon · Toronto",
    ask: "Document ICFF Lavazza's evening with Susan Sarandon, balancing the defining guest moments with the atmosphere and audience experience surrounding the event.",
    creativity: "The visual direction moves between composed portraiture and candid editorial moments, creating a warm, cinematic record of the conversation and the evening around it.",
    coverTone: "susan",
    previewPhotos: [],
    photos: [],
  },
  {
    id: "icff-giancarlo-esposito",
    title: "Giancarlo Esposito",
    eyebrow: "ICFF Lavazza · On the Couch With…",
    meta: "2 photographs · November 29, 2024 · Toronto",
    ask: "Document ICFF's “On the Couch With…” conversation and the black-tie celebration surrounding Giancarlo Esposito.",
    creativity: "The approach balances the intimacy of the live conversation with the energy of the after-party, maintaining a consistent editorial story as the light, pace, and mood change throughout the evening.",
    coverTone: "giancarlo",
    photoBase: "/projects/playground/photography/giancarlo-esposito",
    previewPhotos: ["giancarlo-esposito-portrait-session.jpg"],
    photos: ["giancarlo-esposito-portrait-session.jpg", "alexander-with-giancarlo-esposito.jpg"],
  },
];

const photographyPhotoHref = (album, photo) => assetHref(`${album.photoBase || "/projects/work/icff"}/${photo}`);

function PhotographyLightbox({ album, index, onChange, onClose }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onChange((index - 1 + album.photos.length) % album.photos.length);
      if (event.key === "ArrowRight") onChange((index + 1) % album.photos.length);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [album.photos.length, index, onChange, onClose]);

  return (
    <div className="photography-lightbox" role="dialog" aria-modal="true" aria-label={`${album.title} photograph ${index + 1}`}>
      <button className="photography-lightbox-close" type="button" onClick={onClose} aria-label="Close photograph">×</button>
      <button className="photography-lightbox-prev" type="button" onClick={() => onChange((index - 1 + album.photos.length) % album.photos.length)} aria-label="Previous photograph">←</button>
      <figure>
        <img src={photographyPhotoHref(album, album.photos[index])} alt={`${album.title} photograph ${String(index + 1).padStart(2, "0")}`} />
        <figcaption>{String(index + 1).padStart(2, "0")} / {String(album.photos.length).padStart(2, "0")}</figcaption>
      </figure>
      <button className="photography-lightbox-next" type="button" onClick={() => onChange((index + 1) % album.photos.length)} aria-label="Next photograph">→</button>
    </div>
  );
}

function PhotographySessionCard({ album, index, navigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const previewPhotos = album.previewPhotos || album.photos;
  const hasPreviewPhotos = previewPhotos.length > 0;

  useEffect(() => {
    if (paused || !hasPreviewPhotos) return undefined;
    const timer = window.setInterval(() => setActiveIndex((current) => (current + 1) % previewPhotos.length), 4200);
    return () => window.clearInterval(timer);
  }, [hasPreviewPhotos, paused, previewPhotos.length]);

  return (
    <a
      className="photography-session-card"
      href={routeHref(`playground/photography/${album.id}`)}
      onClick={(event) => navigate(event, "/", `playground/photography/${album.id}`)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-label={`Open ${album.title} album`}
    >
      <div className="photography-session-image">
        {hasPreviewPhotos ? (
          <>
            <img key={previewPhotos[activeIndex]} src={photographyPhotoHref(album, previewPhotos[activeIndex])} alt="" />
            <span className="photography-session-count">{String(activeIndex + 1).padStart(2, "0")} / {String(previewPhotos.length).padStart(2, "0")}</span>
          </>
        ) : (
          <div className={`photography-session-placeholder photography-session-placeholder-${album.coverTone || "default"}`} aria-hidden="true">
            <span>ICFF Lavazza</span>
            <strong>{album.title}</strong>
            <small>Album in progress</small>
          </div>
        )}
      </div>
      <div className="photography-session-copy">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <div>
          <p>{album.eyebrow}</p>
          <h3>{album.title}</h3>
          <small>{album.meta}</small>
        </div>
        <i aria-hidden="true">↗</i>
      </div>
    </a>
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
            <span>2020 to present</span>
            <span>Toronto + elsewhere</span>
          </div>
        </div>
        <div className="photography-camera-stage reveal">
          <span>sony α7r iii</span>
          <img src={assetHref("/projects/playground/stickers/a7riii-sticker.png")} alt="Sony A7R III camera sticker" />
        </div>
      </section>
      <section className="photography-archive-intro" aria-labelledby="photography-archive-title">
        <p>photoshoot sessions</p>
        <div>
          <h2 id="photography-archive-title">A growing archive of sessions.</h2>
          <p>Select a photoshoot to see its complete edit, creative brief, and the thinking behind the work.</p>
        </div>
      </section>
      <section className="photography-session-grid" aria-label="Photography sessions">
        {photographySessions.map((album, index) => <PhotographySessionCard album={album} index={index} navigate={navigate} key={album.id} />)}
      </section>
    </main>
  );
}

function PhotographyAlbumPage({ album, clock, navigate }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [albumOpen, setAlbumOpen] = useState(false);
  const hasPhotos = album.photos.length > 0;
  const showPreviousSlide = () => {
    if (hasPhotos) setSlideshowIndex((current) => (current - 1 + album.photos.length) % album.photos.length);
  };
  const showNextSlide = () => {
    if (hasPhotos) setSlideshowIndex((current) => (current + 1) % album.photos.length);
  };

  return (
    <main className="playground-page photography-page photography-album-page">
      <PlaygroundNavigation clock={clock} navigate={navigate} />
      <header className="photography-album-page-header">
        <a href={routeHref("playground/photography")} onClick={(event) => navigate(event, "/", "playground/photography")}><span aria-hidden="true">←</span> My Art</a>
        <p>{album.eyebrow}</p>
        <h1>{album.title}</h1>
        <div><span>{album.meta}</span><span>{hasPhotos ? "Slideshow" : "Album in progress"}</span></div>
      </header>
      {hasPhotos ? (
        <section className="photography-album-slideshow" aria-label={`${album.title} slideshow`}>
          <button className="photography-slideshow-image" type="button" onClick={showNextSlide} aria-label={`Show next photograph. Currently showing photograph ${slideshowIndex + 1} of ${album.photos.length}`}>
            <img key={album.photos[slideshowIndex]} src={photographyPhotoHref(album, album.photos[slideshowIndex])} alt={`${album.title} photograph ${String(slideshowIndex + 1).padStart(2, "0")}`} />
          </button>
          <div className="photography-slideshow-controls">
            <span>{String(slideshowIndex + 1).padStart(2, "0")} / {String(album.photos.length).padStart(2, "0")}</span>
            <div>
              <button type="button" onClick={showPreviousSlide} aria-label="Previous photograph">←</button>
              <button type="button" onClick={showNextSlide} aria-label="Next photograph">→</button>
            </div>
          </div>
          <button className="photography-open-album" type="button" onClick={() => setAlbumOpen((open) => !open)} aria-expanded={albumOpen} aria-controls="photography-complete-album">
            <span>{albumOpen ? "Close the album" : "Open the album"}</span><i aria-hidden="true">{albumOpen ? "−" : "+"}</i>
          </button>
        </section>
      ) : (
        <section className={`photography-empty-album photography-empty-album-${album.coverTone || "default"}`} aria-label={`${album.title} album status`}>
          <p>Selected photographs will appear here.</p>
          <h2>Album in progress.</h2>
          <span>This session is now part of the archive. Its complete edit will be added once the photographs are supplied.</span>
        </section>
      )}
      {hasPhotos && albumOpen && (
        <section className="photography-full-album" id="photography-complete-album" aria-label={`${album.title} complete photo album`}>
          {album.photos.map((photo, index) => (
            <figure key={photo}>
              <button type="button" onClick={() => setLightboxIndex(index)} aria-label={`Open photograph ${index + 1} in full-screen viewer`}>
                <img src={photographyPhotoHref(album, photo)} alt={`${album.title} photograph ${String(index + 1).padStart(2, "0")}`} loading={index < 4 ? "eager" : "lazy"} />
              </button>
              <figcaption>{String(index + 1).padStart(2, "0")}</figcaption>
            </figure>
          ))}
        </section>
      )}
      <section className="photography-album-page-brief">
        <div><span>the ask</span><p>{album.ask}</p></div>
        <div><span>creative approach</span><p>{album.creativity}</p></div>
      </section>
      {lightboxIndex !== null && <PhotographyLightbox album={album} index={lightboxIndex} onChange={setLightboxIndex} onClose={() => setLightboxIndex(null)} />}
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

function FAAdventurePage({ clock, navigate }) {
  const flightStats = [
    { value: "16", label: "flights" },
    { value: "28.3k", label: "kilometres" },
    { value: "9", label: "airports" },
    { value: "2", label: "countries" },
  ];
  const destinations = ["Vancouver", "Montreal", "Edmonton", "Calgary", "Halifax", "Tampa", "MCO · Orlando", "Ottawa", "Winnipeg"];
  const flightMemories = [
    {
      title: "Class 15",
      eyebrow: "the beginning",
      summary: "Completing initial training with Class 15 turned unfamiliar routines into a shared milestone.",
      strengths: "Training · Teamwork · Safety",
      enjoyed: "I enjoyed learning beside a group that quickly became a support system and celebrating each step together.",
      learned: "Clear communication, preparation, and teamwork build the confidence needed before entering the cabin.",
      image: "/projects/playground/fa-adventure/class-15.jpg",
      alt: "Porter Airlines Class 15 flight attendant training group",
    },
    {
      title: "My first flight",
      eyebrow: "first departure",
      summary: "My first operating flight was the moment classroom training became real passenger service.",
      strengths: "Passenger service · Adaptability · Crew coordination",
      enjoyed: "I loved the energy of putting everything into practice with an encouraging crew beside me.",
      learned: "Stay present, adapt quickly, and trust the procedures and people around you.",
      image: "/projects/playground/fa-adventure/first-flight.jpg",
      alt: "Alexander with fellow Porter crew members before his first flight",
    },
    {
      title: "Pre-flight grooming",
      eyebrow: "before report time",
      summary: "The pre-flight routine helped me arrive polished, prepared, and ready to represent the airline.",
      strengths: "Professional standards · Readiness · Attention to detail",
      enjoyed: "I enjoyed the quiet ritual of getting ready because it created focus before a busy day.",
      learned: "Professional presentation is part of operational readiness and helps set the tone for the passenger experience.",
      image: "/projects/playground/fa-adventure/pre-flight-grooming.jpg",
      alt: "Alexander checking his Porter flight attendant uniform before a flight",
    },
    {
      title: "Flight organization",
      eyebrow: "galley preparation",
      summary: "A well-organized galley made service smoother and gave the crew more time to focus on passengers.",
      strengths: "Galley setup · Workflow planning · Organization",
      enjoyed: "I enjoyed turning a compact workspace into a clear, efficient setup.",
      learned: "Strong service begins before takeoff by anticipating needs and arranging every step in sequence.",
      image: "/projects/playground/fa-adventure/flight-organization.jpg",
      alt: "Organized drinks and snacks in a Porter aircraft galley",
    },
    {
      title: "Before serving food",
      eyebrow: "cabin service",
      summary: "Cabin service brought together timing, hospitality, and careful attention to safety.",
      strengths: "Cabin service · Hospitality · Time management",
      enjoyed: "I enjoyed the rhythm of working with the crew and creating a warm moment for passengers in the air.",
      learned: "How to balance friendly service with efficiency, awareness, and consistent procedures.",
      image: "/projects/playground/fa-adventure/before-serving-food.jpg",
      alt: "Alexander ready to begin food service aboard a Porter flight",
    },
    {
      title: "First time at MCO",
      eyebrow: "Orlando · Florida",
      summary: "My first arrival at MCO made the scale and variety of the route network feel tangible.",
      strengths: "Airport navigation · Adaptability · Crew travel",
      enjoyed: "I loved sharing the excitement of a new airport with the crew and experiencing Orlando for the first time.",
      learned: "Every airport has its own flow, so observation and adaptability matter from arrival to departure.",
      image: "/projects/playground/fa-adventure/first-time-in-mco.jpg",
      alt: "Porter crew walking through Orlando International Airport with their luggage",
    },
    {
      title: "On the ground at MCO",
      eyebrow: "Orlando · Florida",
      summary: "Seeing the aircraft during turnaround gave me a wider view of everything required between flights.",
      strengths: "Turnaround awareness · Ground operations · Team coordination",
      enjoyed: "I enjoyed the rare chance to slow down and appreciate the aircraft and the teams working around it.",
      learned: "Reliable departures depend on many people completing precise tasks in a short window.",
      image: "/projects/playground/fa-adventure/mco.jpg",
      alt: "Porter aircraft parked at Orlando International Airport beneath a cloudy sky",
    },
    {
      title: "In the pit",
      eyebrow: "behind the scenes",
      summary: "A closer look inside the flight deck connected the passenger-facing cabin experience with the systems guiding the aircraft.",
      strengths: "Cross-functional awareness · Safety culture · Communication",
      enjoyed: "I enjoyed seeing the cockpit up close and learning more about the environment my flight-deck colleagues work in.",
      learned: "Safe operations are built on precision, checklists, and clear coordination between cabin and flight deck.",
      video: "/projects/playground/fa-adventure/in-the-pit.m4v",
    },
  ];

  const scrollToFlightLog = () => {
    document.getElementById("fa-flight-log")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="playground-page fa-adventure-page">
      <PlaygroundNavigation clock={clock} navigate={navigate} />
      <section
        className="fa-hero"
        aria-labelledby="fa-adventure-title"
        style={{ "--fa-background": `url(${assetHref("/projects/playground/playground-background-moving.webp")})` }}
      >
        <div className="fa-hero-copy reveal reveal-fast">
          <a className="fa-back" href={routeHref("playground")} onClick={(event) => navigate(event, "/playground")}>
            <span aria-hidden="true">←</span> playground
          </a>
          <p className="fa-eyebrow">personal archive · flight attendant</p>
          <h1 id="fa-adventure-title">my FA<br />adventure</h1>
          <p className="fa-lede">A growing record of the places, views, and in-between moments I have collected while working in the sky.</p>
          <button className="fa-scroll-link" type="button" onClick={scrollToFlightLog}>Explore the flight log <span aria-hidden="true">↓</span></button>
        </div>
        <div className="fa-hero-plane reveal">
          <span>Porter Airlines</span>
          <img src={assetHref("/projects/playground/stickers/porter-airlines-sticker.png")} alt="Porter Airlines airplane sticker" />
        </div>
      </section>

      <section className="fa-map" id="fa-flight-log" aria-labelledby="fa-map-title">
        <header className="fa-section-heading fa-map-heading reveal">
          <p>routes</p>
          <div>
            <h2 id="fa-map-title">Where the adventure has taken me.</h2>
            <p>My current route map connects nine airports across Canada and the United States.</p>
          </div>
        </header>
        <figure className="fa-route-map reveal">
          <img src={assetHref("/projects/playground/fa-adventure/flight-routes.jpg")} alt="Map of 16 flight routes connecting 9 airports across Canada and the United States" />
          <figcaption>Flight history recorded with My Flight Routes.</figcaption>
        </figure>
      </section>

      <section className="fa-stats" aria-labelledby="fa-stats-title">
        <header className="fa-section-heading reveal">
          <p>flight log · so far</p>
          <div>
            <h2 id="fa-stats-title">The journey in numbers.</h2>
            <p>Every route adds another place, crew memory, and view from above to the archive.</p>
          </div>
        </header>
        <dl className="fa-stat-grid reveal">
          {flightStats.map((stat) => <div key={stat.label}><dt>{stat.label}</dt><dd>{stat.value}</dd></div>)}
        </dl>
      </section>

      <section className="fa-journal" aria-labelledby="fa-journal-title">
        <header className="fa-section-heading reveal">
          <p>travel journal</p>
          <div>
            <h2 id="fa-journal-title">Beyond the route line.</h2>
            <p>Each city carries its own crew stories, airport rituals, and moments found between flights.</p>
          </div>
        </header>
        <ul className="fa-destination-list reveal" aria-label="Destinations visited as a flight attendant">
          {destinations.map((destination) => <li key={destination}>{destination}</li>)}
        </ul>
        <div className="fa-memory-list">
          {flightMemories.map((memory, index) => (
            <article className="fa-memory reveal" key={memory.title}>
              <div className="fa-memory-media">
                {memory.video ? (
                  <video src={assetHref(memory.video)} controls muted loop playsInline preload="metadata" aria-label={memory.title} />
                ) : (
                  <img src={assetHref(memory.image)} alt={memory.alt} loading="eager" decoding="sync" />
                )}
              </div>
              <div className="fa-memory-copy">
                <span>{String(index + 1).padStart(2, "0")} · {memory.eyebrow}</span>
                <h3>{memory.title}</h3>
                <p className="fa-memory-summary">{memory.summary}</p>
                <p className="fa-memory-strengths">{memory.strengths}</p>
                <dl className="fa-memory-details">
                  <div>
                    <dt>What I enjoyed</dt>
                    <dd>{memory.enjoyed}</dd>
                  </div>
                  <div>
                    <dt>What I learned</dt>
                    <dd>{memory.learned}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>
      <MobileFooter clock={clock} />
    </main>
  );
}

function StructuredMediaItem({ item, title, index, presentation }) {
  const isInstagramPhone = presentation === "instagram-phone" && item.type === "video";
  return (
    <figure className={`structured-media-item structured-media-${item.type}${isInstagramPhone ? " structured-media-instagram-phone" : ""}`} style={{ "--media-aspect": item.aspect || "4 / 3" }}>
      <div className="structured-media-frame">
        {isInstagramPhone ? (
          <div className="instagram-phone">
            <div className="instagram-phone-notch" aria-hidden="true" />
            <div className="instagram-phone-screen">
              <div className="instagram-phone-status" aria-hidden="true"><span>9:41</span><span>● ▰</span></div>
              <div className="instagram-phone-topbar" aria-hidden="true"><span>Instagram</span><span>♡ &nbsp;↗</span></div>
              <div className="instagram-phone-account" aria-hidden="true"><span className="instagram-phone-avatar">T&amp;T</span><strong>{item.account || "tt_supermarket"}</strong><span>•••</span></div>
              <video
                controls
                playsInline
                preload={item.poster ? "none" : "metadata"}
                poster={item.poster ? assetHref(item.poster) : undefined}
                aria-label={item.caption || `${title} video ${index + 1}`}
              >
                <source src={assetHref(item.src)} type="video/mp4" />
                Your browser does not support embedded video.
              </video>
              <div className="instagram-phone-actions" aria-hidden="true"><span>♡ &nbsp;○ &nbsp;↗</span><span>▢</span></div>
              <div className="instagram-phone-caption" aria-hidden="true"><strong>{item.account || "tt_supermarket"}</strong><span>{item.postExcerpt || item.caption}</span></div>
              <div className="instagram-phone-bottom" aria-hidden="true">⌂ &nbsp;⌕ &nbsp;⊞ &nbsp;♡ &nbsp;◉</div>
            </div>
          </div>
        ) : item.type === "youtube" ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${item.videoId}`}
            title={item.title || title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : item.type === "video" ? (
          <video
            controls
            playsInline
            preload={item.poster ? "none" : "metadata"}
            poster={item.poster ? assetHref(item.poster) : undefined}
            aria-label={item.caption || `${title} video ${index + 1}`}
          >
            <source src={assetHref(item.src)} type="video/mp4" />
            Your browser does not support embedded video.
          </video>
        ) : item.type === "image" ? (
          <ZoomableImage src={item.src} alt={item.alt || ""} />
        ) : (
          <div className="structured-media-placeholder" aria-label={`${item.label} placeholder`}>
            <span>Media placeholder</span>
            <strong>{item.label}</strong>
            <small>Replace with your photo or video</small>
          </div>
        )}
      </div>
      {item.caption && (isInstagramPhone && item.postUrl ? (
        <figcaption className="instagram-post-credit">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div>
            <strong>{item.caption}</strong>
            {item.publicMetrics && <small className="instagram-post-metrics">{item.publicMetrics.likes} likes{item.publicMetrics.comments ? ` · ${item.publicMetrics.comments} comments` : ""}</small>}
            <a href={item.postUrl} target="_blank" rel="noopener noreferrer">Read the original caption on Instagram ↗</a>
          </div>
        </figcaption>
      ) : (
        <figcaption><span>{String(index + 1).padStart(2, "0")}</span>{item.caption}</figcaption>
      ))}
    </figure>
  );
}

function OverviewProjectCard({ project, chapter, entry, projectIndex }) {
  const fallbackCover = [...(entry.items || []), ...(entry.storyboardItems || []), ...(entry.finalOutputItems || [])].find((item) => item.type === "image" || item.poster);
  const cover = entry.cover ? { src: entry.cover, alt: entry.coverAlt || `${entry.title} project cover` } : fallbackCover;
  return (
    <a className="overview-project-card reveal" href={routeHref(projectDetailRoute(project, chapter, projectIndex))}>
      <div className="overview-project-cover">
        {cover ? <img src={assetHref(cover.poster || cover.src)} alt={cover.alt || ""} loading="lazy" style={entry.coverFit || entry.coverBackground ? { objectFit: entry.coverFit, background: entry.coverBackground } : undefined} /> : <div className="overview-project-cover-placeholder"><span>{chapter.number} / {entry.number || String(projectIndex + 1).padStart(2, "0")}</span><strong>{entry.title}</strong></div>}
        <span className="overview-project-open" aria-hidden="true">↗</span>
      </div>
      <div className="overview-project-copy">
        <p>{entry.eyebrow}</p>
        <h3>{entry.title}</h3>
        <span>{entry.description}</span>
        <small>View project <span aria-hidden="true">→</span></small>
      </div>
    </a>
  );
}

function StructuredCaseStudyPage({ clock, navigate, project }) {
  const [openGlossaryId, setOpenGlossaryId] = useState(null);
  const openGlossaryChapter = project.chapters.find((chapter) => chapter.id === openGlossaryId);
  const projectCount = project.chapters.reduce((count, chapter) => count + chapter.projects.length, 0);
  const progressSections = useMemo(() => structuredProgressSectionsFor(project), [project]);

  return (
    <main className={`main-content case-study-page structured-case-study-page immersive-project-page structured-case-study-${project.slug}`}>
      <article className="case-study structured-case-study">
        <header className="structured-case-study-hero reveal reveal-fast" id="structured-overview">
          <div className="structured-case-study-hero-media" style={{ "--hero-aspect": project.aspect || "16 / 10" }}>
            <ProjectVisual project={project} />
            <span className="structured-hero-index">01 / {String(progressSections.length).padStart(2, "0")}</span>
          </div>
          <div className="structured-case-study-hero-copy">
            <a className="case-study-back" href={routeHref("work")} onClick={(event) => navigate(event, "/", "work")}>
              <span aria-hidden="true">←</span> selected work
            </a>
            <p>{project.coverEyebrow || "Selected case study"}</p>
            <h1>{project.caseStudyTitle || project.organization || project.title}</h1>
            <div className="structured-case-study-lede">{project.description}</div>
            <dl className="structured-case-study-meta" aria-label="Project details">
              <div><dt>Role</dt><dd>{project.role}</dd></div>
              <div><dt>Timeline</dt><dd>{project.period}</dd></div>
              {project.format && <div><dt>Format</dt><dd>{project.format}</dd></div>}
            </dl>
            <a className="project-scroll-cue" href={`#structured-work`} onClick={(event) => { event.preventDefault(); document.getElementById("structured-work")?.scrollIntoView({ behavior: "smooth" }); }}>
              Explore the project <span aria-hidden="true">↓</span>
            </a>
          </div>
        </header>

        {project.thesis && <section className="structured-thesis reveal" id="structured-thesis" aria-labelledby={`${project.slug}-thesis`}>
          <p>{project.thesis.label || "Working principle"}</p>
          <div>
            <h2 id={`${project.slug}-thesis`}>{project.thesis.title}</h2>
            <p>{project.thesis.body}</p>
          </div>
        </section>}

        {project.proofMetrics?.length > 0 ? (
          <section className="structured-proof-strip structured-proof-strip-metrics reveal" id="structured-proof" aria-label="Project proof">
            {project.proofMetrics.map((metric, index) => <article key={`${metric.value}-${metric.label}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{metric.value}</strong><p>{metric.label}</p></article>)}
          </section>
        ) : project.impact?.length > 0 && (
          <section className="structured-proof-strip reveal" aria-label="Project proof">
            {project.impact.slice(0, 3).map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>)}
          </section>
        )}

        {project.archiveStyle ? <section className="structured-archive" id="structured-work" aria-labelledby={`${project.slug}-archive`}>
          <header className="structured-archive-header reveal">
            <p>{project.archiveEyebrow || "Project index"}</p>
            <div>
              <span>{String(projectCount).padStart(2, "0")} projects</span>
              <h2 id={`${project.slug}-archive`}>{project.archiveTitle || "Explore the work."}</h2>
              <p>{project.archiveDescription}</p>
            </div>
          </header>
          {project.chapters.map((chapter) => (
            <section className="structured-chapter overview-chapter structured-archive-group" id={chapter.id} aria-labelledby={`${chapter.id}-title`} key={chapter.id}>
              <header className="structured-chapter-header reveal">
                <p>{chapter.number}</p>
                <div>
                  <span className="structured-chapter-count">{String(chapter.projects.length).padStart(2, "0")} {chapter.projects.length === 1 ? "project" : "projects"}</span>
                  <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
                  <p>{chapter.description}</p>
                </div>
              </header>
              <div className="overview-project-grid">
                {chapter.projects.map((entry, projectIndex) => <OverviewProjectCard project={project} chapter={chapter} entry={entry} projectIndex={projectIndex} key={`${chapter.id}-${projectIndex}`} />)}
              </div>
            </section>
          ))}
        </section> : <>
          <section className="structured-glossary reveal" id="structured-work" aria-labelledby={`${project.slug}-glossary`}>
          <header>
            <p>Project index</p>
            <div><h2 id={`${project.slug}-glossary`}>Explore the work.</h2><p className="structured-glossary-lede">Choose a chapter to preview its projects, then open the full story.</p></div>
          </header>
          <nav className="structured-glossary-grid" aria-label={`${project.title} project sections`}>
            {project.workstreams.map((workstream) => (
              <button
                className="structured-glossary-trigger"
                type="button"
                aria-expanded={openGlossaryId === workstream.id}
                aria-controls={`${workstream.id}-glossary-projects`}
                onClick={() => setOpenGlossaryId((current) => current === workstream.id ? null : workstream.id)}
                key={workstream.id}
              >
                <span>{workstream.number}</span>
                <h3>{workstream.title}</h3>
                <p>{workstream.description}</p>
                <small aria-hidden="true">↓</small>
              </button>
            ))}
            {openGlossaryChapter && <div className="structured-glossary-projects structured-glossary-projects-wide" id={`${openGlossaryChapter.id}-glossary-projects`}>
              {openGlossaryChapter.projects.map((entry, projectIndex) => (
                <a href={routeHref(projectDetailRoute(project, openGlossaryChapter, projectIndex))} key={`${openGlossaryChapter.id}-${entry.number || projectIndex}`}>
                  <span>{entry.number || String(projectIndex + 1).padStart(2, "0")}</span>
                  <div><strong>{entry.title}</strong><p>{entry.description}</p></div>
                  <i aria-hidden="true">↗</i>
                </a>
              ))}
            </div>}
          </nav>
          </section>

          {project.chapters.map((chapter) => (
            <section className="structured-chapter overview-chapter" id={chapter.id} aria-labelledby={`${chapter.id}-title`} key={chapter.id}>
              <header className="structured-chapter-header reveal">
                <p>{chapter.number}</p>
                <div>
                  <h2 id={`${chapter.id}-title`}>{chapter.title}</h2>
                  <p>{chapter.description}</p>
                </div>
              </header>
              <div className="overview-project-grid">
                {chapter.projects.map((entry, projectIndex) => <OverviewProjectCard project={project} chapter={chapter} entry={entry} projectIndex={projectIndex} key={`${chapter.id}-${projectIndex}`} />)}
              </div>
            </section>
          ))}
        </>}
        <nav className="immersive-project-next reveal" aria-label="Continue exploring">
          <span>Continue exploring</span>
          <a href={routeHref("work")} onClick={(event) => navigate(event, "/", "work")}>Return to selected work <span aria-hidden="true">↗</span></a>
        </nav>
      </article>
      <MobileFooter clock={clock} />
    </main>
  );
}

const detailSections = [
  { id: "detail-context", label: "context" },
  { id: "detail-contribution", label: "my contribution" },
  { id: "detail-work", label: "the work" },
  { id: "detail-impact", label: "impact" },
];
const detailSectionsFor = (entry) => detailSections.map((section) =>
  section.id === "detail-contribution" && entry.solution ? { ...section, label: "solution" } : section
).flatMap((section) => section.id === "detail-work" && entry.storyboardItems ? [
  { id: "detail-storyboard", label: "storyboard" },
  { id: "detail-final-output", label: "final output" },
] : section);

function ProjectDetailHeroItem({ item }) {
  return <div className={`project-detail-hero-item${item.fit === "contain" ? " project-detail-hero-item-contain" : ""}`}><ZoomableImage src={item.src} alt={item.alt || ""} loading="eager" /></div>;
}

function ProjectDetailSidebar({ clock, navigate, detail, route }) {
  const sections = detailSectionsFor(detail.entry);
  const [activeSection, setActiveSection] = useState(sections[0].id);

  useEffect(() => {
    setActiveSection(sections[0].id);
    const update = () => {
      const marker = window.innerHeight * 0.35;
      const active = sections.reduce((current, section) => {
        const element = document.getElementById(section.id);
        return element && element.getBoundingClientRect().top <= marker ? section.id : current;
      }, sections[0].id);
      setActiveSection(active);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [route]);

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="sidebar detail-sidebar">
      <div className="detail-sidebar-main">
        <a className="detail-sidebar-back" href={routeHref("work")} onClick={(event) => navigate(event, "/", "work")}>← &nbsp; Back to work</a>
        <div className="detail-sidebar-project"><span>{detail.project.title}</span><a href={routeHref(`project/${detail.project.slug}`)} onClick={(event) => navigate(event, "/", `project/${detail.project.slug}`)}>All projects ↗</a></div>
        <nav className="detail-sidebar-nav" aria-label={`${detail.entry.title} sections`}>
          {sections.map((section) => (
            <a href={routeHref(route)} onClick={(event) => scrollToSection(event, section.id)} className={activeSection === section.id ? "active" : ""} aria-current={activeSection === section.id ? "location" : undefined} key={section.id}>{section.label}</a>
          ))}
        </nav>
      </div>
      <span className="detail-sidebar-clock">{clock}</span>
    </aside>
  );
}

function ToolkitAssetCard({ collection, index, isActive, onToggle, triggerRef }) {
  const panelId = `toolkit-collection-${index}`;
  const previewMode = collection.previewMode || "standard";
  return (
    <article className={`toolkit-asset-card toolkit-asset-card-${previewMode}${isActive ? " is-active" : ""}`}>
      <button
        type="button"
        ref={triggerRef}
        onClick={onToggle}
        aria-expanded={isActive}
        aria-controls={panelId}
        aria-label={`${isActive ? "Close" : "View"} the ${collection.title} collection, ${collection.images.length} assets`}
      >
        <div className={`toolkit-asset-preview toolkit-asset-preview-${previewMode}`} data-format={collection.formatLabel || "asset preview"}>
          <div className="toolkit-asset-preview-media" style={{ "--asset-aspect": collection.previewAspect || "4 / 3" }}>
            <img src={assetHref(collection.images[0])} alt={`${collection.title} representative asset`} />
          </div>
          <span>01 / {String(collection.images.length).padStart(2, "0")}</span>
        </div>
        <div className="toolkit-asset-copy">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <div><h3>{collection.title}</h3><p>{collection.description}</p></div>
          <i aria-hidden="true">{isActive ? "−" : "+"}</i>
        </div>
      </button>
    </article>
  );
}

function ToolkitAssetExplorer({ collections }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const railRef = useRef(null);
  const triggerRefs = useRef([]);
  const activeCollection = activeIndex === null ? null : collections[activeIndex];

  const closeCollection = () => {
    const returnFocusIndex = activeIndex;
    setActiveIndex(null);
    window.requestAnimationFrame(() => triggerRefs.current[returnFocusIndex]?.focus());
  };

  useEffect(() => {
    if (activeIndex === null) return undefined;
    railRef.current?.scrollTo({ left: 0 });
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeCollection();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex]);

  useEffect(() => setActiveIndex(null), [collections]);

  const scrollRail = (direction) => {
    const rail = railRef.current;
    const slide = rail?.querySelector("figure");
    if (!rail || !slide) return;
    const gap = parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: direction * (slide.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  return (
    <div className="toolkit-asset-explorer">
      <div className="toolkit-asset-grid" aria-label="Toolkit asset collections">
        {collections.map((collection, collectionIndex) => (
          <ToolkitAssetCard
            collection={collection}
            index={collectionIndex}
            isActive={activeIndex === collectionIndex}
            onToggle={() => setActiveIndex((current) => current === collectionIndex ? null : collectionIndex)}
            triggerRef={(node) => { triggerRefs.current[collectionIndex] = node; }}
            key={collection.title}
          />
        ))}
      </div>
      {activeCollection && <section
        className={`toolkit-asset-tray toolkit-asset-tray-${activeCollection.previewMode || "standard"}`}
        id={`toolkit-collection-${activeIndex}`}
        role="region"
        aria-roledescription="carousel"
        aria-labelledby={`toolkit-collection-title-${activeIndex}`}
      >
        <header className="toolkit-asset-tray-header">
          <span>Collection {String(activeIndex + 1).padStart(2, "0")}</span>
          <div>
            <h3 id={`toolkit-collection-title-${activeIndex}`}>{activeCollection.title}</h3>
            <p>{activeCollection.images.length} assets · scroll or use the arrows to browse</p>
          </div>
          <div className="toolkit-asset-tray-controls">
            <button type="button" onClick={() => scrollRail(-1)} aria-label={`Previous ${activeCollection.title} asset`}>←</button>
            <button type="button" onClick={() => scrollRail(1)} aria-label={`Next ${activeCollection.title} asset`}>→</button>
            <button type="button" onClick={closeCollection} aria-label={`Close the ${activeCollection.title} collection`}>×</button>
          </div>
        </header>
        <div className="toolkit-asset-rail" ref={railRef} tabIndex="0" aria-label={`${activeCollection.title} assets`}>
          {activeCollection.images.map((image, imageIndex) => <figure
            role="group"
            aria-roledescription="slide"
            aria-label={`${imageIndex + 1} of ${activeCollection.images.length}`}
            key={image}
          >
            <div style={{ "--asset-aspect": activeCollection.previewAspect || "4 / 3" }}><img src={assetHref(image)} alt={`${activeCollection.title} asset ${imageIndex + 1}`} loading="lazy" /></div>
            <figcaption>{String(imageIndex + 1).padStart(2, "0")} / {String(activeCollection.images.length).padStart(2, "0")}</figcaption>
          </figure>)}
        </div>
      </section>}
    </div>
  );
}

function ToolkitPrototypeGallery({ gallery }) {
  const railRef = useRef(null);
  const scrollRail = (direction) => {
    const rail = railRef.current;
    const screen = rail?.querySelector("figure");
    if (!rail || !screen) return;
    const gap = parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: direction * (screen.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  return (
    <section className="toolkit-prototype" aria-labelledby="toolkit-prototype-title">
      <header className="toolkit-prototype-header">
        <span>{gallery.label || "First version"}</span>
        <div>
          <h3 id="toolkit-prototype-title">{gallery.title}</h3>
          <p>{gallery.description}</p>
        </div>
        <div className="toolkit-prototype-controls">
          <button type="button" onClick={() => scrollRail(-1)} aria-label="Previous first-version screen">←</button>
          <button type="button" onClick={() => scrollRail(1)} aria-label="Next first-version screen">→</button>
        </div>
      </header>
      <div className="toolkit-prototype-rail" ref={railRef} tabIndex="0" aria-label="First-version toolkit screens">
        {gallery.items.map((item, itemIndex) => <figure key={item.src}>
          <div><img src={assetHref(item.src)} alt={item.alt || ""} loading="lazy" /></div>
          <figcaption><span>{String(itemIndex + 1).padStart(2, "0")}</span>{item.caption}</figcaption>
        </figure>)}
      </div>
    </section>
  );
}

function ProjectDetailSectionHeading({ label, title }) {
  return <header className="project-detail-section-heading"><p className="project-detail-section-label">{label}</p><h2>{title}</h2></header>;
}

function ProjectDocumentLinks({ entry }) {
  const documents = entry.documents || (entry.documentUrl ? [{ href: entry.documentUrl, label: entry.documentLabel || "Open project document" }] : []);
  if (documents.length === 0) return null;
  return <div className="project-detail-document-links">{documents.map((document) => <a className="project-detail-gallery-link" href={assetHref(document.href)} target="_blank" rel="noreferrer" key={document.href}>{document.label} ↗</a>)}</div>;
}

function ProjectDetailPage({ clock, navigate, detail }) {
  const { project, chapter, entry, index } = detail;
  const galleryRef = useRef(null);
  const sections = detailSectionsFor(entry);
  const projectRoute = `project/${project.slug}`;
  const heroImages = (entry.heroItems || entry.items || []).filter((item) => item.type === "image" && item.hero !== false);
  const entries = project.chapters.flatMap((section) => section.projects.map((item, itemIndex) => ({ chapter: section, entry: item, index: itemIndex })));
  const currentIndex = entries.findIndex((item) => item.chapter.id === chapter.id && item.index === index);
  const next = entries[currentIndex + 1];
  const hasSplitWork = Boolean(entry.storyboardItems?.length);
  const scrollGallery = (direction) => {
    const gallery = galleryRef.current;
    const card = gallery?.querySelector("figure");
    if (!card) return;
    const gap = parseFloat(window.getComputedStyle(gallery).columnGap) || 0;
    gallery.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  return (
    <main className={`main-content project-detail-page structured-case-study-${project.slug}${entry.mediaPresentation === "instagram-phone" ? " project-detail-editorial" : ""}`}>
      <article className={`project-detail${heroImages.length === 0 ? " project-detail-no-hero" : ""}`}>
        <nav className="project-detail-breadcrumb reveal reveal-fast" aria-label="Breadcrumb">
          <a href={routeHref("work")} onClick={(event) => navigate(event, "/", "work")}>work</a>
          <span aria-hidden="true">/</span>
          <a href={routeHref(projectRoute)} onClick={(event) => navigate(event, "/", projectRoute)}>{project.title}</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">{entry.title}</span>
        </nav>
        <nav className="project-detail-mobile-nav" aria-label={`${entry.title} sections`}>{sections.map((section) => <a href={routeHref(projectDetailRoute(project, chapter, index))} onClick={(event) => { event.preventDefault(); document.getElementById(section.id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }} key={section.id}>{section.label}</a>)}</nav>
        {heroImages.length > 0 && (
          <div className={`project-detail-hero project-detail-hero-${heroImages.length} reveal`}>
            {heroImages.map((item) => <ProjectDetailHeroItem item={item} key={item.src} />)}
          </div>
        )}
        <header className="project-detail-intro reveal">
          <p>{entry.eyebrow} <span>·</span> {project.title}</p>
          <h1>{entry.title}</h1>
          <div>{entry.description}</div>
          {entry.meta?.length > 0 && <dl className="project-detail-intro-meta" aria-label={`${entry.title} project details`}>
            {entry.meta.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
          </dl>}
          {entry.profileUrl && <a className="project-detail-profile-button" href={entry.profileUrl} target="_blank" rel="noopener noreferrer">Explore @tt_supermarket on Instagram <span aria-hidden="true">↗</span></a>}
        </header>
        <section className="project-detail-section reveal" id="detail-context">
          <ProjectDetailSectionHeading label={entry.mediaPresentation === "instagram-phone" ? "context" : "01 / context"} title={entry.contextHeading || "The bigger picture."} />
          <div className="project-detail-section-body">
            <p>{entry.context || chapter.description}</p>
            {entry.contextDetails && <div className="project-detail-context-details">
              {entry.contextDetails.map((detail) => <div key={detail.heading}>
                <h3>{detail.heading}</h3>
                {detail.body && <p>{detail.body}</p>}
                {detail.items && <ul>{detail.items.map((item) => <li key={item}>{item}</li>)}</ul>}
              </div>)}
            </div>}
            {entry.contextClosing && <p className="project-detail-context-closing">{entry.contextClosing}</p>}
          </div>
        </section>
        <section className="project-detail-section reveal" id="detail-contribution">
          <ProjectDetailSectionHeading label={entry.mediaPresentation === "instagram-phone" ? (entry.solution ? "solution" : "my contribution") : `02 / ${entry.solution ? "solution" : "my contribution"}`} title={entry.solutionHeading || "What I worked on."} />
          <div className="project-detail-section-body">
            <p>{entry.solution || entry.contribution || entry.description}</p>
            {!entry.solution && <p className="project-detail-role">Role: {project.role}</p>}
          </div>
        </section>
        {!hasSplitWork && <section className="project-detail-section reveal" id="detail-work">
          <ProjectDetailSectionHeading label={entry.mediaPresentation === "instagram-phone" ? "the work" : "03 / the work"} title={entry.workHeading || "A closer look."} />
          <div className="project-detail-section-body"><p>{entry.workIntro || (entry.items?.some((item) => item.type !== "placeholder") ? "Selected visuals and production details from this project." : "This project's visuals are being prepared. Space is reserved for the final photography, video, or design work.")}</p>
            {entry.mediaPresentation === "instagram-phone" && <div className="project-detail-gallery-toolbar">
              <span>Four videos · scroll or swipe to explore</span>
              <div>
                <button type="button" aria-label="Previous video" onClick={() => scrollGallery(-1)}>←</button>
                <button type="button" aria-label="Next video" onClick={() => scrollGallery(1)}>→</button>
              </div>
            </div>}
            {entry.prototypeGallery && <ToolkitPrototypeGallery gallery={entry.prototypeGallery} />}
            {entry.assetCollections && <ToolkitAssetExplorer collections={entry.assetCollections} />}
            {entry.outcomeVideo && <section className="toolkit-outcome">
              <div className="toolkit-outcome-heading"><span>Outcome</span><div><h3>{entry.outcomeVideo.title}</h3><p>{entry.outcomeVideo.description}</p></div></div>
              <video controls playsInline preload="metadata" aria-label={entry.outcomeVideo.title}>
                <source src={assetHref(entry.outcomeVideo.src)} type="video/mp4" />
                Your browser does not support embedded video.
              </video>
            </section>}
            {entry.items?.length > 0 && <div ref={galleryRef} className={`project-detail-gallery project-detail-gallery-${entry.items.length}${entry.mediaPresentation ? ` project-detail-gallery-${entry.mediaPresentation}` : ""}`}>
              {entry.items.map((item, itemIndex) => <StructuredMediaItem item={item} title={entry.title} index={itemIndex} presentation={entry.mediaPresentation} key={item.src || item.videoId || `${item.label}-${itemIndex}`} />)}
            </div>}
            <ProjectDocumentLinks entry={entry} />
            {entry.additionalPosts && <details className="project-detail-related-posts">
              <summary>More posts from the account <span>{String(entry.additionalPosts.length).padStart(2, "0")}</span></summary>
              <div>{entry.additionalPosts.map((post, postIndex) => <a href={post.url} target="_blank" rel="noopener noreferrer" key={post.url}>
                <span>{String((entry.items?.length || 0) + postIndex + 1).padStart(2, "0")}</span>
                <strong>{post.title}</strong>
                <p>“{post.excerpt}”</p>
                {post.publicMetrics && <div className="related-post-metrics">{post.publicMetrics.likes} likes{post.publicMetrics.comments ? ` · ${post.publicMetrics.comments} comments` : ""}</div>}
                <small>Read the original caption on Instagram ↗</small>
              </a>)}</div>
            </details>}
            {entry.galleryRoute && <a className="project-detail-gallery-link" href={routeHref(entry.galleryRoute)} onClick={(event) => navigate(event, "/", entry.galleryRoute)}>View the full photo gallery ↗</a>}
          </div>
        </section>}
        {hasSplitWork && <>
          <section className="project-detail-section reveal" id="detail-storyboard">
            <ProjectDetailSectionHeading label="03 / storyboard" title={entry.storyboardHeading || "Planning the experience."} />
            <div className="project-detail-section-body">
              <p>{entry.storyboardIntro}</p>
              <div className={`project-detail-gallery project-detail-gallery-${entry.storyboardItems.length}`}>
                {entry.storyboardItems.map((item, itemIndex) => <StructuredMediaItem item={item} title={entry.title} index={itemIndex} key={item.src} />)}
              </div>
              <ProjectDocumentLinks entry={entry} />
            </div>
          </section>
          <section className="project-detail-section project-detail-final-output reveal" id="detail-final-output">
            <ProjectDetailSectionHeading label="04 / final output" title={entry.finalOutputHeading || "The finished work."} />
            <div className="project-detail-section-body">
              <p>{entry.finalOutputIntro}</p>
              <div className={`project-detail-gallery project-detail-gallery-${entry.finalOutputItems.length}`}>
                {entry.finalOutputItems.map((item, itemIndex) => <StructuredMediaItem item={item} title={entry.title} index={itemIndex} key={item.src} />)}
              </div>
            </div>
          </section>
        </>}
        <section className={`project-detail-section project-detail-impact reveal${entry.impactStory ? " project-detail-impact-editorial" : ""}`} id="detail-impact">
          <ProjectDetailSectionHeading label={entry.mediaPresentation === "instagram-phone" ? "impact" : `${hasSplitWork ? "05" : "04"} / impact`} title={entry.impactHeading || "What it made possible."} />
          <div className="project-detail-section-body">
            {entry.impactStory && <p className="project-detail-impact-lede">{entry.impact}</p>}
            {entry.impactMetrics && (
              <dl className="project-detail-metrics">
                {entry.impactMetrics.map((metric) => (
                  <div key={metric.label}><dt>{metric.label}</dt><dd>{metric.value}</dd></div>
                ))}
              </dl>
            )}
            {!entry.impactStory && <p>{entry.impact}</p>}
            {entry.impactStory && <div className="project-detail-impact-story">
              <div>
                <h3>{entry.impactStory.heading}</h3>
                <p>{entry.impactStory.body}</p>
                {entry.impactStory.note && <p>{entry.impactStory.note}</p>}
              </div>
              <figure>
                <img src={assetHref(entry.impactStory.image)} alt={entry.impactStory.imageAlt || ""} loading="lazy" />
                {entry.impactStory.imageCaption && <figcaption>{entry.impactStory.imageCaption}</figcaption>}
              </figure>
            </div>}
            {entry.impactSource && <small className="project-detail-impact-source">{entry.impactSource}</small>}
            {entry.publicEngagementSource && <small className="project-detail-impact-source">{entry.publicEngagementSource}</small>}
          </div>
        </section>
        <nav className="project-detail-next reveal" aria-label="Continue exploring projects">
          <span>{next ? "Next project" : "Back to the collection"}</span>
          <a href={routeHref(next ? projectDetailRoute(project, next.chapter, next.index) : projectRoute)} onClick={(event) => navigate(event, "/", next ? projectDetailRoute(project, next.chapter, next.index) : projectRoute)}>{next ? next.entry.title : `All ${project.title} projects`} <span aria-hidden="true">↗</span></a>
        </nav>
      </article>
      <MobileFooter clock={clock} />
    </main>
  );
}

function CaseStudyFeatureSection({ project, section, sectionIndex }) {
  const railRef = useRef(null);
  const [showAll, setShowAll] = useState(false);
  const isPortraitGrid = section.layout === "portrait-grid";
  const isStaticGrid = isPortraitGrid || ["editorial-grid", "editorial-triptych"].includes(section.layout);
  const visibleItems = showAll || !section.initialCount ? section.items : section.items.slice(0, section.initialCount);
  const scrollRail = (direction) => {
    const rail = railRef.current;
    const item = rail?.querySelector("figure");
    if (!rail || !item) return;
    const gap = parseFloat(window.getComputedStyle(rail).columnGap) || 0;
    rail.scrollBy({ left: direction * (item.getBoundingClientRect().width + gap), behavior: "smooth" });
  };

  return (
    <section className="immersive-project-chapter reveal" id={`project-feature-${sectionIndex}`} aria-labelledby={`${project.slug}-feature-${sectionIndex}`}>
      <header className="immersive-chapter-heading">
        <p><span>{String(sectionIndex + 1).padStart(2, "0")}</span>{section.eyebrow}</p>
        <div>
          <h2 id={`${project.slug}-feature-${sectionIndex}`}>{section.title}</h2>
          {section.description && <p>{section.description}</p>}
        </div>
      </header>
      {section.items.length > 1 && (
        <div className="immersive-gallery-controls" aria-label={`${section.title} gallery controls`}>
          <span>{isPortraitGrid ? `${visibleItems.length} of ${section.items.length} portraits · Select to enlarge` : isStaticGrid ? `${section.items.length} photographs · Select to enlarge` : `${section.items.length} project assets`}</span>
          {!isStaticGrid && <div><button type="button" onClick={() => scrollRail(-1)} aria-label={`Previous ${section.title} asset`}>←</button><button type="button" onClick={() => scrollRail(1)} aria-label={`Next ${section.title} asset`}>→</button></div>}
        </div>
      )}
      {section.article ? (
        <div className="published-editorial-feature">
          <figure>
            <ZoomableImage src={section.items[0].src} alt={section.items[0].alt} />
            <figcaption>Photography by Alexander Chen</figcaption>
          </figure>
          <div>
            <h3>{section.article.title}</h3>
            <p>{section.article.summary}</p>
            <dl>{section.article.credits.map(([label, name]) => <div key={label}><dt>{label}</dt><dd>{name}</dd></div>)}</dl>
            <a href={section.article.url} target="_blank" rel="noreferrer">Read the full feature <Arrow /></a>
          </div>
        </div>
      ) : <div ref={railRef} id={`${project.slug}-gallery-${sectionIndex}`} className={`immersive-media-rail immersive-media-${section.layout || "wide"}`}>
        {visibleItems.map((item, itemIndex) => (
          <figure className="immersive-media-item" key={item.src || item.videoId} style={{ "--media-aspect": item.aspect || "16 / 10" }}>
            <div className="immersive-media-frame">
              {item.type === "youtube" ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${item.videoId}`}
                  title={item.title || section.title}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : item.type === "vimeo" ? (
                <iframe
                  src={`https://player.vimeo.com/video/${item.videoId}?dnt=1`}
                  title={item.title || section.title}
                  loading="lazy"
                  allow="autoplay; fullscreen; picture-in-picture"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : item.type === "video" ? (
                <video controls playsInline preload={item.poster ? "none" : "metadata"} poster={item.poster ? assetHref(item.poster) : undefined} aria-label={item.caption || `${section.title} video ${itemIndex + 1}`}>
                  <source src={assetHref(item.src)} type={item.mime || "video/mp4"} />
                  Your browser does not support embedded video.
                </video>
              ) : (
                <ZoomableImage src={item.src} previewSrc={item.previewSrc} alt={item.alt || ""} />
              )}
            </div>
            {item.caption && <figcaption><span>{String(itemIndex + 1).padStart(2, "0")}</span>{item.href ? <a href={item.href} target="_blank" rel="noreferrer">{item.caption}<Arrow /></a> : item.caption}</figcaption>}
          </figure>
        ))}
      </div>}
      {visibleItems.length < section.items.length && (
        <button className="immersive-gallery-show-all" type="button" aria-controls={`${project.slug}-gallery-${sectionIndex}`} onClick={() => setShowAll(true)}>
          View all {section.items.length} portraits <span aria-hidden="true">↓</span>
        </button>
      )}
      {section.quote && (
        <blockquote className="immersive-client-quote">
          <p>“{section.quote.text}”</p>
          <cite>{section.quote.attribution}</cite>
        </blockquote>
      )}
    </section>
  );
}

function CaseStudyPage({ clock, navigate, project }) {
  if (project.caseStudyVariant === "structured") {
    return <StructuredCaseStudyPage clock={clock} navigate={navigate} project={project} />;
  }

  const backRoute = project.backLink?.route || (project.parentSlug ? `project/${project.parentSlug}` : "work");
  const backLabel = project.backLink?.label || project.parentTitle || "selected work";
  const sections = caseStudyProgressSectionsFor(project);
  const visibleProjects = workProjects.filter((item) => item.showInWork !== false);
  const projectIndex = visibleProjects.findIndex((item) => item.slug === project.slug);
  const nextProject = projectIndex >= 0 ? visibleProjects[(projectIndex + 1) % visibleProjects.length] : null;
  const publishedArticle = project.mediaSections?.find((section) => section.article)?.article;

  return (
    <main className={`main-content case-study-page immersive-project-page immersive-project-${project.slug}`}>
      <article className="case-study immersive-case-study">
        <header className="immersive-project-hero" id="project-overview">
          <div className="immersive-project-hero-media reveal reveal-fast" style={{ "--aspect": project.aspect || "16 / 10" }}>
            <ProjectVisual project={project} />
            {publishedArticle && (
              <p className="immersive-project-publication-meta">
                <span>{publishedArticle.publisher}</span>
                <time dateTime={publishedArticle.dateTime}>{publishedArticle.date}</time>
              </p>
            )}
            <span className="immersive-project-counter">01 / {String(sections.length).padStart(2, "0")}</span>
          </div>
          <div className="immersive-project-hero-copy reveal">
            <a className="case-study-back" href={routeHref(backRoute)} onClick={(event) => navigate(event, "/", backRoute)}><span aria-hidden="true">←</span> {backLabel}</a>
            <p>{project.status && <span className="case-study-status">{project.status}</span>}{project.coverEyebrow}</p>
            <h1>{project.title}</h1>
            <div className="case-study-intro">{project.description}</div>
            <div className="immersive-project-actions">
              {project.sourceUrl && <a className="case-study-source" href={/^https?:\/\//.test(project.sourceUrl) ? project.sourceUrl : assetHref(project.sourceUrl)} target="_blank" rel="noreferrer">{project.sourceLabel || "View source"} <Arrow /></a>}
              <a href="#project-impact" onClick={(event) => { event.preventDefault(); document.getElementById("project-impact")?.scrollIntoView({ behavior: "smooth" }); }}>See the outcome <span aria-hidden="true">↓</span></a>
            </div>
          </div>
        </header>
        <section className="immersive-project-brief reveal" aria-label="Project brief">
          <div>
            <span>Project thesis</span>
            <h2>{project.thesis || project.description}</h2>
          </div>
          <dl>
            <div><dt>Role</dt><dd>{project.role}</dd></div>
            <div><dt>Organization</dt><dd>{project.organization}</dd></div>
            <div><dt>Timeline</dt><dd>{project.period}</dd></div>
          </dl>
        </section>
        {project.projectCollection?.length > 0 && (
          <nav className="immersive-project-index reveal" id="project-collection-index" aria-label={`${project.title} project collection`}>
            <header>
              <span>{project.projectCollectionEyebrow || "Project collection"}</span>
              <h2>{project.projectCollectionTitle || "Explore the partnership."}</h2>
            </header>
            <div>
              {project.projectCollection.map((item) => (
                <a href={`#${item.target}`} key={item.title} onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(item.target)?.scrollIntoView({ behavior: "smooth" });
                }}>
                  <figure>
                    <img src={assetHref(item.image)} alt={item.imageAlt || ""} loading="lazy" />
                  </figure>
                  <span>{item.number}</span>
                  <div>
                    <p>{item.meta}</p>
                    <h3>{item.title}</h3>
                    <small>{item.summary}</small>
                  </div>
                  <b aria-hidden="true">↓</b>
                </a>
              ))}
            </div>
          </nav>
        )}
        {project.showProofStrip !== false && project.impact?.length > 0 && <section className="immersive-proof-strip reveal" aria-label="Project proof">{project.impact.slice(0, 3).map((item, index) => <article key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></article>)}</section>}
        {project.mediaSections?.map((section, sectionIndex) => <CaseStudyFeatureSection project={project} section={section} sectionIndex={sectionIndex} key={section.title} />)}
        {project.subprojects?.length > 0 && (
          <section className="case-study-subprojects immersive-project-collection reveal" id="project-collection" aria-labelledby={`${project.slug}-projects`}>
            <div className="case-study-subprojects-heading">
              <p>{project.subprojectsEyebrow || "Featured projects"}</p>
              <h2 id={`${project.slug}-projects`}>{project.subprojectsTitle || "Explore the Loblaw work."}</h2>
            </div>
            <div className="case-study-subproject-grid">
              {project.subprojects.map((subproject, index) => (
                <ProjectCard project={subproject} index={index} key={subproject.slug} />
              ))}
            </div>
          </section>
        )}
        <section className="case-study-impact immersive-project-impact reveal" id="project-impact" aria-labelledby={`${project.slug}-impact`}>
          <div><span>Outcome</span><h2 id={`${project.slug}-impact`}>What the work made possible.</h2></div>
          <ol>
            {project.impact.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
          </ol>
        </section>
        <nav className="immersive-project-next reveal" aria-label="Continue exploring projects">
          <span>{nextProject ? "Next project" : "Continue exploring"}</span>
          <a href={routeHref(nextProject ? `project/${nextProject.slug}` : backRoute)} onClick={(event) => navigate(event, "/", nextProject ? `project/${nextProject.slug}` : backRoute)}>{nextProject ? nextProject.title : `Return to ${backLabel}`} <span aria-hidden="true">↗</span></a>
        </nav>
      </article>
      <MobileFooter clock={clock} />
    </main>
  );
}

const utopiaScenes = [
  {
    id: "collection",
    number: "01",
    label: "Collection",
    kicker: "Start with the collection",
    title: "A room of records needed a path back to people.",
    body: "The first version gave the collection a home, but it was still only a shell. The real product challenge was turning physical LPs into trustworthy listings without making Alexander the permanent operator.",
    image: "/projects/work/utopia-vinyl/catalogue-evolution.png",
    alt: "Utopia Vinyl catalogue evolving from an empty prototype into shoppable stock",
    caption: "From empty catalogue to recognizable, shoppable inventory",
    tags: ["Collection structure", "Real record photography", "Clear catalogue facts"],
    background: "#e9e4da",
    accent: "#a64737",
    ink: "#1f2528",
  },
  {
    id: "seller",
    number: "02",
    label: "Seller",
    kicker: "Design for the person doing the work",
    title: "The seller workflow had to feel calm and forgiving.",
    body: "The upload flow was shaped around Tim's eyesight, comfort, and inventory routine. Larger targets, visible photo previews, draft checks, and optional AI assistance make each listing easier to prepare and review.",
    image: "/projects/work/utopia-vinyl/seller-workflow.png",
    alt: "Accessible seller workflow from the Utopia Vinyl project review",
    caption: "A practical path from record photography to a reviewed listing",
    tags: ["Accessible controls", "AI on demand", "Manual review", "Batch publishing"],
    background: "#dce8e6",
    accent: "#236c66",
    ink: "#182a29",
  },
  {
    id: "model",
    number: "03",
    label: "Model",
    kicker: "Choose the operating model",
    title: "Checkout begins with an honest promise.",
    body: "Utopia Vinyl uses one independent storefront and manual bank-transfer orders. The interface explains that choice clearly, then connects browsing, reservation, payment confirmation, and fulfilment as one understandable routine.",
    image: "/projects/work/utopia-vinyl/commerce-model.png",
    alt: "Utopia Vinyl commerce model connecting storefront, order, payment, and fulfilment",
    caption: "Storefront to fulfilment, with every handoff made visible",
    tags: ["Browse", "Reserve LPs", "Confirm transfer", "Ship order"],
    background: "#e4e9ed",
    accent: "#325d6e",
    ink: "#18252d",
  },
  {
    id: "buyer",
    number: "04",
    label: "Buyer",
    kicker: "Test the path",
    title: "A buyer should not have to create an account.",
    body: "Testing shifted the work from adding features to removing friction. Guest checkout became unmistakable, the cart survived browsing and login, and different LPs could travel together in one combined order.",
    image: "/projects/work/utopia-vinyl/buyer-journey.png",
    alt: "Buyer journey improvements for guest checkout and cart persistence",
    caption: "Real tester feedback clarified the route to one combined guest order",
    tags: ["Guest checkout", "Persistent cart", "One combined order", "Visible order status"],
    background: "#eee0d8",
    accent: "#b44a35",
    ink: "#2b211e",
  },
  {
    id: "learning",
    number: "05",
    label: "Results",
    kicker: "Measure, then improve",
    title: "The store became a working selling routine.",
    body: `The current order snapshot records ${utopiaMetrics.orderTotal} across ${utopiaMetrics.validOrders} valid orders: ${utopiaMetrics.paidTotal} paid across ${utopiaMetrics.paidOrders} orders and ${utopiaMetrics.awaitingTotal} awaiting payment across ${utopiaMetrics.awaitingOrders} orders. Cancelled and expired orders are excluded. The paid figures match Sales & Traffic's past-30-day results.`,
    image: "/projects/work/utopia-vinyl/results-current.svg",
    alt: `Utopia Vinyl orders: ${utopiaMetrics.orderTotal} across ${utopiaMetrics.validOrders} valid orders, split into ${utopiaMetrics.paidTotal} paid and ${utopiaMetrics.awaitingTotal} awaiting payment`,
    caption: `${utopiaMetrics.orderPeriod} · checked ${utopiaMetrics.asOf} (${utopiaMetrics.timeZone})`,
    tags: ["Order evidence", "Careful analytics", "Search visibility", "Continuous improvement"],
    background: "#cfd8d1",
    accent: "#2f6550",
    ink: "#18241f",
  },
];

function UtopiaStorefrontDemo() {
  const videoRef = useRef(null);
  const userPaused = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    const syncPlayback = () => {
      if (!visible || document.hidden || motion.matches || userPaused.current) video.pause();
      else video.play().catch(() => setPlaying(false));
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      syncPlayback();
    }, { threshold: 0.15 });
    observer.observe(video);
    document.addEventListener("visibilitychange", syncPlayback);
    motion.addEventListener("change", syncPlayback);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      motion.removeEventListener("change", syncPlayback);
      video.pause();
    };
  }, []);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    userPaused.current = !video.paused;
    if (video.paused) video.play().catch(() => setPlaying(false));
    else video.pause();
  };

  return (
    <div className="utopia-storefront-demo">
      <video ref={videoRef} src={assetHref("/projects/work/utopia-vinyl/utopia-vinyl-seamless-walkthrough.mp4")} poster={assetHref("/projects/work/utopia-vinyl/utopia-vinyl-seamless-poster.webp")} width="960" height="540" muted loop playsInline preload="metadata" aria-label="Utopia Vinyl walkthrough: browse records, view an album, and add it to the cart" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button type="button" className="utopia-demo-toggle" onClick={togglePlayback} aria-label={`${playing ? "Pause" : "Play"} storefront demo`}><span aria-hidden="true">{playing ? "Ⅱ" : "▶"}</span>{playing ? "Pause demo" : "Play demo"}</button>
    </div>
  );
}


function UtopiaResultsGraphic() {
  return (
    <div className="utopia-results-graphic" aria-label="Verified sales snapshot">
      <p className="utopia-results-eyebrow">Orders & payment status</p>
      <p className="utopia-results-heading">Orders at a glance.</p>
      <p className="utopia-results-period">{utopiaMetrics.orderPeriod} · checked {utopiaMetrics.asOf}<br />{utopiaMetrics.timeZone}</p>
      <div className="utopia-results-total"><strong>{utopiaMetrics.orderTotal}</strong><span>Displayed totals across {utopiaMetrics.validOrders} valid orders</span></div>
      <dl className="utopia-results-grid">
        <div><dt>{utopiaMetrics.paidTotal}</dt><dd>Paid<br />{utopiaMetrics.paidOrders} orders</dd></div>
        <div><dt>{utopiaMetrics.awaitingTotal}</dt><dd>Awaiting payment<br />{utopiaMetrics.awaitingOrders} orders</dd></div>
      </dl>
      <p className="utopia-results-definition">{utopiaMetrics.scopeNote} {utopiaMetrics.shippingNote}</p>
      <p className="utopia-results-graphic-source">{utopiaMetrics.sourceNote}</p>
    </div>
  );
}

function UtopiaVinylPage({ clock, navigate, project }) {
  const pageRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [activeScene, setActiveScene] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const page = pageRef.current;
      if (!page) return;

      const pageTop = page.getBoundingClientRect().top + window.scrollY;
      const available = Math.max(page.scrollHeight - window.innerHeight, 1);
      const ratio = Math.min(Math.max((window.scrollY - pageTop) / available, 0), 1);
      const nextProgress = Math.round(ratio * 100);
      page.style.setProperty("--utopia-scroll", String(nextProgress));
      setProgress((current) => current === nextProgress ? current : nextProgress);

      const marker = window.innerHeight * 0.56;
      let nextScene = 0;
      utopiaScenes.forEach((scene, index) => {
        const section = document.getElementById(`utopia-${scene.id}`);
        if (!section) return;

        const rect = section.getBoundingClientRect();
        const travel = Math.max(rect.height - window.innerHeight, 1);
        const sceneProgress = Math.min(Math.max(-rect.top / travel, 0), 1);
        section.style.setProperty("--scene-progress", sceneProgress.toFixed(3));
        section.style.setProperty("--scene-copy-lift", `${((0.5 - sceneProgress) * 16).toFixed(2)}px`);
        section.style.setProperty("--scene-image-lift", `${((0.5 - sceneProgress) * 34).toFixed(2)}px`);
        section.style.setProperty("--scene-image-scale", (1.025 - sceneProgress * 0.035).toFixed(3));
        section.style.setProperty("--scene-drift", `${((0.5 - sceneProgress) * 88).toFixed(2)}px`);
        if (rect.top <= marker) nextScene = index;
      });
      setActiveScene((current) => current === nextScene ? current : nextScene);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  const scrollToScene = (scene) => document.getElementById(`utopia-${scene.id}`)?.scrollIntoView({ behavior: "smooth" });
  const reportUrl = /^https?:\/\//.test(project.sourceUrl) ? project.sourceUrl : assetHref(project.sourceUrl);

  return (
    <main className="main-content utopia-page" ref={pageRef}>
      <header className="utopia-hero utopia-hero-with-demo" id="utopia-overview" aria-labelledby="utopia-title">
        <div className="utopia-hero-copy">
          <a href={routeHref("work")} onClick={(event) => navigate(event, "/", "work")}><span aria-hidden="true">←</span> selected work</a>
          <div>
            <p><span>Ongoing</span> Product design · Independent commerce</p>
            <h1 id="utopia-title">Utopia<br />Vinyl</h1>
            <p className="utopia-hero-lede">Reconnecting a family collection with returning collectors and first-time buyers.</p>
          </div>
          <div className="utopia-hero-actions">
            <button type="button" onClick={() => scrollToScene(utopiaScenes[0])}>Begin the journey <span aria-hidden="true">↓</span></button>
            <a href={reportUrl} target="_blank" rel="noreferrer">November 4 report (archive) <Arrow /></a>
          </div>
        </div>
        <div className="utopia-banner-demo">
          <div className="utopia-banner-browser"><span aria-hidden="true">● ● ●</span><span>utopiavinyl.com.tw</span></div>
          <UtopiaStorefrontDemo />
          <p>Browse the collection · Open a record · Add to cart</p>
        </div>
        <div className="utopia-hero-index"><span>01</span><span>24</span></div>
      </header>

      <section className="utopia-origin" aria-labelledby="utopia-origin-title">
        <p>THE STARTING POINT</p>
        <div>
          <h2 id="utopia-origin-title">This started as a family problem, not a portfolio brief.</h2>
          <p>Alexander's father had more vinyl records than he could connect to buyers. The work grew from a catalogue experiment into a complete product system for listing, ordering, payment confirmation, fulfilment, and support.</p>
        </div>
        <dl>
          <div><dt>Collection</dt><dd>Physical LPs waiting to be rediscovered</dd></div>
          <div><dt>People</dt><dd>A seller who needed calm tools and buyers who needed confidence</dd></div>
          <div><dt>Role</dt><dd>Product direction, interface, brand, feedback, and AI-assisted delivery</dd></div>
        </dl>
      </section>

      <div className="utopia-chapters">
        {utopiaScenes.map((scene, index) => (
          <section
            className={`utopia-scene${activeScene === index ? " is-active" : ""}`}
            id={`utopia-${scene.id}`}
            style={{ "--scene-bg": scene.background, "--scene-accent": scene.accent, "--scene-ink": scene.ink }}
            aria-labelledby={`utopia-${scene.id}-title`}
            key={scene.id}
          >
            <div className="utopia-scene-sticky">
              <div className="utopia-scene-copy">
                <p className="utopia-scene-kicker"><span>{scene.number}</span>{scene.kicker}</p>
                <h2 id={`utopia-${scene.id}-title`}>{scene.title}</h2>
                <p className="utopia-scene-body">{scene.body}</p>
                <ul>{scene.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              </div>
              <figure className="utopia-report-frame">
                <div className="utopia-report-bar"><span>Alexander Chen / Utopia Vinyl</span><span>{String(index + 1).padStart(2, "0")} / 05</span></div>
                {scene.id === "learning" ? <UtopiaResultsGraphic /> : <img src={assetHref(scene.image)} alt={scene.alt} loading={index === 0 ? "eager" : "lazy"} />}
                <figcaption><span>{scene.number}</span>{scene.caption}</figcaption>
              </figure>
              <span className="utopia-scene-word" aria-hidden="true">{scene.label}</span>
            </div>
          </section>
        ))}
      </div>

      <section className="utopia-outcome" id="utopia-outcome" aria-labelledby="utopia-outcome-title">
        <div className="utopia-outcome-record" aria-hidden="true"><i /><span>UTOPIA<br />VINYL</span></div>
        <div className="utopia-outcome-copy">
          <p>VERIFIED RESULTS · {utopiaMetrics.asOf.toUpperCase()}</p>
          <h2 id="utopia-outcome-title">A small store became a working commerce system.</h2>
          <p>{utopiaMetrics.orderPeriod}, checked {utopiaMetrics.asOf} ({utopiaMetrics.timeZone}). {utopiaMetrics.scopeNote} {utopiaMetrics.shippingNote}</p>
        </div>
        <dl className="utopia-metrics">
          <div><dt>{utopiaMetrics.orderTotal}</dt><dd>displayed totals across {utopiaMetrics.validOrders} valid orders, including orders awaiting payment</dd></div>
          <div><dt>{utopiaMetrics.paidTotal}</dt><dd>{utopiaMetrics.salesLabel} across {utopiaMetrics.paidOrders} orders in the past 30 days</dd></div>
          <div><dt>{utopiaMetrics.awaitingTotal}</dt><dd>awaiting payment across {utopiaMetrics.awaitingOrders} orders</dd></div>
          <div><dt>{utopiaMetrics.lpsSold}</dt><dd>LPs in the confirmed paid orders, past 30 days</dd></div>
        </dl>
        <p className="utopia-results-source">{utopiaMetrics.sourceNote}. Separately, Sales & Traffic recorded {utopiaMetrics.pageViews} page views across {utopiaMetrics.visitors} visitors in the past 30 days; traffic may include staff or testing activity. Weekly Progress includes unpaid orders and is not a paid-sales total.</p>
        <div className="utopia-outcome-actions">
          <a href={reportUrl} target="_blank" rel="noreferrer">Read the archived November 4 review (24 pages) <Arrow /></a>
          <a href={routeHref("work")} onClick={(event) => navigate(event, "/", "work")}>Return to selected work <span aria-hidden="true">↑</span></a>
        </div>
      </section>

      <MobileFooter clock={clock} />
    </main>
  );
}

function IcffCollectionPage({ clock, navigate, project }) {
  const activeSection = useIcffHubActiveSection();
  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="main-content icff-hub-page">
      <article className="icff-hub" aria-labelledby="icff-hub-title">
        <nav className="icff-hub-mobile-nav" aria-label="ICFF collection navigation">
          <a href={routeHref("work")} onClick={(event) => navigate(event, "/", "work")}>Back to work</a>
          <a className={activeSection === "icff-role" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-role")}>Role</a>
          <a className={activeSection === "icff-organization" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-organization")}>Organization</a>
          <a className={activeSection === "icff-timeline" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-timeline")}>Timeline</a>
          <a className={activeSection === "icff-featured-projects" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-featured-projects")}>Featured Projects</a>
        </nav>

        <div className="icff-hub-cover reveal reveal-fast">
          <img src={assetHref(project.image)} alt={project.imageAlt} fetchPriority="high" />
        </div>
        <header className="icff-hub-header reveal">
          <p>{project.coverEyebrow}</p>
          <h1 id="icff-hub-title">{project.title}</h1>
          <div>{project.description}</div>
        </header>

        <div className="icff-hub-facts">
          <section className="icff-hub-fact reveal" id="icff-role">
            <p>Role</p>
            <div><h2>{project.role}</h2><p>Leading opening-night coverage and supporting celebrity-focused photography across the festival.</p></div>
          </section>
          <section className="icff-hub-fact reveal" id="icff-organization">
            <p>Organization</p>
            <div><h2>{project.organization}</h2><p>Photography created across selected ICFF festival events in Toronto.</p></div>
          </section>
          <section className="icff-hub-fact reveal" id="icff-timeline">
            <p>Timeline</p>
            <div><h2>{project.period}</h2><p>Selected events documented across two festival years.</p></div>
          </section>
        </div>

        <section className="icff-hub-projects reveal" id="icff-featured-projects" aria-labelledby="icff-featured-title">
          <div className="icff-hub-projects-heading">
            <p>{project.subprojectsEyebrow}</p>
            <h2 id="icff-featured-title">{project.subprojectsTitle}</h2>
          </div>
          <div className="icff-hub-project-grid">
            {project.subprojects.map((subproject, index) => <ProjectCard project={subproject} index={index} key={subproject.slug} />)}
          </div>
        </section>
      </article>
      <MobileFooter clock={clock} />
    </main>
  );
}

function IcffGalleryPage({ clock, navigate, project }) {
  const activeSection = useIcffActiveSection();
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const backRoute = project.parentSlug ? `project/${project.parentSlug}` : "work";
  const backLabel = project.parentSlug ? "Back to ICFF" : "Back to work";
  const portraits = project.gallery.filter((photo) => photo.orientation !== "landscape");
  const landscapes = project.gallery.filter((photo) => photo.orientation === "landscape");
  const selectedPhoto = lightboxIndex === null ? null : project.gallery[lightboxIndex];

  useEffect(() => {
    if (lightboxIndex === null) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setLightboxIndex(null);
      if (event.key === "ArrowLeft") setLightboxIndex((current) => (current - 1 + project.gallery.length) % project.gallery.length);
      if (event.key === "ArrowRight") setLightboxIndex((current) => (current + 1) % project.gallery.length);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lightboxIndex, project.gallery.length]);

  const scrollToSection = (event, sectionId) => {
    event.preventDefault();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const renderPhoto = (photo, index, group) => (
    <figure className="icff-gallery-item reveal" key={photo.src} style={{ "--delay": `${Math.min((index % 4) * 55, 165)}ms` }}>
      <button className="icff-photo-frame icff-photo-button" type="button" onClick={() => setLightboxIndex(project.gallery.indexOf(photo))} aria-label={`View ${photo.alt}`}>
        <img
          src={assetHref(photo.src)}
          alt={photo.alt}
          loading={group === "portrait" && index < 4 ? "eager" : "lazy"}
          fetchPriority={group === "portrait" && index === 0 ? "high" : "auto"}
          decoding="async"
        />
      </button>
    </figure>
  );

  return (
    <main className="main-content icff-page">
      <article aria-labelledby="icff-title">
        <nav className="icff-mobile-subnav" aria-label="ICFF page navigation">
          <a href={routeHref(backRoute)} onClick={(event) => navigate(event, "/", backRoute)}>{backLabel}</a>
          <a className={activeSection === "icff-context" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-context")}>context</a>
          <a className={activeSection === "icff-photoshoot" ? "active" : ""} href={routeHref(`project/${project.slug}`)} onClick={(event) => scrollToSection(event, "icff-photoshoot")}>photoshoot</a>
        </nav>
        <header className="icff-intro reveal reveal-fast" id="icff-context">
          <div className="icff-intro-copy">
            <p className="icff-eyebrow">ICFF · Lavazza IncluCity Festival</p>
            <h1 id="icff-title">{project.title}</h1>
            <p className="icff-lede">{project.description}</p>
            <div className="icff-credit">
              <span>{project.role}</span>
              <span>Toronto, Canada</span>
            </div>
            <div className="icff-context-grid" aria-label="Project details">
              <div><span>team</span><p>ICFF creative and production team</p></div>
              <div><span>my role</span><p>{project.role}</p></div>
              <div><span>focus</span><p>Editorial portraits<br />Candid festival storytelling</p></div>
              <div><span>duration</span><p>{project.period}</p></div>
            </div>
          </div>
        </header>

        <section className="icff-photoshoot" id="icff-photoshoot" aria-label="ICFF Lavazza IncluCity Festival photo gallery">
          <div className="icff-gallery icff-gallery-portraits">
            {portraits.map((photo, index) => renderPhoto(photo, index, "portrait"))}
          </div>
          {landscapes.length > 0 && (
            <div className="icff-gallery-landscapes">
              {landscapes.map((photo, index) => renderPhoto(photo, index, "landscape"))}
            </div>
          )}
        </section>
        {selectedPhoto && (
          <div className="icff-lightbox" role="dialog" aria-modal="true" aria-label="Expanded ICFF photograph" onMouseDown={(event) => event.target === event.currentTarget && setLightboxIndex(null)}>
            <button className="icff-lightbox-close" type="button" onClick={() => setLightboxIndex(null)} aria-label="Close photo viewer" autoFocus>Close</button>
            <button className="icff-lightbox-control icff-lightbox-previous" type="button" onClick={() => setLightboxIndex((current) => (current - 1 + project.gallery.length) % project.gallery.length)} aria-label="View previous photograph">←</button>
            <img src={assetHref(selectedPhoto.src)} alt={selectedPhoto.alt} />
            <button className="icff-lightbox-control icff-lightbox-next" type="button" onClick={() => setLightboxIndex((current) => (current + 1) % project.gallery.length)} aria-label="View next photograph">→</button>
          </div>
        )}
      </article>
      <MobileFooter clock={clock} />
    </main>
  );
}

function EducationPage() {
  return (
    <main className="main-content education-page">
      <header className="education-intro">
        <p className="section-label">Education</p>
        <h1>Learning that shapes<br />the way I work.</h1>
        <p>Digital Enterprise Management at the University of Toronto, with a foundation in UX design and a hands-on creative practice.</p>
      </header>
      <section className="education-degree" aria-labelledby="education-degree-title">
        <div className="education-degree-top">
          <img src={assetHref("/brands/university-of-toronto.webp")} alt="University of Toronto" />
          <span className="education-seal" aria-label="Class of 2024">U OF T<br /><span aria-hidden="true">✧</span><br />CLASS OF 2024</span>
        </div>
        <h2 id="education-degree-title">Honours Bachelor <em>of Arts</em></h2>
        <span className="education-year" aria-hidden="true">2024</span>
        <div className="education-degree-bottom">
          <a href="https://www.utm.utoronto.ca/" target="_blank" rel="noreferrer">University of Toronto Mississauga <Arrow /></a>
          <p>Graduated · June 2024</p>
          <ul className="education-tags" aria-label="Program of study"><li>Digital Enterprise Management Specialist</li></ul>
        </div>
      </section>
      <section className="education-beyond" aria-labelledby="education-beyond-title">
        <h2 id="education-beyond-title">Beyond the degree</h2>
        <article className="education-certificate">
          <div><h3>UX Design Certificate</h3><p>Juno College of Technology · Remote, Canada</p></div>
          <span>Completed · June 2023</span>
        </article>
        <article className="education-certificate">
          <div><h3>Flight Attendant Training</h3><p>Porter Airlines · Aviation safety &amp; passenger service</p></div>
        </article>
        <article className="education-certificate">
          <div><h3>Smart Serve Ontario</h3><p>Responsible alcohol service</p></div>
        </article>
      </section>
      <section className="education-threads" aria-labelledby="education-threads-title">
        <h2 id="education-threads-title">Study threads</h2>
        <ul className="education-tags">{["Digital enterprise", "UX design", "Content strategy", "Digital marketing", "Visual storytelling", "Project management"].map((thread) => <li key={thread}>{thread}</li>)}</ul>
      </section>
    </main>
  );
}

function AboutPage({ clock }) {
  const highlightTerms = [
    "clear, consistent, and human",
    "AI-enabled workflows",
    "design systems",
    "reusable patterns",
    "systems thinking",
    "maker mindset",
    "systems",
  ];
  const highlightPattern = new RegExp(`(${highlightTerms.join("|")})`, "gi");
  const highlightedCopy = (copy) => copy.split(highlightPattern).map((part, index) => (
    highlightTerms.some((term) => term.toLowerCase() === part.toLowerCase())
      ? <strong className="about-keyword" key={`${part}-${index}`}>{part}</strong>
      : part
  ));

  return (
    <main className="main-content about-page">
      <section className="about-section">
        <p className="section-label reveal reveal-fast">{about.eyebrow}</p>
        <div className="about-layout">
          <div className="about-portrait reveal">
            <img
              src={assetHref("/projects/about/alexander-chen-portrait.jpg")}
              alt="Alexander Chen wearing a black suit in an industrial interior"
            />
          </div>
          <div className="about-copy reveal">
            <p className="about-role">{about.role}</p>
            <h1 className="about-headline">{highlightedCopy(about.headline)}</h1>
            <div className="about-bio">
              {about.paragraphs.map((paragraph) => <p key={paragraph}>{highlightedCopy(paragraph)}</p>)}
            </div>
            <div className="about-cta">
              <p>{about.cta}</p>
              <a href={`mailto:${profile.email}`}>Let's work together <Arrow /></a>
            </div>
          </div>
        </div>
      </section>
      <section className="about-resume-section reveal" aria-labelledby="about-experience-title">
        <header className="about-section-heading">
          <p>experience</p>
          <h2 id="about-experience-title">Where strategy became something people could use.</h2>
        </header>
        <ol className="about-experience-list">
          {about.experience.map((item, index) => (
            <li key={`${item.organization}-${item.role}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{item.organization}</h3>
                <p>{item.role}{item.location ? ` · ${item.location}` : ""}</p>
              </div>
              <div className="about-experience-impact">
                <p>{item.summary}</p>
                <ul>{item.metrics.map((metric) => <li key={metric}>{metric}</li>)}</ul>
              </div>
              <time>{item.period}</time>
            </li>
          ))}
        </ol>
      </section>
      <section className="about-foundation reveal" aria-labelledby="about-foundation-title">
        <header className="about-section-heading">
          <p>foundation</p>
          <h2 id="about-foundation-title">A multidisciplinary toolkit, grounded in design.</h2>
        </header>
        <div className="about-foundation-grid">
          <div className="about-education">
            <h3>Education</h3>
            {about.education.map((item) => (
              <div key={item.program}>
                <p>{item.program}</p>
                <span>{item.school}</span>
                <time>{item.period}</time>
              </div>
            ))}
          </div>
          <dl className="about-capabilities">
            {about.capabilities.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.items}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <MobileFooter clock={clock} />
    </main>
  );
}

function AoStudioPage({ clock, navigate }) {
  return (
    <main className="main-content ao-studio-page">
      <section className="ao-studio-hero reveal reveal-fast">
        <div className="ao-studio-hero-brand">
          <img src={assetHref("/projects/ao-studio/ao-studio-wordmark-dark.png")} alt="AO Studio" />
        </div>
        <div className="ao-studio-hero-copy">
          <p>independent creative production agency</p>
          <h1>Creative work,<br />built with intention.</h1>
          <p className="ao-studio-intro">AO Studio is my creative production agency, a home for thoughtful brand, content, and digital work. I shaped the identity and built the website in-house from the ground up.</p>
          <a className="ao-studio-link" href="https://aostudioinfo.com/" target="_blank" rel="noreferrer">
            Visit AO Studio <Arrow />
          </a>
        </div>
      </section>

      <section className="ao-studio-story reveal" aria-labelledby="ao-studio-story-title">
        <div>
          <p className="ao-studio-kicker">built in-house</p>
          <h2 id="ao-studio-story-title">A studio shaped end to end.</h2>
        </div>
        <p>I developed AO Studio as both a creative practice and a digital product. From its visual identity and positioning to the design and development of its website, I shaped the experience end to end. The result is a flexible platform for creative production, collaboration, and future work.</p>
      </section>

      <section className="ao-studio-details reveal" aria-label="AO Studio details">
        <div><span>my role</span><p>Founder · Creative Director · Designer · Developer</p></div>
        <div><span>focus</span><p>Brand identity · Content · Digital experiences</p></div>
        <div><span>website</span><p><a href="https://aostudioinfo.com/" target="_blank" rel="noreferrer">aostudioinfo.com <Arrow /></a></p></div>
      </section>

      <section className="ao-studio-work reveal" aria-labelledby="ao-studio-work-title">
        <h2 id="ao-studio-work-title">Selected work</h2>
        <ul>
          {aoStudioProjectSlugs.map((slug) => {
            const route = `project/${slug}`;
            const project = projectFromRoute(route);
            return (
              <li key={slug}>
                <a href={routeHref(route)} onClick={(event) => navigate(event, "/", route)}>
                  <span>{project.title}</span>
                  <Arrow />
                </a>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="ao-studio-signoff reveal" aria-label="AO Studio">
        <img src={assetHref("/projects/ao-studio/ao-studio-app-icon.png")} alt="AO Studio app icon" />
      </div>
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

function structuredProgressSectionsFor(project) {
  return [
    { id: "structured-overview", label: "Overview" },
    ...(project.thesis ? [{ id: "structured-thesis", label: project.thesis.label || "Approach" }] : []),
    ...(project.proofMetrics?.length ? [{ id: "structured-proof", label: "Proof" }] : []),
    { id: "structured-work", label: "Project index" },
    ...(project.chapters || []).map((chapter) => ({ id: chapter.id, label: chapter.title })),
  ];
}

function caseStudyProgressSectionsFor(project) {
  return [
    { id: "project-overview", label: "Overview" },
    ...(project.projectCollection?.length ? [{ id: "project-collection-index", label: "Project collection" }] : []),
    ...(project.mediaSections || []).map((section, index) => ({ id: `project-feature-${index}`, label: section.title })),
    ...(project.subprojects?.length ? [{ id: "project-collection", label: "Project collection" }] : []),
    { id: "project-impact", label: "Impact" },
  ];
}

function projectProgressFor(project, detail) {
  if (detail) {
    return {
      label: `${detail.entry.title} project journey`,
      sections: detailSectionsFor(detail.entry).map((section) => ({ id: section.id, label: section.label })),
    };
  }

  if (!project) return null;

  if (project.slug === "utopia-vinyl") {
    return {
      label: `${project.title} project journey`,
      sections: [
        { id: "utopia-overview", label: "Overview" },
        ...utopiaScenes.map((scene) => ({ id: `utopia-${scene.id}`, label: scene.label })),
        { id: "utopia-outcome", label: "Outcome" },
      ],
    };
  }

  if (project.slug === "icff-distillery-opening-night-2025") {
    return {
      label: `${project.title} project journey`,
      sections: [
        { id: "icff-context", label: "Context" },
        { id: "icff-photoshoot", label: "Photoshoot" },
      ],
    };
  }

  if (project.slug === "icff-lavazza-inclucity" && project.caseStudyVariant !== "structured") {
    return {
      label: `${project.title} project journey`,
      sections: [
        { id: "icff-role", label: "Role" },
        { id: "icff-organization", label: "Organization" },
        { id: "icff-timeline", label: "Timeline" },
        { id: "icff-featured-projects", label: "Featured projects" },
      ],
    };
  }

  if (project.slug === "gta-imaging") {
    return {
      label: `${project.title} project journey`,
      sections: [
        { id: "gta-overview", label: "Overview" },
        { id: "gta-design", label: "The opportunity" },
        { id: "gta-changes", label: "What changed" },
        { id: "gta-results", label: "Results" },
        { id: "gta-products", label: "Product discovery" },
        { id: "gta-next", label: "Next steps" },
      ],
    };
  }

  return {
    label: `${project.title} project journey`,
    sections: project.caseStudyVariant === "structured"
      ? structuredProgressSectionsFor(project)
      : caseStudyProgressSectionsFor(project),
  };
}

export default function App() {
  const { page, route, navigate } = usePage();
  const clock = useClock();
  const selectedDetail = detailFromRoute(page);
  const selectedProject = selectedDetail?.project || projectFromRoute(page);
  const selectedPhotographyAlbum = page.startsWith("playground/photography/")
    ? photographySessions.find((album) => page === `playground/photography/${album.id}`)
    : null;
  const isPlayground = page.startsWith("playground");
  const isIcffGallery = selectedProject?.slug === "icff-distillery-opening-night-2025";
  const isIcffHub = selectedProject?.slug === "icff-lavazza-inclucity" && selectedProject.caseStudyVariant !== "structured";
  const isUtopia = selectedProject?.slug === "utopia-vinyl";
  const projectProgress = !isPlayground ? projectProgressFor(selectedProject, selectedDetail) : null;
  const usesTopbar = !isPlayground;

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
    if (page === "education") document.title = `${profile.name} | Education`;
    else if (page === "about") document.title = `${profile.name} | About`;
    else if (page === "ao-studio") document.title = `AO Studio | ${profile.name}`;
    else if (selectedPhotographyAlbum) document.title = `${selectedPhotographyAlbum.title} Album | ${profile.name}`;
    else if (page === "playground/photography") document.title = `${profile.name} | My Art`;
    else if (page === "playground/design") document.title = `${profile.name} | My Design`;
    else if (page === "playground/fa-adventure") document.title = `${profile.name} | My FA Adventure`;
    else if (page === "playground/alexs-life") document.title = `Alex's Life | ${profile.name}`;
    else if (page === "playground/alexs-life-hifi") document.title = `Alex's Life High Fidelity | ${profile.name}`;
    else if (page === "playground") document.title = `${profile.name} | Playground`;
    else if (selectedDetail) document.title = `${selectedDetail.entry.title} | ${profile.name}`;
    else if (selectedProject) document.title = `${selectedProject.title} | ${profile.name}`;
    else document.title = `${profile.name} | Digital Designer & Content Strategist`;
  }, [page, selectedProject, selectedDetail, selectedPhotographyAlbum]);

  return (
    <div className={`site-shell${usesTopbar ? " topbar-shell" : ""}${projectProgress ? " project-progress-shell" : ""}`}>
      {!isPlayground && !isUtopia && <><div className="page-fade page-fade-top" /><div className="page-fade page-fade-bottom" /></>}
      {!isPlayground && <Sidebar page={page} route={route} navigate={navigate} clock={clock} projectProgress={projectProgress} />}
      {!isPlayground && <MobileHeader page={page} route={route} navigate={navigate} />}
      {!isPlayground && projectProgress && <div className="mobile-project-progress"><ProjectProgressHUD sections={projectProgress.sections} label={projectProgress.label} /></div>}
      {page === "education" ? (
        <EducationPage />
      ) : page === "about" ? (
        <AboutPage clock={clock} />
      ) : page === "ao-studio" ? (
        <AoStudioPage clock={clock} navigate={navigate} />
      ) : page === "playground/photography" ? (
        <PhotographyPage clock={clock} navigate={navigate} />
      ) : selectedPhotographyAlbum ? (
        <PhotographyAlbumPage album={selectedPhotographyAlbum} clock={clock} navigate={navigate} />
      ) : page === "playground/design" ? (
        <DesignPage clock={clock} navigate={navigate} />
      ) : page === "playground/fa-adventure" ? (
        <FAAdventurePage clock={clock} navigate={navigate} />
      ) : page === "playground/alexs-life" ? (
        <AlexLifeGame clock={clock} navigate={navigate} />
      ) : page === "playground/alexs-life-hifi" ? (
        <AlexLifeGameV2 navigate={navigate} />
      ) : page === "playground" ? (
        <PlaygroundPage clock={clock} navigate={navigate} />
      ) : selectedDetail ? (
        <ProjectDetailPage clock={clock} navigate={navigate} detail={selectedDetail} />
      ) : selectedProject?.slug === "icff-lavazza-inclucity" && selectedProject.caseStudyVariant !== "structured" ? (
        <IcffCollectionPage clock={clock} navigate={navigate} project={selectedProject} />
      ) : selectedProject?.slug === "icff-distillery-opening-night-2025" ? (
        <IcffGalleryPage clock={clock} navigate={navigate} project={selectedProject} />
      ) : selectedProject?.slug === "utopia-vinyl" ? (
        <UtopiaVinylPage clock={clock} navigate={navigate} project={selectedProject} />
      ) : selectedProject?.slug === "gta-imaging" ? (
        <GtaEmailCaseStudy />
      ) : selectedProject ? (
        <CaseStudyPage clock={clock} navigate={navigate} project={selectedProject} />
      ) : (
        <HomePage clock={clock} navigate={navigate} />
      )}
      {!isPlayground && !usesTopbar && <div className="desktop-clock">{clock}</div>}
    </div>
  );
}

