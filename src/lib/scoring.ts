import type { Decision, Response, Scenario, TruthState } from "../types";

/* ---------------------------------------------------------------------------
 * Scoring model (designed to be explained in ~60 seconds)
 *
 * Every scenario is worth 0–100 points:
 *   1. Decision points (the call you make):
 *        Right call ......... +70   (trust reliable · verify uncertain · reject/verify unreliable)
 *        Cautious call ...... +40   (verify a reliable answer — safe, but you miss good info)
 *        Wrong call ......... +25   (anything else)
 *   2. Confidence adjustment (−30 … +30):
 *        Right call ......... + (confidence × 0.3)   — be confident when you're right
 *        Wrong call ......... − (confidence × 0.3)   — confident mistakes hurt most
 *        Cautious call ...... no change
 *   Per-scenario totals are clamped to 0–100; the Calibration Score is the average.
 * ------------------------------------------------------------------------- */

export const IDEAL_ACTIONS: Record<TruthState, Decision[]> = {
  reliable: ["trust"],
  uncertain: ["verify"],
  unreliable: ["reject", "verify"], // rejecting is ideal; verifying also catches it
};

export type Tier = "ideal" | "cautious" | "wrong";

export function decisionTier(scenario: Scenario, decision: Decision): Tier {
  if (IDEAL_ACTIONS[scenario.truthState].includes(decision)) return "ideal";
  if (scenario.truthState === "reliable" && decision === "verify") return "cautious";
  return "wrong";
}

export interface ScoreBreakdown {
  tier: Tier;
  base: number;
  modifier: number;
  raw: number;
  score: number; // clamped 0–100
}

export function scoreBreakdown(scenario: Scenario, response: Response): ScoreBreakdown {
  const tier = decisionTier(scenario, response.decision);
  const base = tier === "ideal" ? 70 : tier === "cautious" ? 40 : 25;
  const modifier =
    tier === "ideal"
      ? Math.round(response.confidence * 0.3)
      : tier === "wrong"
        ? -Math.round(response.confidence * 0.3)
        : 0;
  const raw = base + modifier;
  return { tier, base, modifier, raw, score: Math.max(0, Math.min(100, raw)) };
}

export function scoreResponse(scenario: Scenario, response: Response): number {
  return scoreBreakdown(scenario, response).score;
}

/* --------------------------- Signal classification ------------------------ */

export function isOvertrust(scenario: Scenario, decision: Decision): boolean {
  return decision === "trust" && scenario.truthState !== "reliable";
}

export function isUndertrust(scenario: Scenario, decision: Decision): boolean {
  return decision === "reject" && scenario.truthState !== "unreliable";
}

export function isAppropriateVerification(scenario: Scenario, decision: Decision): boolean {
  return decision === "verify" && scenario.truthState !== "reliable";
}

/* ------------------------------ Aggregation ------------------------------- */

export interface PerScenarioResult {
  scenario: Scenario;
  response: Response;
  tier: Tier;
  score: number;
  overtrust: boolean;
  undertrust: boolean;
  appropriateVerification: boolean;
}

export interface Profile {
  name: string;
  lines: string[];
}

export interface Results {
  calibrationScore: number; // 0–100
  overtrustCount: number;
  overtrustOpportunities: number;
  undertrustCount: number;
  undertrustOpportunities: number;
  appropriateVerificationCount: number;
  verificationOpportunities: number;
  avgConfidenceCorrect: number | null; // when decision was ideal
  avgConfidenceIncorrect: number | null; // when decision was wrong (cautious excluded)
  perScenario: PerScenarioResult[];
  profile: Profile;
}

export function computeResults(responses: Response[], scenarios: Scenario[]): Results {
  const perScenario: PerScenarioResult[] = responses.map((response) => {
    const scenario = scenarios.find((s) => s.id === response.scenarioId);
    if (!scenario) throw new Error(`No scenario found for response ${response.scenarioId}`);
    const { tier, score } = scoreBreakdown(scenario, response);
    return {
      scenario,
      response,
      tier,
      score,
      overtrust: isOvertrust(scenario, response.decision),
      undertrust: isUndertrust(scenario, response.decision),
      appropriateVerification: isAppropriateVerification(scenario, response.decision),
    };
  });

  const calibrationScore = perScenario.length
    ? Math.round(perScenario.reduce((sum, p) => sum + p.score, 0) / perScenario.length)
    : 0;

  const overtrustOpportunities = scenarios.filter((s) => s.truthState !== "reliable").length;
  const undertrustOpportunities = scenarios.filter((s) => s.truthState !== "unreliable").length;
  const verificationOpportunities = overtrustOpportunities; // verify is credited on any non-reliable answer

  const ideal = perScenario.filter((p) => p.tier === "ideal");
  const wrong = perScenario.filter((p) => p.tier === "wrong");
  const avg = (list: PerScenarioResult[]) =>
    list.length ? Math.round(list.reduce((s, p) => s + p.response.confidence, 0) / list.length) : null;

  return {
    calibrationScore,
    overtrustCount: perScenario.filter((p) => p.overtrust).length,
    overtrustOpportunities,
    undertrustCount: perScenario.filter((p) => p.undertrust).length,
    undertrustOpportunities,
    appropriateVerificationCount: perScenario.filter((p) => p.appropriateVerification).length,
    verificationOpportunities,
    avgConfidenceCorrect: avg(ideal),
    avgConfidenceIncorrect: avg(wrong),
    perScenario,
    profile: buildProfile(
      perScenario,
      calibrationScore,
      avg(ideal),
      avg(wrong),
    ),
  };
}

