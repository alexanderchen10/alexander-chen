import { useEffect, useRef, useState } from "react";
import "./SkillsSelector.css";

const categories = [
  {
    id: "ai",
    title: "AI systems & agents",
    introduction: "Designing where AI helps, where rules decide, and where a person signs off.",
    skills: [
      "Claude Code Skills & agent teams",
      "Agent instructions & structured outputs",
      "Human-in-the-loop review",
      "Evaluation (DeepEval)",
      "Multi-model testing",
      "RAG fundamentals",
      "Local models (Ollama)",
      "Python · SQL",
    ],
  },
  {
    id: "product",
    title: "Product & build",
    introduction: "Taking a fuzzy idea to a prototype people can click.",
    skills: [
      "Problem framing & PRDs",
      "User flows & edge states",
      "React · TypeScript",
      "Figma",
      "Accessibility review",
      "Git · Docker",
    ],
  },
  {
    id: "games",
    title: "Games & 3D",
    introduction: "Where I stress-test AI-directed production end to end.",
    skills: [
      "Godot · GDScript",
      "React Three Fiber · three.js",
      "Blender Python pipelines",
      "Procedural audio",
      "Test-driven game QA",
      "Playwright visual QA",
    ],
  },
  {
    id: "finance",
    title: "Finance operations",
    introduction: "The domain my AI work is grounded in.",
    skills: [
      "Reconciliation & exceptions",
      "Month-end close controls",
      "Journal entry preparation",
      "Driver-based forecasts & variance analysis",
      "Internal controls & audit trail",
      "Structured data contracts & validation",
      "Excel · Power BI · SQL · Python",
      "English · Mandarin",
    ],
  },
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
    const desktop = window.matchMedia("(min-width: 1101px) and (min-height: 640px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let visible = false;

    function updateSelection() {
      frame = 0;
      if (!visible || !pinnedRef.current) return;

      const target = scrollTargetRef.current;
      if (target && Math.abs(window.scrollY - target.y) > 2 && performance.now() < target.until) return;
      scrollTargetRef.current = null;

      const bounds = section.getBoundingClientRect();
      const travel = bounds.height - stage.offsetHeight;
      if (travel <= 0) return;

      const progress = Math.max(0, Math.min(1, -bounds.top / travel));
      const nextIndex = Math.min(categories.length - 1, Math.floor(progress * categories.length));
      // Do not hide the panel while a keyboard user is reading it.
      if (panelRefs.current.some(panel => panel?.contains(document.activeElement))) return;
      setSelectedIndex(current => current === nextIndex ? current : nextIndex);
    }

    function requestUpdate() {
      if (visible && pinnedRef.current && !frame) frame = window.requestAnimationFrame(updateSelection);
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

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      requestUpdate();
    });
    observer.observe(section);
    updateMode();
    section.addEventListener("focusout", requestUpdate);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("wheel", interruptScroll, { passive: true });
    window.addEventListener("touchstart", interruptScroll, { passive: true });
    window.addEventListener("pointerdown", interruptScroll, { passive: true });
    desktop.addEventListener("change", updateMode);
    reducedMotion.addEventListener("change", updateMode);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      section.removeEventListener("focusout", requestUpdate);
      window.removeEventListener("scroll", requestUpdate);
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
