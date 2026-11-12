import { useRef, useState } from "react";
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
