import { useEffect } from "react";
import type { Response, Scenario } from "../types";
import { DECISION_META, TRUTH_META } from "../lib/meta";
import { ICONS } from "./icons";
import { confidenceBand, feedbackFor, idealLabel, scoreBreakdown } from "../lib/scoring";

interface Props {
  scenario: Scenario;
  response: Response;
  isLast: boolean;
  onContinue: () => void;
}

export default function RevealScreen({ scenario, response, isLast, onContinue }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const bd = scoreBreakdown(scenario, response);
  const truth = TRUTH_META[scenario.truthState];
  const meta = DECISION_META[response.decision];
  const TruthIcon = ICONS[truth.icon];
  const DecisionIcon = ICONS[meta.icon];

  return (
    <section className="fade-in" aria-live="polite">
      <div className={`verdict v-${scenario.truthState}`}>
        <span className="verdict-icon">
          <TruthIcon />
        </span>
        <div>
          <h2 className="verdict-title">{truth.label}</h2>
          <p className="verdict-sub">{truth.line}</p>
        </div>
      </div>

      <div className="card reveal-card">
        <h3>Why</h3>
        <p>{scenario.explanation}</p>
        <div className="tag-row">
          {scenario.tags.map((t) => (
            <span key={t} className="chip">#{t}</span>
          ))}
        </div>
      </div>

      <div className="card reveal-card">
        <div className="your-call">
          <span className={`mini-chip c-${response.decision}`}>
            <DecisionIcon /> You chose {meta.label}
          </span>
          <span className="conf-note">
            at <strong>{response.confidence}%</strong> confidence ({confidenceBand(response.confidence).toLowerCase()})
          </span>
        </div>
        <div className="points-row">
          <span className="pt">Decision +{bd.base}</span>
          <span className="pt">
            Confidence {bd.modifier >= 0 ? "+" : "−"}
            {Math.abs(bd.modifier)}
          </span>
          <span className="pt pt-total">{bd.score} / 100 pts</span>
          {bd.raw < 0 && <span className="pt-note">floored at 0</span>}
        </div>
        <p className="ideal-note">Ideal move: {idealLabel(scenario)}</p>
      </div>

      <div className="feedback-callout">
        <span className="fb-icon" aria-hidden="true">
          {ICONS.spark({})}
        </span>
        <p>{feedbackFor(scenario, response)}</p>
      </div>

      <div className="submit-row">
        <button className="btn-primary" onClick={onContinue} autoFocus>
          {isLast ? "See my results" : "Next question"}
        </button>
      </div>
    </section>
  );
}
