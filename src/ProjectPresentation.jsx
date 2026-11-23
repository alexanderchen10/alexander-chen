export function ProjectHero({
  id,
  title,
  titleId,
  eyebrow,
  status,
  description,
  backHref,
  backLabel,
  onBack,
  media,
  counter,
  meta = [],
  actions,
  publishedArticle,
  mediaFit = "cover",
  mediaPosition = "center",
  mediaPresentation,
  mediaAspect,
}) {
  const returnLabel = typeof backLabel === "string" && /^back\s+to\s+/i.test(backLabel)
    ? backLabel
    : <>Back to {backLabel || "selected work"}</>;

  return (
    <>
    <header
      className="immersive-project-hero project-presentation-hero"
      id={id}
      aria-labelledby={titleId}
      data-project-template="corcoran"
    >
      <div
        className={`immersive-project-hero-media project-presentation-hero-media${mediaPresentation === "player" ? " project-presentation-hero-media-playable" : ""}${mediaAspect ? " project-presentation-hero-media-framed" : ""}`}
        style={{ "--project-media-fit": mediaFit, "--project-media-position": mediaPosition, "--project-media-aspect": mediaAspect }}
      >
        {media}
        {counter && mediaPresentation !== "player" && !mediaAspect && <span className="immersive-project-counter" aria-hidden="true">{counter}</span>}
      </div>
      <div className="immersive-project-hero-copy project-presentation-hero-copy">
        {backHref && (
          <a className="case-study-back" href={backHref} onClick={onBack}>
            {returnLabel}
          </a>
        )}
        {(eyebrow || status) && <p className="project-presentation-eyebrow">{status && <span className="case-study-status">{status}</span>}{eyebrow}</p>}
        <h1 id={titleId}>{title}</h1>
        {description && <div className="case-study-intro">{description}</div>}
        {publishedArticle && (
          <p className="project-presentation-publication-meta">
            <span>{publishedArticle.publisher}</span>
            <time dateTime={publishedArticle.dateTime}>{publishedArticle.date}</time>
          </p>
        )}
        {actions && <div className="immersive-project-actions project-presentation-actions">{actions}</div>}
      </div>
    </header>
    {meta.length > 0 && (
      <dl className="project-presentation-meta" aria-label={`${title} project details`}>
        {meta.map((item, index) => <div key={`${item.label}-${index}`}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
      </dl>
    )}
    </>
  );
}

export function ProjectCollectionCard({ href, onClick, media, number, eyebrow, title, description }) {
  return (
    <a className="project-presentation-card" href={href} onClick={onClick}>
      <figure>{media}</figure>
      {number && <span className="project-presentation-card-number" aria-hidden="true">{number}</span>}
      <div>
        {eyebrow && <p>{eyebrow}</p>}
        <h3>{title}</h3>
        {description && <small>{description}</small>}
      </div>
      <b className="project-presentation-card-open" aria-hidden="true">↗</b>
    </a>
  );
}
