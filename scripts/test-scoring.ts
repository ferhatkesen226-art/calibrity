/**
 * Scoring sanity tests for Project Calibration.
 * Run: npm run test:scoring
 */
import { strict as assert } from "node:assert";
import { scenarios } from "../src/data/scenarios";
import {
  computeResults,
  decisionTier,
  IDEAL_ACTIONS,
  scoreResponse,
} from "../src/lib/scoring";
import type { Decision, Response } from "../src/types";

let checks = 0;
const ok = (msg: string) => {
  checks++;
  console.log(`  ok  ${msg}`);
};

const byId = (id: string) => {
  const s = scenarios.find((x) => x.id === id);
  assert.ok(s, `scenario ${id} exists`);
  return s!;
};

console.log("\n1) Data model");
assert.equal(scenarios.length, 7, "exactly 7 scenarios");
const mix = { reliable: 0, uncertain: 0, unreliable: 0 };
for (const s of scenarios) mix[s.truthState]++;
assert.deepEqual(mix, { reliable: 2, uncertain: 2, unreliable: 3 }, "mix: 2 reliable / 2 uncertain / 2 wrong + 1 fabricated");
ok("7 scenarios with mix 2/2/3 (2 convincing-but-wrong + 1 fabricated citation = 3 unreliable)");
const categories = new Set(scenarios.map((s) => s.category));
assert.equal(categories.size, 7, "7 distinct domains");
ok("7 distinct domains");

console.log("\n2) Bounds: every scenario x decision x confidence (step 5) stays within 0..100");
for (const s of scenarios) {
  for (const d of ["trust", "verify", "reject"] as Decision[]) {
    for (let c = 0; c <= 100; c += 5) {
      const score = scoreResponse(s, { scenarioId: s.id, decision: d, confidence: c });
      assert.ok(
        Number.isInteger(score) && score >= 0 && score <= 100,
        `${s.id} ${d} @${c}% -> ${score} (must be integer 0..100)`,
      );
    }
  }
}
ok("441 combinations, all integers within [0, 100]");

console.log("\n3) Spot checks from the spec");
const r = (id: string, d: Decision, c: number): Response => ({ scenarioId: id, decision: d, confidence: c });
assert.equal(scoreResponse(byId("s3"), r("s3", "trust", 95)), 0, "trust unreliable @95 -> heavy penalty floors at 0");
ok("Trust unreliable answer at 95% confidence = 0 points (heavy overtrust penalty)");
assert.equal(scoreResponse(byId("s1"), r("s1", "reject", 90)), 0, "reject reliable @90 -> floors at 0");
ok("Reject reliable answer at 90% confidence = 0 points (heavy undertrust penalty)");
assert.equal(scoreResponse(byId("s4"), r("s4", "verify", 70)), 91, "verify uncertain @70 -> 70 + 21 = 91");
ok("Verify uncertain answer at 70% confidence = 91 points (strong calibration result)");
assert.equal(scoreResponse(byId("s1"), r("s1", "trust", 100)), 100, "trust reliable @100 -> 70 + 30 = 100");
ok("Trust reliable answer at 100% confidence = 100 points");
assert.equal(scoreResponse(byId("s7"), r("s7", "verify", 60)), 88, "verify unreliable credited: 70 + 18");
ok("Verify fabricated citation at 60% = 88 points (Verify credited on unreliable)");
assert.equal(scoreResponse(byId("s3"), r("s3", "trust", 20)), 19, "hedged wrong call keeps a few points");
ok("Trust unreliable at only 20% confidence = 19 points (hedged mistakes hurt less)");

console.log("\n4) Persona: perfect play");
const idealRun = (): Response[] =>
  scenarios.map((s) => ({
    scenarioId: s.id,
    decision: IDEAL_ACTIONS[s.truthState][0],
    confidence: 100,
  }));
const perfect = computeResults(idealRun(), scenarios);
assert.equal(perfect.calibrationScore, 100, "all ideal @100% = 100");
assert.equal(perfect.overtrustCount, 0);
assert.equal(perfect.undertrustCount, 0);
assert.equal(perfect.appropriateVerificationCount, 2, "this persona rejects unreliable, so verify only on the 2 uncertain");
ok("all-ideal @100% confidence -> calibration 100, verification 2/2 (uncertain)");

