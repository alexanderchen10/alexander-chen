import { useState } from "react";
import { workProjects } from "./data";
import "./ProjectsPage.css";

const href = (route) => `${import.meta.env.BASE_URL}#${route}`;
const projects = [...workProjects.filter(p => !p.parentSlug)].sort((a,b) => (b.slug === "utopia-vinyl") - (a.slug === "utopia-vinyl"));
const ongoing = p => /ongoing|present/i.test(`${p.status || ""} ${p.period || ""}`);
const scroll = id => document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
const changes = [
  ["Seamless storefront demonstration", "Published a 15-second walkthrough from browsing records to adding an LP to the cart. A visible cursor, deliberate hover pauses, and matching opening and closing frames make the interaction easier to follow."],
  ["A clearer first impression", "Reframed the project introduction around the seller’s limited eyesight and the buyer’s need for trustworthy record details. Added direct access to the live store."],
  ["Readable results", "Separated valid orders, displayed order totals, paid amounts, and amounts awaiting payment. Added a reporting date and explained what the figures include."],
  ["A more usable case study", "Added the walkthrough to the front banner and compact numbered chapter navigation with summaries on hover or focus."]
];

export function ProjectsPage({ Media }) {
  const [filter, setFilter] = useState("All");
  const shown = projects.filter(p => filter === "All" || (filter === "Ongoing" ? ongoing(p) : !ongoing(p)));
  return <main className="work-index main-content" id="work">
    <header className="work-index-hero">
      <div><p className="work-eyebrow">Project index / 2026</p><h1>Projects</h1><p className="work-intro">Digital products, creative systems, and the thinking behind the work.</p></div>
      <div className="work-hero-actions"><a className="work-action primary" href={href("project-log")}>Open project log <span>↗</span></a><button className="work-action" onClick={() => scroll("project-directory")}>Browse projects <span>↓</span></button></div>
    </header>
    <a className="work-log-banner" href={href("project-log")}><div><strong>Project &amp; Documentation Log</strong><span>Design decisions · evidence · documented updates</span></div><span>Open log ↗</span></a>
    <section className="work-directory" id="project-directory" aria-labelledby="directory-title">
      <div className="work-directory-heading"><div><p className="work-eyebrow">01 / Selected work</p><h2 id="directory-title">Project index</h2></div><span aria-live="polite">{shown.length} {shown.length === 1 ? "project" : "projects"}</span></div>
      <div className="work-filters" aria-label="Filter projects">{["All","Ongoing","Completed"].map(f => <button key={f} type="button" aria-pressed={filter === f} onClick={() => setFilter(f)}>{f}<span>{projects.filter(p => f === "All" || (f === "Ongoing" ? ongoing(p) : !ongoing(p))).length}</span></button>)}</div>
      <div className="work-project-list">{shown.map((p) => <article className="work-index-project" key={p.slug}>
        <span className="work-project-number">{String(projects.indexOf(p)+1).padStart(2,"0")}</span>
        <a className="work-project-preview" href={href(`project/${p.slug}`)} aria-label={`Open ${p.title} case study`}><Media project={p} surface="card" /><span>View project ↗</span></a>
        <div className="work-project-copy"><p className="work-eyebrow">{ongoing(p) ? "Ongoing" : "Completed"} / {p.organization || "Independent project"}</p><h3><a href={href(`project/${p.slug}`)}>{p.title}</a></h3><p>{p.homeDescription || p.description}</p><span className="work-project-role">{p.role}</span><div className="work-project-links"><a href={href(`project/${p.slug}`)}>Open project ↗</a>{p.liveUrl && <a href={p.liveUrl} target="_blank" rel="noreferrer">Visit live site ↗</a>}<a href={href(`project-log/${p.slug}`)}>Project record ↗</a></div></div>
      </article>)}</div>
    </section>
  </main>;
}

