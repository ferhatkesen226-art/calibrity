import type { Decision, TruthState } from "../types";

export type IconKey = "check" | "search" | "x" | "alert" | "spark" | "target" | "arrow";

export const DECISION_META: Record<Decision, { label: string; hint: string; icon: IconKey }> = {
  trust: { label: "Trust", hint: "Accept it as-is", icon: "check" },
  verify: { label: "Verify", hint: "Check before relying on it", icon: "search" },
  reject: { label: "Reject", hint: "Treat it as wrong", icon: "x" },
};

export const TRUTH_META: Record<TruthState, { label: string; line: string; icon: IconKey }> = {
  reliable: { label: "Reliable", line: "This answer holds up.", icon: "check" },
  uncertain: {
    label: "Needs verification",
    line: "Partly right, contested, or overstated — check before relying on it.",
    icon: "alert",
  },
  unreliable: { label: "Unreliable", line: "This answer is wrong or fabricated.", icon: "x" },
};