const idealVerifyRun = scenarios.map((s) => ({
  scenarioId: s.id,
  decision: s.truthState === "unreliable" ? ("verify" as Decision) : IDEAL_ACTIONS[s.truthState][0],
  confidence: 100,
}));
const perfectVerify = computeResults(idealVerifyRun, scenarios);
assert.equal(perfectVerify.calibrationScore, 100, "verify is fully credited on unreliable too");
assert.equal(perfectVerify.appropriateVerificationCount, 5);
ok("ideal run using Verify on unreliable -> still calibration 100, verification 5/5");

console.log("\n5) Persona: trust everything at 95%");
const trustAll = computeResults(
  scenarios.map((s) => r(s.id, "trust", 95)),
  scenarios,
);
assert.equal(trustAll.overtrustCount, 5, "trusted all 5 non-reliable answers");
assert.equal(trustAll.undertrustCount, 0);
assert.equal(trustAll.appropriateVerificationCount, 0);
assert.ok(trustAll.calibrationScore >= 0 && trustAll.calibrationScore <= 100);
assert.match(trustAll.profile.name, /Optimist/, "profile should flag overtrust pattern");
ok(`overtrust 5/5, calibration ${trustAll.calibrationScore}, profile "${trustAll.profile.name}"`);

console.log("\n6) Persona: reject everything at 90%");
const rejectAll = computeResults(
  scenarios.map((s) => r(s.id, "reject", 90)),
  scenarios,
);
assert.equal(rejectAll.undertrustCount, 4, "rejected all 4 non-unreliable answers");
assert.equal(rejectAll.overtrustCount, 0);
assert.ok(rejectAll.calibrationScore >= 0 && rejectAll.calibrationScore <= 100);
assert.match(rejectAll.profile.name, /Skeptic/, "profile should flag undertrust pattern");
ok(`undertrust 4/4, calibration ${rejectAll.calibrationScore}, profile "${rejectAll.profile.name}"`);

console.log("\n7) Persona: verify everything at 70%");
const verifyAll = computeResults(
  scenarios.map((s) => r(s.id, "verify", 70)),
  scenarios,
);
assert.equal(verifyAll.appropriateVerificationCount, 5);
assert.equal(verifyAll.overtrustCount, 0);
assert.equal(verifyAll.undertrustCount, 0);
assert.equal(verifyAll.calibrationScore, 76, "(2x40 cautious + 5x91 ideal) / 7 = 76");
assert.match(verifyAll.profile.name, /Checker/, "profile should reward verification habit");
ok(`verification 5/5, calibration ${verifyAll.calibrationScore}, profile "${verifyAll.profile.name}"`);

console.log("\n8) Aggregates & opportunities");
const any = computeResults(
  [r("s1", "trust", 80), r("s2", "trust", 90), r("s3", "trust", 95), r("s4", "verify", 60), r("s5", "reject", 85), r("s6", "verify", 50), r("s7", "reject", 75)],
  scenarios,
);
assert.equal(any.overtrustOpportunities, 5, "5 non-reliable scenarios");
assert.equal(any.undertrustOpportunities, 4, "4 non-unreliable scenarios");
assert.equal(any.verificationOpportunities, 5);
// ideal calls here: s1(80), s2(90), s4(60), s5(85), s6(50), s7(75) -> 440/6 = 73
assert.equal(any.avgConfidenceCorrect, 73);
assert.equal(any.avgConfidenceIncorrect, 95, "only wrong call is s3 trust @95");
ok("opportunities (5/4/5) and confidence averages computed correctly");

console.log("\n9) Tier classification sanity");
assert.equal(decisionTier(byId("s7"), "verify"), "ideal", "verify on unreliable = ideal");
assert.equal(decisionTier(byId("s1"), "verify"), "cautious", "verify on reliable = cautious");
assert.equal(decisionTier(byId("s4"), "trust"), "wrong", "trust on uncertain = wrong");
ok("tier mapping matches the published scoring table");

console.log(`\nAll ${checks} test groups passed. ✔\n`);
