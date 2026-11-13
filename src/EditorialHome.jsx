import React, { useEffect, useRef, useState } from 'react';
import { profile, about, workProjects } from './data.js';
import './EditorialHome.css';

const live = '/';
const projectHref = slug => `#project/${slug}`;
const completeHref = projectHref;
const labelFor = slug => workProjects.find(project => project.slug === slug)?.title || slug;
const selectedWork = [
  { slug: 'utopia-vinyl', type: 'Product design + development', title: 'A record shop for my father.', description: 'A storefront for collectors. Listing tools my father can run himself.', image: '/projects/work/utopia-vinyl/utopia-vinyl-homepage-cover.webp', alt: 'Utopia Vinyl’s record shop home page', year: '2026 / Ongoing', className: 'draft-work-feature' },
  { slug: 'corcoran-oakville-grand-opening', type: 'AO Studio / Film + event coverage', title: 'Corcoran, on opening night.', description: 'Interviews, an office launch, and a film that brings the evening together.', image: '/projects/work/corcoran/oakville-grand-opening-poster.jpg', alt: 'An interview at Corcoran’s Oakville grand opening', year: '2026', className: 'draft-work-film' },
  { slug: '123dentist', type: 'AO Studio / Portrait photography', title: 'The people at 123Dentist.', description: 'Professional portraits for the marketing team and board of directors.', image: '/projects/work/123dentist/portrait-21.webp', alt: 'A professional portrait from the 123Dentist team session', year: '2026', className: 'draft-work-portrait' },
  { slug: 'veerah', type: 'AO Studio / Photography + co-writing', title: 'A conversation with Laura Huang.', description: 'An on-location interview and portrait story for VEERAH’s Warrior to Watch.', image: '/projects/work/veerah/veerah-13.webp', alt: 'Laura Huang beneath a clear umbrella, photographed for VEERAH', year: '2021', className: 'draft-work-veerah' },
];

const capabilities = [
  { title: 'Design', intro: 'From a rough idea to a working screen.', skills: ['User flows', 'Information architecture', 'Figma', 'Interface design', 'Prototyping', 'Usability feedback'] },
  { title: 'Production', intro: 'A camera, a conversation, and an edit.', skills: ['Portrait photography', 'On-location interviews', 'Event coverage', 'Video editing', 'Story development', 'Creative direction'] },
  { title: 'Content', intro: 'Helping people find what they need.', skills: ['Email campaigns', 'Employer brand', 'Social strategy', 'Content planning', 'SharePoint', 'Performance reporting'] },
];

function SectionLabel({ number, children }) {
  return <p className="draft-section-label"><span>{number}</span>{children}</p>;
}

function Header({ inProject }) {
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { setMenuOpen(false); }, [inProject]);
  const href = id => ({ work: '#projects', about: '#home-about' }[id] || `#${id}`);
  return <header className="draft-header">
    <a className="draft-brand" href="#top" aria-label="Alexander Chen, home" onClick={() => setMenuOpen(false)}>
      <img src="/branding/alexander-chen-continuous-beacon.gif" width="49" height="30" alt="" />
      <span>Alexander Chen</span>
    </a>
    <button className="draft-menu-toggle" aria-expanded={menuOpen} aria-controls="draft-nav" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? 'Close' : 'Menu'} <span aria-hidden="true">{menuOpen ? '−' : '+'}</span></button>
    <nav id="draft-nav" className={menuOpen ? 'is-open' : ''} aria-label="Main navigation">
      {['work', 'experience', 'about'].map(id => <a href={href(id)} key={id} onClick={() => setMenuOpen(false)}>{id[0].toUpperCase() + id.slice(1)}</a>)}
      <a href={`mailto:${profile.email}`}>Say hello <span aria-hidden="true">↗</span></a>
    </nav>
  </header>;
}

