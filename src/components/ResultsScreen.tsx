import { useEffect } from "react";
import type { Decision, Response } from "../types";
import { scenarios } from "../data/scenarios";
import { computeResults, idealShort, scoreBand } from "../lib/scoring";
import { DECISION_META } from "../lib/meta";
import { ICONS } from "./icons";
import ScoreGauge from "./ScoreGauge";

interface Props {
  responses: Response[];
  onRestart: () => void;
}

function DecisionChip({ decision }: { decision: Decision }) {
  const meta = DECISION_META[decision];
  const Icon = ICONS[meta.icon];
  return (
    <span className={`mini-chip c-${decision}`}>
      <Icon /> {meta.label}
    </span>
  );
}

export default function ResultsScreen({ responses, onRestart }: Props) {
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const r = computeResults(responses, scenarios);
  const band = scoreBand(r.calibrationScore);

  const pct = (count: number, total: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

  return (
    <section className="fade-in results" aria-labelledby="results-heading">
      <h2 id="results-heading" className="screen-title">
        Your calibration profile
      </h2>

      <div className="card hero-card">
        <ScoreGauge score={r.calibrationScore} />
        <div className="hero-copy">
          <p className="score-band">
            <span className="score-band-pill">{band.label}</span>
          </p>
          <h3 className="score-title">Calibration score</h3>
          <p className="score-exp">{band.blurb}</p>
          <details className="how">
            <summary>How this score works</summary>
            <div className="how-body">
              <p>
                Each answer is worth 0–100 points: <strong>+70</strong> for the right call,{" "}
                <strong>+40</strong> for a cautious call (verifying a reliable answer),{" "}
                <strong>+25</strong> for a wrong call. Then confidence adjusts the score by up to{" "}
                <strong>±30</strong>: you gain points for being confident when right, and lose them
                for being confident when wrong. Your score is the average across all 7 answers.
              </p>
            </div>
          </details>
        </div>
      </div>

      <div className="stat-grid">
        <div className="card stat">
          <p className="lbl">Overtrust</p>
          <p className="big">
            {r.overtrustCount} <span className="of">of {r.overtrustOpportunities}</span>
          </p>
          <div className="stat-bar" aria-hidden="true">
            <div className="stat-bar-fill bad" style={{ width: `${pct(r.overtrustCount, r.overtrustOpportunities)}%` }} />
          </div>
          <p className="exp">times you trusted an answer that wasn't fully reliable · lower is better</p>
        </div>
        <div className="card stat">
          <p className="lbl">Undertrust</p>
          <p className="big">
            {r.undertrustCount} <span className="of">of {r.undertrustOpportunities}</span>
          </p>
          <div className="stat-bar" aria-hidden="true">
            <div className="stat-bar-fill bad" style={{ width: `${pct(r.undertrustCount, r.undertrustOpportunities)}%` }} />
          </div>
          <p className="exp">times you rejected an answer that wasn't unreliable · lower is better</p>
        </div>
        <div className="card stat">
          <p className="lbl">Appropriate verification</p>
          <p className="big">
            {r.appropriateVerificationCount} <span className="of">of {r.verificationOpportunities}</span>
          </p>
          <div className="stat-bar" aria-hidden="true">
            <div
              className="stat-bar-fill good"
              style={{ width: `${pct(r.appropriateVerificationCount, r.verificationOpportunities)}%` }}
            />
          </div>
          <p className="exp">times you verified when caution was warranted · higher is better</p>
        </div>
        <div className="card stat">
          <p className="lbl">Confidence behavior</p>
          <p className="big-split">
            <span>
              <span className="split-num ok">{r.avgConfidenceCorrect ?? "—"}%</span>
              <span className="split-lbl">when right</span>
            </span>
            <span>
              <span className="split-num bad-num">{r.avgConfidenceIncorrect ?? "—"}%</span>
              <span className="split-lbl">when wrong</span>
            </span>
          </p>
          <p className="exp">average confidence on ideal vs wrong calls · cautious calls aren't counted</p>
        </div>
      </div>

      <div className="card profile">
        <p className="profile-kicker">Your pattern</p>
        <h3 className="profile-name">{r.profile.name}</h3>
        {r.profile.lines.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>

      <div className="card table-card">
        <h3>Answer by answer</h3>
        <div className="table-wrap">
          <table className="answers">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Topic</th>
                <th scope="col">Your call</th>
                <th scope="col">Ideal</th>
                <th scope="col">Confidence</th>
                <th scope="col">Points</th>
              </tr>
            </thead>
            <tbody>
              {r.perScenario.map((p, i) => (
                <tr key={p.scenario.id}>
                  <td>{i + 1}</td>
                  <td>{p.scenario.category}</td>
                  <td>
                    <DecisionChip decision={p.response.decision} />
                  </td>
                  <td>{idealShort(p.scenario)}</td>
                  <td>{p.response.confidence}%</td>
                  <td className="pts">{p.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="results-actions">
        <button className="btn-primary" onClick={onRestart}>
          Start over
        </button>
      </div>

      <p className="disclaimer">Hackathon prototype — educational feedback, not a psychological assessment.</p>
    </section>
  );
}
