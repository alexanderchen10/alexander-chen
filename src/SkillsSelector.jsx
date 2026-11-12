import { useEffect, useRef, useState } from "react";
import "./SkillsSelector.css";

const categories = [
  {
    "id": "design",
    "title": "Design & digital experiences",
    "introduction": "Turning complex journeys into clear, useful interfaces.",
    "skills": [
      "UX research & user flows",
      "Figma",
      "Design systems",
      "Information architecture",
      "Website design",
      "Accessibility"
    ]
  },
  {
    "id": "marketing",
    "title": "Marketing & content strategy",
    "introduction": "Connecting audience insights, creative thinking, and commercial goals through measurable campaigns.",
    "skills": [
      "Campaign planning & retail launches",
      "Consumer & audience insights",
      "Brand strategy & positioning",
      "Analytical & creative thinking",
      "Commercial & strategic thinking",
      "Campaign performance analysis",
      "Email marketing",
      "Meta campaigns",
      "Sprout Social",
      "Google Analytics",
      "CRM & customer journeys",
      "Vendor & agency coordination"
    ]
  },
  {
    "id": "photography",
    "title": "Photography & production",
    "introduction": "Taking a visual story from the first idea through to the final edit.",
    "skills": [
      "Photography",
      "Video production",
      "DaVinci Resolve",
      "Lightroom",
      "Social-first storytelling",
      "Persuasive presentations & storytelling",
      "Creative direction"
    ]
  },
  {
    "id": "delivery",
    "title": "Delivery & operations",
    "introduction": "Taking projects from design to completion, aligning stakeholders, and turning plans into measurable results.",
    "skills": [
      "Stakeholder coordination & influence",
      "Cross-functional collaboration",
      "End-to-end project management",
      "Independent execution & prioritization",
      "Product development & enterprise support",
      "Critical paths, milestones & risk escalation",
      "Meeting facilitation & action items",
      "Portfolio reviews & process improvement",
      "SharePoint & asset governance",
      "Excel: macros, pivot tables & reporting",
      "Tableau & intermediate SQL",
      "PowerPoint & Word",
      "CRM platforms & Google Cloud Console",
      "Data storytelling"
    ]
  }
];

