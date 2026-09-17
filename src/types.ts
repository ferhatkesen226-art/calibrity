export type TruthState = "reliable" | "uncertain" | "unreliable";
export type Decision = "trust" | "verify" | "reject";

export interface Scenario {
  id: string;
  category: string;
  question: string;
  aiAnswer: string;
  truthState: TruthState;
  /** The canonical ideal action. For "unreliable", Verify is also fully credited (see scoring.ts). */
  idealAction: Decision;
  explanation: string;
  tags: string[];
}

export interface Response {
  scenarioId: string;
  decision: Decision;
  confidence: number; // 0–100
}

export type Phase = "intro" | "scenario" | "reveal" | "results";
