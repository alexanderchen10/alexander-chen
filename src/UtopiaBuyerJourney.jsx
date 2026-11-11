import { useEffect, useId, useRef, useState } from "react";
import "./UtopiaBuyerJourney.css";

const buyerSteps = [
  { title: "Browse records", description: "Open details or add an LP directly from its listing." },
  { title: "Review one combined cart", description: "Keep selected LPs while browsing, then check out together." },
  { title: "Choose how to check out", choices: true },
];

export default function UtopiaBuyerJourney() {
  const stepRefs = useRef([]);
  const [scrollStep, setScrollStep] = useState(0);
  const [hoveredStep, setHoveredStep] = useState(null);
  const [focusedStep, setFocusedStep] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const journeyId = useId();
  const activeStep = focusedStep ?? hoveredStep ?? selectedStep ?? scrollStep;

  useEffect(() => {
    const visibleSteps = new Set();
    let currentStep = 0;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) visibleSteps.add(entry.target);
        else visibleSteps.delete(entry.target);
      });
      const focusLine = window.innerHeight * .54;
      const nearest = stepRefs.current
        .map((element, index) => ({ element, index }))
        .filter(({ element }) => visibleSteps.has(element))
        .sort((first, second) => {
          const distance = ({ element }) => {
            const bounds = element.getBoundingClientRect();
            return Math.abs(bounds.top + bounds.height / 2 - focusLine);
          };
          return distance(first) - distance(second);
        })[0];
      if (nearest && nearest.index !== currentStep) {
        currentStep = nearest.index;
        setScrollStep(currentStep);
        setSelectedStep(null);
      }
    }, { rootMargin: "-28% 0px -20% 0px", threshold: [0, .2, .5, .8, 1] });
    stepRefs.current.forEach((step) => step && observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="utopia-buyer-journey">
      <div className="utopia-buyer-journey-inner">
        <header className="utopia-buyer-journey-heading">
          <p>Buyer journey / Checkout choice</p>
          <h3>A clear path, with or without an account.</h3>
          <p>Guest checkout and optional sign-in share the same cart.</p>
        </header>

        <ol className="utopia-buyer-journey-steps">
          {buyerSteps.map((step, index) => (
            <li
              key={step.title}
              ref={(element) => { stepRefs.current[index] = element; }}
              className={activeStep === index ? "is-active" : ""}
              onPointerEnter={(event) => { if (event.pointerType !== "touch") setHoveredStep(index); }}
              onPointerLeave={() => setHoveredStep(null)}
            >
              <button
                className="utopia-buyer-step-select"
                type="button"
                aria-label={`Highlight step ${String(index + 1).padStart(2, "0")}: ${step.title}`}
                aria-describedby={`${journeyId}-step-${index}`}
                aria-pressed={activeStep === index}
                onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setFocusedStep(index); }}
                onBlur={() => setFocusedStep(null)}
                onClick={() => setSelectedStep(index)}
              />
              <span className="utopia-buyer-step-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <div className="utopia-buyer-step-copy">
                <h4>{step.title}</h4>
                <div id={`${journeyId}-step-${index}`}>
                  {step.description && <p>{step.description}</p>}
                  {step.choices && (
                    <div className="utopia-buyer-checkout-choices">
                      <div>
                        <strong>Guest checkout</strong>
                        <span>No account required</span>
                      </div>
                      <div>
                        <strong>Sign in</strong>
                        <span>Optional for returning customers</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p className="utopia-buyer-journey-note">The cart stays intact when moving between browsing, sign-in, and checkout.</p>
      </div>
    </div>
  );
}
