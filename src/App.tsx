import { useState } from "react";
import IntroScreen from "./components/IntroScreen";
import ScenarioScreen from "./components/ScenarioScreen";
import RevealScreen from "./components/RevealScreen";
import ResultsScreen from "./components/ResultsScreen";
import { IconTarget } from "./components/icons";
import { scenarios } from "./data/scenarios";
import type { Decision, Phase, Response } from "./types";

export default function App() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [confidence, setConfidence] = useState(50);

  const scenario = scenarios[index];

  const start = () => setPhase("scenario");

  const submit = () => {
    if (decision === null) return;
    setResponses((prev) => [...prev, { scenarioId: scenario.id, decision, confidence }]);
    setPhase("reveal");
  };

  const next = () => {
    if (index + 1 >= scenarios.length) {
      setPhase("results");
      return;
    }
    setIndex((i) => i + 1);
    setDecision(null);
    setConfidence(50);
    setPhase("scenario");
  };

  const restart = () => {
    setPhase("intro");
    setIndex(0);
    setResponses([]);
    setDecision(null);
    setConfidence(50);
  };

  return (
    <div className="app">
      <header className="top-bar">
        <span className="logo-mark" aria-hidden="true">
          <IconTarget />
        </span>
        <span className="logo-name">Project Calibration</span>
        <span className="logo-badge">prototype</span>
        {phase !== "intro" && (
          <button className="btn-ghost btn-ghost-sm" onClick={restart}>
            Restart
          </button>
        )}
      </header>

      <main id="main">
        {phase === "intro" && <IntroScreen onStart={start} />}
        {phase === "scenario" && (
          <ScenarioScreen
            key={scenario.id}
            scenario={scenario}
            index={index}
            total={scenarios.length}
            decision={decision}
            confidence={confidence}
            onDecisionChange={setDecision}
            onConfidenceChange={setConfidence}
            onSubmit={submit}
          />
        )}
        {phase === "reveal" && (
          <RevealScreen
            key={`reveal-${scenario.id}`}
            scenario={scenario}
            response={responses[responses.length - 1]}
            isLast={index + 1 >= scenarios.length}
            onContinue={next}
          />
        )}
        {phase === "results" && <ResultsScreen responses={responses} onRestart={restart} />}
      </main>
    </div>
  );
}