function Hero() {
  return <section className="draft-hero" aria-labelledby="draft-title">
    <div className="draft-hero-copy">
      <p className="draft-eyebrow"><span className="draft-status-dot" /> Digital design & creative production</p>
      <h1 id="draft-title">A designer<br />with a <em>camera.</em></h1>
      <p className="draft-hero-description">I’m Alexander, a designer and creative producer in Toronto. I’m building a record shop for my father and making films, portraits, and brand work through AO Studio.</p>
      <div className="draft-hero-links"><a href="#projects" className="draft-text-link">Take a look at my work <span aria-hidden="true">↓</span></a><a href="/resume.pdf" target="_blank" rel="noreferrer" className="draft-quiet-link">Résumé ↗</a></div>
    </div>
    <figure className="draft-portrait">
      <div className="draft-portrait-image"><img src={profile.hero.image} alt={profile.hero.imageAlt} fetchPriority="high" /></div>
      <figcaption><span>Usually behind the camera.</span><span>Toronto, ON</span></figcaption>
    </figure>
    <div className="draft-hero-bottom"><span>Design, films, portraits. A selection from 2021 to now.</span><span>Scroll to explore ↓</span></div>
  </section>;
}

function Work() {
  return <section id="work" className="draft-work" aria-labelledby="draft-work-title">
    <SectionLabel number="01">Selected work</SectionLabel>
    <div className="draft-section-heading"><h2 id="draft-work-title">A few things I’ve made.</h2><p>From a family record shop<br />to client films and portraits.</p></div>
    <div className="draft-work-grid">
      {selectedWork.map((project, index) => <a href={projectHref(project.slug)} className={`draft-work-item ${project.className}`} key={project.slug}>
        <div className="draft-work-image"><img src={project.image} alt={project.alt} loading="lazy" decoding="async" /><span className="draft-work-open" aria-hidden="true">↗</span>{index === 0 && <span className="draft-work-note">A family project, still growing</span>}</div>
        <div className="draft-work-meta"><span>{project.type}</span><span>{project.year}</span></div>
        <h3>{project.title}</h3><p>{project.description}</p>
      </a>)}
    </div>
    <aside id="home-ao-studio" className="draft-studio-note"><p><span className="draft-small-label">Through AO Studio</span>I founded AO Studio in 2019. Here’s more of the work I’ve made with clients.</p><a className="draft-text-link" href={`${live}#ao-studio`} >More studio work <span aria-hidden="true">↗</span></a></aside>
    <div id="home-collaborators" className="draft-collaborators"><p className="draft-small-label">A few teams I’ve worked with</p><div className="draft-client-names">{profile.collaborators.map(client => <span key={client.name}>{client.name}</span>)}</div></div>
  </section>;
}

function Experience() {
  return <section id="experience" className="draft-experience" aria-labelledby="draft-experience-title">
    <SectionLabel number="02">Along the way</SectionLabel>
    <div className="draft-section-heading"><h2 id="draft-experience-title">Experience.</h2><p>Creative work, marketing, and<br />a lot of learning by doing.</p></div>
    <div className="draft-experience-list">{about.experience.map((item, index) => <details id={`experience-role-${index}`} className="draft-experience-item" key={`${item.organization}-${item.period}`} open={index === 0 ? true : undefined}>
      <summary><span className="draft-experience-number">{String(index + 1).padStart(2, '0')}</span><span className="draft-experience-company"><strong>{item.organization}</strong><span>{item.period.replaceAll('–', ' - ')}<br />{item.location}</span></span><span className="draft-experience-role">{item.role}</span><span className="draft-experience-expand" aria-hidden="true" /></summary>
      <div className="draft-experience-content">
        <div className="draft-experience-projects">{item.projectSlugs?.length > 0 && <><p className="draft-small-label">Selected work</p>{item.projectSlugs.map(slug => <a href={selectedWork.some(item => item.slug === slug) ? projectHref(slug) : completeHref(slug)} key={slug}>{item.projectLabels?.[slug] || labelFor(slug)} <span aria-hidden="true">↗</span></a>)}</>}</div>
        <div className="draft-experience-details"><p>{item.summary}</p><ul>{item.highlights.map(highlight => <li key={highlight.value}><h4>{highlight.value}</h4><p>{highlight.detail}</p></li>)}</ul></div>
      </div>
    </details>)}</div>
    <a href="/resume.pdf" className="draft-text-link draft-resume" target="_blank" rel="noreferrer">Read the full résumé <span aria-hidden="true">↗</span></a>
  </section>;
}

