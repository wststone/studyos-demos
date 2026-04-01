import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import { Layout } from "./layout";
import { CatalogPage } from "./pages/catalog";
import { ParagraphStructureMap } from "./demos/paragraph-structure-map";
import { HighlightEvidence } from "./demos/highlight-evidence";
import { ConceptMapBuilder } from "./demos/concept-map-builder";
import { TrueFalseJustify } from "./demos/true-false-justify";
import { ScenarioDecision } from "./demos/scenario-decision";
import { ErrorCorrection } from "./demos/error-correction";
import { ExplainYourThinking } from "./demos/explain-your-thinking";
import { VoiceStorytelling } from "./demos/voice-storytelling";
import { TimedWriting } from "./demos/timed-writing";
import { EquationBuilder } from "./demos/equation-builder";
import { GraphPlotter } from "./demos/graph-plotter";
import { FractionManipulator } from "./demos/fraction-manipulator";
import { SpacedRepetitionTracker } from "./demos/spaced-repetition-tracker";
import { RapidFireQuiz } from "./demos/rapid-fire-quiz";
import { MemoryGrid } from "./demos/memory-grid";
import { ProgressPath } from "./demos/progress-path";
import { BossChallenge } from "./demos/boss-challenge";
import { DebateModule } from "./demos/debate-module";
import { MisconceptionDetector } from "./demos/misconception-detector";
import { BranchingStoryLearning } from "./demos/branching-story-learning";
import { TimelineBuilder } from "./demos/timeline-builder";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<CatalogPage />} />
          <Route path="paragraph-structure-map" element={<ParagraphStructureMap />} />
          <Route path="highlight-evidence" element={<HighlightEvidence />} />
          <Route path="concept-map-builder" element={<ConceptMapBuilder />} />
          <Route path="true-false-justify" element={<TrueFalseJustify />} />
          <Route path="scenario-decision" element={<ScenarioDecision />} />
          <Route path="error-correction" element={<ErrorCorrection />} />
          <Route path="explain-your-thinking" element={<ExplainYourThinking />} />
          <Route path="voice-storytelling" element={<VoiceStorytelling />} />
          <Route path="timed-writing" element={<TimedWriting />} />
          <Route path="equation-builder" element={<EquationBuilder />} />
          <Route path="graph-plotter" element={<GraphPlotter />} />
          <Route path="fraction-manipulator" element={<FractionManipulator />} />
          <Route path="spaced-repetition-tracker" element={<SpacedRepetitionTracker />} />
          <Route path="rapid-fire-quiz" element={<RapidFireQuiz />} />
          <Route path="memory-grid" element={<MemoryGrid />} />
          <Route path="progress-path" element={<ProgressPath />} />
          <Route path="boss-challenge" element={<BossChallenge />} />
          <Route path="debate-module" element={<DebateModule />} />
          <Route path="misconception-detector" element={<MisconceptionDetector />} />
          <Route path="branching-story-learning" element={<BranchingStoryLearning />} />
          <Route path="timeline-builder" element={<TimelineBuilder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
