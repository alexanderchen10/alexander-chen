import { initAnalytics } from "./analytics";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./elevation.css";
import "./ProjectPresentation.css";
import "./FlowDraft.css";
import "./FlowSections.css";
import "./PortfolioNavigation.css";
import "./ReferencePaper.css";
import "./ReferencePaperSections.css";
import "./StudioFlow.css";
import "./StudioFlowProjects.css";
import "./StudioFlowSections.css";

initAnalytics();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

