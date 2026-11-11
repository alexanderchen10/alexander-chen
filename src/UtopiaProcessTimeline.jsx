import { useEffect, useId, useRef, useState } from "react";
import "./UtopiaProcessTimeline.css";

const timelines = {
  collection: {
    eyebrow: "Collection / From prototype to catalogue",
    title: "A record becomes a listing.",
    explored: "Empty catalogue prototype",
    chosen: "Photo-led, shoppable listings",
    reason: "A clear photo and the essential facts help buyers choose a record.",
    steps: [
      { label: "Photograph LP", detail: "Show the actual record and sleeve so buyers can inspect what they are choosing." },
      { label: "Add record details", detail: "Bring the performer, catalogue number, condition, and price together in one listing." },
      { label: "Publish listing", detail: "Make the record discoverable, with details and a direct add-to-cart action." },
    ],
  },
  model: {
    eyebrow: "Commerce / The chosen route",
    title: "One store. Four clear handoffs.",
    explored: "Shopify integration",
    chosen: "Independent storefront + bank transfer",
    reason: "Lower ongoing costs and fewer constraints for our Taiwan workflow.",
    steps: [
      { label: "Storefront", detail: "Browse records and build a cart." },
      { label: "Order", detail: "Submit details and reserve LPs." },
      { label: "Tim", detail: "Confirm the bank transfer." },
      { label: "Fulfilment", detail: "Update and ship the order." },
    ],
  },
};

export default function UtopiaProcessTimeline({ kind = "model" }) {
  const timeline = timelines[kind] || timelines.model;
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const root = useRef(null);
  const id = useId();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, { threshold: .15 });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);

  const focusStep = (event, index) => {
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % timeline.steps.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + timeline.steps.length) % timeline.steps.length;
    else return;
    event.preventDefault();
    root.current?.querySelectorAll(".utopia-process-step")[next]?.focus({ preventScroll: true });
    setActive(next);
  };

  return (
    <div className={`utopia-process-timeline${inView ? " is-visible" : ""}`} ref={root} style={{ "--process-progress": `${(active + 1) / timeline.steps.length * 100}%`, "--process-count": timeline.steps.length }}>
      <div className="utopia-process-inner">
        <header className="utopia-process-heading">
          <p>{timeline.eyebrow}</p>
          <h3>{timeline.title}</h3>
        </header>

        <dl className="utopia-process-decisions">
          <div><dt>Explored</dt><dd>{timeline.explored}</dd></div>
          <div><dt>Chosen</dt><dd>{timeline.chosen}</dd></div>
        </dl>
        <p className="utopia-process-reason">{timeline.reason}</p>

        <p className="utopia-process-hint">Follow the steps <span aria-hidden="true">↓</span></p>
        <ol className="utopia-process-track" aria-label={`${kind === "collection" ? "Listing" : "Commerce"} timeline`}>
          {timeline.steps.map((step, index) => (
            <li key={step.label} className={index <= active ? "is-reached" : ""}>
              <button type="button" className="utopia-process-step" aria-pressed={index === active} aria-controls={`${id}-detail`} onPointerEnter={(event) => { if (event.pointerType === "mouse") setActive(index); }} onFocus={() => setActive(index)} onClick={() => setActive(index)} onKeyDown={(event) => focusStep(event, index)}>
                <span className="utopia-process-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span>{step.label}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="utopia-process-detail" id={`${id}-detail`} role="status" aria-live="polite" aria-atomic="true">
          <span className="utopia-process-detail-index" aria-hidden="true">{String(active + 1).padStart(2, "0")}</span>
          <div><strong>{timeline.steps[active].label}</strong><p>{timeline.steps[active].detail}</p></div>
        </div>
      </div>
    </div>
  );
}