function Capabilities() {
  const [active, setActive] = useState(0);
  const tabs = useRef([]);
  function navigate(event, index) {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % capabilities.length;
    if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index - 1 + capabilities.length) % capabilities.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = capabilities.length - 1;
    if (next !== undefined) {event.preventDefault(); setActive(next); tabs.current[next]?.focus();}
  }
  return <section id="toolkits" className="draft-capabilities" aria-labelledby="draft-capabilities-title"><div>
    <p className="draft-small-label" id="draft-capabilities-title">What I bring to a project</p>
    <div role="tablist" aria-label="Capabilities" aria-orientation="vertical" className="draft-skill-tabs">{capabilities.map((category, index) => <button role="tab" id={`draft-tab-${index}`} aria-selected={active === index} aria-controls={`draft-panel-${index}`} tabIndex={active === index ? 0 : -1} ref={element => tabs.current[index] = element} onClick={() => setActive(index)} onKeyDown={event => navigate(event,index)} key={category.title}><span aria-hidden="true">0{index + 1}</span>{category.title}<span aria-hidden="true">↗</span></button>)}</div>
    </div>{capabilities.map((category, index) => <div role="tabpanel" tabIndex={0} id={`draft-panel-${index}`} aria-labelledby={`draft-tab-${index}`} hidden={active !== index} key={category.title} className="draft-skill-panel"><h3>{category.intro}</h3><ul>{category.skills.map(skill => <li key={skill}>{skill}</li>)}</ul></div>)}</section>;
}

function CameraPlay() {
  const [aiming, setAiming] = useState(false);
  const [flash, setFlash] = useState(0);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  return <div id="home-playground" className="draft-play-note"><button className={`draft-camera ${aiming ? 'is-aiming' : ''}`} aria-label="Take a photo with Alex" onPointerEnter={event => {if (event.pointerType === 'mouse') setAiming(true);}} onPointerLeave={() => setAiming(false)} onClick={() => {setAiming(true);setFlash(value => value + 1);clearTimeout(timer.current);timer.current = setTimeout(() => setAiming(false), 1300);}}><img src={`/projects/about/alexander-chen-hero-natural-v2-${aiming ? 'aim' : 'idle'}.png`} alt="A small illustrated Alex holding a camera" loading="lazy" />{flash > 0 && <span className="draft-camera-flash" key={flash} aria-hidden="true" />}</button><div><p>A little room to play.</p><a href={`${live}#playground`} className="draft-text-link">Visit the playground <span aria-hidden="true">↗</span></a></div></div>;
}

function About() {
  return <section id="home-about" className="draft-about" aria-labelledby="draft-about-title"><SectionLabel number="03">A little about me</SectionLabel><div className="draft-about-grid"><h2 id="draft-about-title">Curiosity has taken me<br /> into a few different rooms.</h2><div className="draft-about-copy"><p>A record collection in Taiwan. A portrait session in an office. A festival opening night. I like work that gets me close to the people it’s for.</p><p>I studied Digital Enterprise Management at the University of Toronto and UX design at Juno. Today, I work across design, marketing, and photography, with AO Studio running alongside my in-house roles.</p><details id="home-education" className="draft-education"><summary>Education <span aria-hidden="true">+</span></summary>{about.education.map(item => <div key={item.school}><strong>{item.program}</strong><p>{item.school}<br />{item.period.replaceAll('–',' - ')}</p></div>)}</details><CameraPlay /></div></div></section>;
}

function Footer() {return <footer className="draft-footer"><p className="draft-small-label">Have something in mind?</p><a href={`mailto:${profile.email}`} className="draft-contact">Let’s talk. <span aria-hidden="true">↗</span></a><nav className="editorial-archive-links" aria-label="Explore the portfolio"><a href="#work">All projects ↗</a><a href="#ao-studio">AO Studio ↗</a><a href="#playground">Playground ↗</a><a href="#about">About ↗</a><a href="#education">Education ↗</a></nav><div className="draft-footer-bottom"><span>Alexander Chen / Toronto</span><div><a href={`mailto:${profile.email}`}>Email ↗</a><a href={profile.socials[0].href} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="/resume.pdf" target="_blank" rel="noreferrer">Résumé ↗</a></div><span>© {new Date().getFullYear()}</span></div></footer>;}

export default function EditorialHome() {
  return <div className="editorial-page"><a className="draft-skip" href="#draft-main">Skip to content</a><Header /><main id="draft-main" tabIndex={-1}><div id="top" /><Hero /><Work /><Experience /><Capabilities /><About /></main><Footer /></div>;
}