export function ProjectLogPage({ slug }) {
  const project = slug ? projects.find(p => p.slug === slug) : null;
  const [filter, setFilter] = useState("All records");
  if (slug && !project) return <main className="work-index main-content"><header className="work-index-hero"><div><h1>Record not found</h1><a href={href("project-log")}>All project records ↗</a></div></header></main>;
  if (project) return <main className="work-index main-content work-record-detail">
    <header className="work-index-hero"><div><a className="work-back" href={href("project-log")}>← All project records</a><p className="work-eyebrow">Project record / {ongoing(project) ? "Ongoing" : "Completed"}</p><h1>{project.title}</h1><p className="work-intro">{project.homeDescription || project.description}</p></div><div className="work-hero-actions"><a className="work-action primary" href={href(`project/${project.slug}`)}>Read case study <span>↗</span></a>{project.liveUrl && <a className="work-action" href={project.liveUrl} target="_blank" rel="noreferrer">Visit live site <span>↗</span></a>}</div></header>
    <dl className="work-record-meta"><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Period</dt><dd>{project.period}</dd></div><div><dt>Organization</dt><dd>{project.organization}</dd></div></dl>
    <section className="work-record-section"><p className="work-eyebrow">01 / Evidence &amp; outcomes</p><h2>What the work demonstrates.</h2><ul>{(project.impact || [project.description]).map(item => <li key={item}>{item}</li>)}</ul></section>
    {project.slug === "utopia-vinyl" && <><section className="work-record-section"><p className="work-eyebrow">02 / Design decisions</p><h2>Make the work easier for both sides.</h2><div className="work-decision-grid"><article><h3>Design for the seller</h3><p>Larger controls, photo previews, manual review, and on-demand assistance support a repeatable listing routine.</p></article><article><h3>Help buyers decide</h3><p>Record photography, edition and condition details, guest checkout, and a persistent cart reduce uncertainty before an order.</p></article><article><h3>Report results clearly</h3><p>Paid and awaiting-payment orders stay separate. Dated figures and scope notes make the evidence easier to assess.</p></article></div></section><section className="work-record-section"><p className="work-eyebrow">03 / Documentation history</p><h2>Latest published updates.</h2><p className="work-record-date">November 11, 2026 · Portfolio documentation</p><ol className="work-change-list">{changes.map(([title,body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ol></section></>}
    {project.sourceUrl && <a className="work-action" href={project.sourceUrl} target="_blank" rel="noreferrer">{project.sourceLabel || "View supporting material"} <span>↗</span></a>}
  </main>;
  const shown = projects.filter(p => filter === "All records" || (filter === "Ongoing" ? ongoing(p) : !ongoing(p)));
  return <main className="work-index main-content">
    <header className="work-index-hero"><div><p className="work-eyebrow">Public work record / 2026</p><h1>Project &amp;<br />Documentation Log</h1><p className="work-intro">The problems, design decisions, and evidence behind each project.</p></div><div className="work-hero-actions"><button className="work-action primary" onClick={() => scroll("project-records")}>Browse records <span>↓</span></button><a className="work-action" href={href("work")}>All projects <span>↗</span></a></div></header>
    <div className="work-log-summary"><span><strong>{projects.length}</strong> project records</span><span>Case studies &amp; supporting evidence</span><span>Utopia Vinyl · latest documentation: Nov 11, 2026</span></div>
    <section className="work-directory" id="project-records"><div className="work-directory-heading"><div><p className="work-eyebrow">01 / Project records</p><h2>Behind the work.</h2></div><span aria-live="polite">{shown.length} records</span></div><div className="work-filters" aria-label="Filter project records">{["All records","Ongoing","Completed"].map(f=><button key={f} aria-pressed={filter === f} onClick={()=>setFilter(f)}>{f}</button>)}</div><div className="work-record-grid">{shown.map(p=><article className="work-log-record" key={p.slug}><div className="work-record-top"><span>LOG-{String(projects.indexOf(p)+1).padStart(3,"0")}</span><span>{ongoing(p)?"Ongoing":"Completed"}</span></div><h3>{p.title}</h3><dl><dt>Design problem</dt><dd>{p.homeDescription || p.description}</dd><dt>My role</dt><dd>{p.role}</dd></dl><a href={href(`project-log/${p.slug}`)}>Open record ↗</a></article>)}</div></section>
  </main>;
}