export default function SkillsSelector() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const sectionRef = useRef(null);
  const tabRefs = useRef([]);
  const panelRefs = useRef([]);
  const pinnedRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const scrollTargetRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const stage = section.querySelector(".skills-selector-stage");
    const desktop = window.matchMedia("(min-width: 1101px) and (min-height: 640px), (min-height: 600px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let settleTimer;
    let visible = false;

    function updateSelection() {
      frame = 0;
      if (!visible || !pinnedRef.current) return;

      const target = scrollTargetRef.current;
      if (target && Math.abs(window.scrollY - target.y) > 2 && performance.now() < target.until) return;
      if (target && Math.abs(window.scrollY - target.y) <= 2) {
        window.setTimeout(() => { if (scrollTargetRef.current === target) scrollTargetRef.current = null; }, 200);
      } else scrollTargetRef.current = null;

      const bounds = section.getBoundingClientRect();
      const travel = bounds.height - stage.offsetHeight;
      if (travel <= 0) return;

      const progress = Math.max(0, Math.min(1, -bounds.top / travel));
      const nextIndex = Math.min(categories.length - 1, Math.floor(progress * categories.length));
      // Do not hide the panel while a keyboard user is reading it.
      if (panelRefs.current.some(panel => panel?.contains(document.activeElement) && document.activeElement.matches(":focus-visible"))) return;
      setSelectedIndex(current => current === nextIndex ? current : nextIndex);
    }

    function requestUpdate() {
      if (visible && pinnedRef.current && !frame) frame = window.requestAnimationFrame(updateSelection);
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(settleChapter, 180);
    }

    function updateMode() {
      reducedMotionRef.current = reducedMotion.matches;
      pinnedRef.current = desktop.matches && !reducedMotion.matches;
      scrollTargetRef.current = null;
      requestUpdate();
    }

    function interruptScroll() {
      scrollTargetRef.current = null;
      requestUpdate();
    }

    // Settle within the current chapter after a scroll gesture ends.
    // Only the pinned section participates; entering and leaving remain free.
    function settleChapter() {
      if (!visible || !pinnedRef.current) return;
      const target = scrollTargetRef.current;
      if (target && performance.now() < target.until) {
        settleTimer = window.setTimeout(settleChapter, target.until - performance.now() + 20);
        return;
      }
      scrollTargetRef.current = null;
      if (panelRefs.current.some(panel => panel?.contains(document.activeElement) && document.activeElement.matches(":focus-visible"))) return;
      const bounds = section.getBoundingClientRect();
      const travel = bounds.height - stage.offsetHeight;
      if (travel <= 0 || bounds.top >= -40 || bounds.top <= -travel + 40) return;
      const progress = Math.max(0, Math.min(.999, -bounds.top / travel));
      const index = Math.floor(progress * categories.length);
      const y = window.scrollY + bounds.top + travel * ((index + .5) / categories.length);
      if (Math.abs(window.scrollY - y) < 3) return;
      scrollTargetRef.current = { y, until: performance.now() + 1400 };
      window.scrollTo({ top: y, behavior: "smooth" });
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      requestUpdate();
    });
    observer.observe(section);
    updateMode();
    section.addEventListener("focusout", requestUpdate);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("scrollend", settleChapter);
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("wheel", interruptScroll, { passive: true });
    window.addEventListener("touchstart", interruptScroll, { passive: true });
    window.addEventListener("pointerdown", interruptScroll, { passive: true });
    desktop.addEventListener("change", updateMode);
    reducedMotion.addEventListener("change", updateMode);

    return () => {
      window.clearTimeout(settleTimer);
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      section.removeEventListener("focusout", requestUpdate);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("scrollend", settleChapter);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("wheel", interruptScroll);
      window.removeEventListener("touchstart", interruptScroll);
      window.removeEventListener("pointerdown", interruptScroll);
      desktop.removeEventListener("change", updateMode);
      reducedMotion.removeEventListener("change", updateMode);
    };
  }, []);

  function selectCategory(index, keyboard = false) {
    setSelectedIndex(index);
    if (!pinnedRef.current) return;
    const section = sectionRef.current;
    const bounds = section.getBoundingClientRect();
    const travel = bounds.height - section.querySelector(".skills-selector-stage").offsetHeight;
    const y = window.scrollY + bounds.top + travel * ((index + .5) / categories.length);
    scrollTargetRef.current = { y, until: performance.now() + 1600 };
    window.scrollTo({ top: y, behavior: keyboard || reducedMotionRef.current ? "instant" : "smooth" });
  }

  function handleKeyDown(event, index) {
    let nextIndex;
    switch (event.key) {
      case "ArrowDown":
        nextIndex = (index + 1) % categories.length;
        break;
      case "ArrowUp":
        nextIndex = (index - 1 + categories.length) % categories.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = categories.length - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    selectCategory(nextIndex, true);
    tabRefs.current[nextIndex]?.focus({ preventScroll: true });
  }

  return (
    <section className="skills-selector" id="toolkits" aria-labelledby="toolkit-title" ref={sectionRef} style={{ "--skills-active": selectedIndex }}>
      <h2 id="toolkit-title" className="sr-only">What I work with.</h2>
      <div className="skills-selector-stage">
        <div className="skills-selector-layout">
          <div className="skills-selector-tabs" role="tablist" aria-label="Skills categories" aria-orientation="vertical">
            <span className="skills-selector-marker" aria-hidden="true" />
            {categories.map((category, index) => (
              <button
                type="button"
                key={category.id}
                id={`skills-tab-${category.id}`}
                className={`skills-selector-tab${selectedIndex === index ? " is-active" : ""}`}
                ref={element => { tabRefs.current[index] = element; }}
                role="tab"
                aria-selected={selectedIndex === index}
                aria-controls={`skills-panel-${category.id}`}
                tabIndex={selectedIndex === index ? 0 : -1}
                onClick={() => selectCategory(index)}
                onKeyDown={event => handleKeyDown(event, index)}
              >
                <span className="skills-selector-label">{category.title}</span>
              </button>
            ))}
          </div>
          <div className="skills-selector-panels">
            {categories.map((category, index) => {
              const active = selectedIndex === index;
              return (
                <div
                  key={category.id}
                  ref={element => { panelRefs.current[index] = element; }}
                  id={`skills-panel-${category.id}`}
                  className={`skills-selector-panel${active ? "" : " is-inactive"}`}
                  role="tabpanel"
                  aria-labelledby={`skills-tab-${category.id}`}
                  aria-hidden={!active}
                  inert={active ? undefined : true}
                  tabIndex={active ? 0 : -1}
                >
                  <p className="skills-selector-intro">{category.introduction}</p>
                  <ul className="skills-selector-grid">
                    {category.skills.map((skill, skillIndex) => <li key={skill} style={{ "--skill-order": skillIndex }}>{skill}</li>)}
                  </ul>
                  <p className="skills-selector-count">{category.skills.length} tools</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
