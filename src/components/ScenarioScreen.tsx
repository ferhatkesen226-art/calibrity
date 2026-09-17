import { useEffect } from "react";
import type { Decision, Scenario } from "../types";
import { DECISION_META } from "../lib/meta";
import { ICONS } from "./icons";
import { confidenceBand } from "../lib/scoring";

const DECISIONS: Decision[] = ["trust", "verify", "reject"];

interface Props {
  scenario: Scenario;
  index: number;
  total: number;
  decision: Decision | null;
  confidence: number;
  onDecisionChange: (d: Decision) => void;
  onConfidenceChange: (c: number) => void;
  onSubmit: () => void;
}

export default function ScenarioScreen({
  scenario,
  index,
  total,
  decision,
  confidence,
  onDecisionChange,
  onConfidenceChange,
  onSubmit,
}: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const band = confidenceBand(confidence);

  return (
    <section className="fade-in" aria-labelledby="scenario-heading">
      <div className="progress-row">
        <h2 id="scenario-heading" className="progress-label">
          Question {index + 1} <span className="muted">of {total}</span>
        </h2>
        <span className="chip">{scenario.category}</span>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={index + 1}
        aria-label={`Question ${index + 1} of ${total}`}
      >
        <div className="progress-fill" style={{ width: `${(index / total) * 100}%` }} />
      </div>

      <div className="q-bubble">
        <p className="who">You asked</p>
        <p className="q-text">{scenario.question}</p>
      </div>

      <div className="ai-card">
        <div className="ai-head">
          <span className="ai-avatar" aria-hidden="true">
            {ICONS.spark({ width: "0.9em", height: "0.9em" })}
          </span>
          <span>AI answer</span>
          <span className="ai-note">simulated</span>
        </div>
        <div className="ai-body">
          <p>{scenario.aiAnswer}</p>
        </div>
      </div>

      <fieldset className="decision">
        <legend>What would you do with this answer?</legend>
        <div className="choice-grid">
          {DECISIONS.map((d) => {
            const meta = DECISION_META[d];
            const Icon = ICONS[meta.icon];
            return (
              <label className="choice" key={d}>
                <input
                  type="radio"
                  name="decision"
                  value={d}
                  checked={decision === d}
                  onChange={() => onDecisionChange(d)}
                />
                <span className={`choice-inner t-${d}${decision === d ? " selected" : ""}`}>
                  <Icon className="choice-icon" />
                  <span className="choice-label">{meta.label}</span>
                  <span className="choice-hint">{meta.hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="confidence">
        <div className="conf-head">
          <label htmlFor="confidence-slider">How confident are you in that call?</label>
          <span className="conf-value">
            {confidence}<span className="conf-pct">%</span>
            <span className={`conf-band b-${band.toLowerCase()}`}>{band}</span>
          </span>
        </div>
        <input
          id="confidence-slider"
          type="range"
          min={0}
          max={100}
          step={5}
          value={confidence}
          onChange={(e) => onConfidenceChange(Number(e.target.value))}
          aria-valuetext={`${confidence} percent, ${band.toLowerCase()} confidence`}
        />
        <div className="conf-labels" aria-hidden="true">
          <span>0 · a guess</span>
          <span>50 · unsure</span>
          <span>100 · certain</span>
        </div>
      </div>

      <div className="submit-row">
        <button className="btn-primary" onClick={onSubmit} disabled={decision === null}>
          Submit answer
        </button>
        {decision === null && (
          <span className="hint-required">Choose Trust, Verify, or Reject to continue</span>
        )}
      </div>
    </section>
  );
}
