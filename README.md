# Calibrity

**Learn when to trust AI.** A hackathon MVP that trains AI literacy by measuring two things most
tools ignore: your **decision** (Trust / Verify / Reject) and your **confidence** (0–100%).

You read 7 simulated AI answers, make the call, rate how sure you are, and get a calibration
profile that names your pattern — overtrust, undertrust, or healthy verification habits.

> Hackathon prototype — educational feedback, not a psychological assessment.

## Run locally

```bash
npm install
npm run dev        # → http://localhost:5173
```

Other commands:

```bash
npm run build          # type-check + production build to dist/
npm run preview        # serve the production build → http://localhost:4173
npm run test:scoring   # scoring sanity tests (bounds, personas, spot checks)
```

Requires Node 18+. No backend, no database, no API keys, no accounts.

## Deploy

Static SPA — zero config on any static host:

- **Vercel**: framework preset "Vite", build `npm run build`, output `dist`
- **Netlify**: build `npm run build`, publish directory `dist`
- **Cloudflare Pages**: framework "Vite", build `npm run build`, output `dist`

## File structure

```
project-calibration/
├── index.html                  # entry, dark theme, inline SVG favicon
├── package.json
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts
├── scripts/
│   └── test-scoring.ts         # scoring test suite (node + tsx, no test framework)
└── src/
    ├── main.tsx                # React root
    ├── App.tsx                 # phase state machine: intro → scenario → reveal → results
    ├── index.css               # full design system (dark, responsive, reduced-motion aware)
    ├── types.ts                # Scenario, Response, Phase, TruthState, Decision
    ├── data/
    │   └── scenarios.ts        # the 7 hardcoded scenarios
    ├── lib/
    │   ├── scoring.ts          # scoring engine, signals, profile + feedback generation
    │   └── meta.ts             # label/hint/color metadata for decisions and truth states
    └── components/
        ├── IntroScreen.tsx     # headline, how-it-works, glossary, start
        ├── ScenarioScreen.tsx  # question, AI answer, choices, slider, progress
        ├── RevealScreen.tsx    # verdict, explanation, points breakdown, feedback
        ├── ResultsScreen.tsx   # gauge, stat cards, profile, answer table
        ├── ScoreGauge.tsx      # SVG ring gauge
        └── icons.tsx           # inline SVG icon set (no icon dependency)
```

## The 7 scenarios

| # | Domain | Truth state | The trap / lesson |
|---|--------|-------------|-------------------|
| 1 | Science (sky is blue) | Reliable | Textbook-correct — deserves trust |
| 2 | Statistics (birthday problem) | Reliable | Counterintuitive but true — don't reject what feels odd |
| 3 | History (mammoth extinction) | Unreliable | Mostly-right narrative hiding a real error (Wrangel Island vs. pyramids) |
| 4 | Geography (longest river) | Uncertain | Genuinely contested, stated with zero hedging |
| 5 | Technology (Incognito mode) | Unreliable | Confidently reverses what the feature actually does |
| 6 | Health literacy (8 glasses of water) | Uncertain | Rule of thumb dressed up as clinical fact |
| 7 | Citations (meditation study) | Unreliable | Fully fabricated study, author, journal, and statistic |

Every AI answer is written in the same fluent, confident style — style carries no accuracy signal,
which is the point.

## Scoring (2-minute-demo version)

Each scenario is worth **0–100 points**:

1. **Decision points** — the call you make:
   - **+70** right call: Trust a reliable answer · Verify an uncertain answer · Reject or Verify an unreliable answer
   - **+40** cautious call: Verify a reliable answer (safe, but you miss good info)
   - **+25** wrong call: anything else
2. **Confidence adjustment** (−30 … +30):
   - right call: **+ confidence × 0.3** — being confident when right is rewarded
   - wrong call: **− confidence × 0.3** — confident mistakes hurt most
   - cautious call: no change
3. Clamp to 0–100. **Calibration Score = average across all 7 answers.**

Worked examples (all covered by tests):

- Trust an unreliable answer at 95% → 25 − 29 → **0** (heavy overtrust penalty)
- Reject a reliable answer at 90% → 25 − 27 → **0** (heavy undertrust penalty)
- Verify an uncertain answer at 70% → 70 + 21 → **91** (strong calibration)
- Trust a reliable answer at 85% → 70 + 26 → **96**

**Signals counted across the run:**

- **Overtrust** — you chose Trust on an answer that wasn't reliable (5 opportunities)
- **Undertrust** — you chose Reject on an answer that wasn't unreliable (4 opportunities)
- **Appropriate verification** — you chose Verify on a non-reliable answer (5 opportunities)
- **Confidence behavior** — average confidence on ideal calls vs. wrong calls; a gap in the wrong
  direction (more confident when wrong) is called out in your profile

The results screen names your pattern (The Optimist / The Careful Skeptic / The Methodical Checker /
Well Calibrated / Mixed Signals) and every reveal screen gives per-answer feedback.

## Test checklist (verified)

- [x] `npm run build` — clean TypeScript strict check + Vite build
- [x] `npm run test:scoring` — 16 test groups pass:
  - every scenario × decision × confidence (step 5) stays an integer within 0–100 (441 combos)
  - spec examples: Trust-unreliable@95 → 0, Reject-reliable@90 → 0, Verify-uncertain@70 → 91
  - personas: perfect play → 100; trust-all@95 → overtrust 5/5, "The Optimist"; reject-all@90 →
    undertrust 4/4, "The Careful Skeptic"; verify-all@70 → 76, "The Methodical Checker"
- [x] Browser walkthrough (desktop 1280×720 and mobile 390×844): all 7 scenarios, submit gating,
  reveal content, results math matched hand calculations, restart via both buttons fully resets
  state, production build served via `vite preview` loads
- [x] Keyboard: Tab order, arrow keys on the radio group and slider, visible focus rings
- [x] Accessibility: semantic fieldset/legend/progressbar, radio inputs, labeled slider with
  `aria-valuetext`, `aria-live` reveal, verdicts pair icons + text with color

## Known limitations

- 7 hardcoded scenarios; the order is fixed, so repeat runs aren't blind
- "Verify" is credited but never simulated — verifying is always treated as the safe move, with no
  cost model for unnecessary verification of reliable answers (it scores 40, deliberately mild)
- Truth states and explanations are editorial judgments, not a fact-check database
- The AI answers are scripted strings, not live model output (by design for V1)
- No persistence: refreshing the page mid-run loses progress; nothing is stored anywhere
- Results are computed per run only — no history, export, or teacher view (out of scope)
- Confidence is self-reported on a 5-step slider; the scoring assumes honest input