function buildProfile(
  per: PerScenarioResult[],
  calibrationScore: number,
  avgCorrect: number | null,
  avgWrong: number | null,
): Profile {
  const over = per.filter((p) => p.overtrust).length;
  const under = per.filter((p) => p.undertrust).length;
  const verif = per.filter((p) => p.appropriateVerification).length;

  let name: string;
  const lines: string[] = [];

  if (over >= 2 && over >= under) {
    name = "The Optimist";
    lines.push("You tend to trust polished answers even when evidence is weak. Fluent, confident-sounding text was persuading you more than its content.");
  } else if (under >= 2) {
    name = "The Careful Skeptic";
    lines.push("You are cautious, but sometimes reject reliable information — including answers that were solid and easily checkable.");
  } else if (verif >= 3) {
    name = "The Methodical Checker";
    lines.push("You use verification appropriately when uncertainty is present — your instinct to pause and check is exactly the habit this training is for.");
  } else if (calibrationScore >= 80) {
    name = "Well Calibrated";
    lines.push("Your decisions and your confidence mostly line up with the evidence — a strong result.");
  } else {
    name = "Mixed Signals";
    lines.push("No single pattern dominates your answers — check the table below to find your weakest moment.");
  }

  if (avgWrong !== null && avgCorrect !== null && avgWrong > avgCorrect + 5) {
    lines.push(
      `Watch your confidence dial: you were more sure of yourself when wrong (${avgWrong}%) than when right (${avgCorrect}%). Strong feelings are a reason to double-check, not proof.`,
    );
  } else if (avgCorrect !== null && avgWrong !== null && Math.abs(avgCorrect - avgWrong) <= 10 && calibrationScore >= 65) {
    lines.push("Your confidence tracked your accuracy closely — that alignment is the heart of good calibration.");
  } else if (avgCorrect !== null && avgCorrect < 50 && calibrationScore >= 65) {
    lines.push("You got a lot right but hedged on it — being correct deserves more confidence.");
  }

  return { name, lines };
}

/* --------------------------- Presentation helpers -------------------------- */

export function confidenceBand(confidence: number): "Low" | "Moderate" | "High" {
  if (confidence >= 70) return "High";
  if (confidence >= 40) return "Moderate";
  return "Low";
}

export function idealLabel(scenario: Scenario): string {
  if (scenario.truthState === "unreliable") return "Reject — or Verify it (both are credited)";
  const label = scenario.idealAction === "trust" ? "Trust" : "Verify";
  return label;
}

export function idealShort(scenario: Scenario): string {
  return scenario.truthState === "unreliable" ? "Reject / Verify" : scenario.idealAction === "trust" ? "Trust" : "Verify";
}

export function scoreBand(score: number): { label: string; blurb: string } {
  if (score >= 85) return { label: "Excellent", blurb: "Your confidence matches your accuracy — you know what you know." };
  if (score >= 70) return { label: "Good", blurb: "Solid instincts with a little sharpening left to do." };
  if (score >= 50) return { label: "Developing", blurb: "Clear patterns are showing up — that's exactly what practice is for." };
  return { label: "Needs practice", blurb: "Your trust and your confidence need re-aligning. Try another run." };
}

/* ----------------------------- Per-answer feedback ------------------------- */

export function feedbackFor(scenario: Scenario, response: Response): string {
  const d = response.decision;
  const c = response.confidence;
  const high = c >= 70;
  const low = c < 40;

  if (d === "trust" && scenario.truthState === "reliable") {
    if (high) return "Well-placed trust: you were confident and right. This is what good calibration looks like.";
    if (low) return "Right call — but you under-sold yourself. When you're right, own it with more confidence.";
    return "Right call, reasonably held. Your confidence matched the situation.";
  }
  if (d === "verify" && scenario.truthState === "reliable") {
    return "Not wrong — over-cautious. The answer was solid, so verifying it costs you time but no real risk.";
  }
  if (d === "reject" && scenario.truthState === "reliable") {
    if (high) return "High-confidence rejection of accurate information — a strong undertrust signal.";
    return "You rejected accurate information — an undertrust signal. Worth asking what made you doubt it.";
  }
  if (d === "trust" && scenario.truthState === "uncertain") {
    if (high) return "High-confidence trust in an answer that needed checking — a strong overtrust signal.";
    return "You trusted an answer that deserved a check first — a mild overtrust signal.";
  }
  if (d === "verify" && scenario.truthState === "uncertain") {
    if (high) return "Exactly right: you spotted genuine uncertainty and chose to check before relying on it.";
    return "Exactly right — and a little more confidence in that judgment would be earned.";
  }
  if (d === "reject" && scenario.truthState === "uncertain") {
    return "You avoided overtrust, but rejecting outright skips the check this answer needed — a mild undertrust signal.";
  }
  if (d === "trust" && scenario.truthState === "unreliable") {
    if (high)
      return "High-confidence trust in an unreliable answer — this is the classic overtrust pattern that AI literacy training targets.";
    return "You trusted an unreliable answer. The polished style was doing the persuading, not the evidence.";
  }
  if (d === "verify" && scenario.truthState === "unreliable") {
    if (high) return "Smart caution: you refused to take a wrong answer on faith — verifying would have exposed it.";
    return "Smart caution — a wrong answer caught by a quick check. A bit more confidence would be earned.";
  }
  // reject + unreliable
  if (high) return "Confident rejection of an unreliable answer — textbook calibration.";
  if (low) return "Correct rejection — though you trusted your own judgment less than you could have.";
  return "Correct rejection. Your doubt was aimed at the right target.";
}
