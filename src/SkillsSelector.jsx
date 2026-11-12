import { useRef, useState } from "react";
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
  const [focusedIndex, setFocusedIndex] = useState(0);
  const tabRefs = useRef([]);

  function selectCategory(index) {
    setSelectedIndex(index);
    setFocusedIndex(index);
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
    setFocusedIndex(nextIndex);
    tabRefs.current[nextIndex]?.focus({ preventScroll: true });
  }

  return (
    <section className="skills-selector" id="toolkits" aria-labelledby="toolkit-title" style={{ "--skills-active": selectedIndex }}>
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
                tabIndex={focusedIndex === index ? 0 : -1}
                onClick={() => selectCategory(index)}
                onFocus={() => setFocusedIndex(index)}
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
