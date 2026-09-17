import type { Scenario } from "../types";

/**
 * 7 hardcoded scenarios for V1.
 * Mix: 2 reliable · 2 "needs verification" (uncertain) · 2 convincing-but-wrong · 1 fabricated citation.
 * Note: the AI answers are deliberately fluent and confident on every scenario —
 * the lesson is that style carries no signal about accuracy.
 */
export const scenarios: Scenario[] = [
  {
    id: "s1",
    category: "Science",
    question: "Why is the sky blue?",
    aiAnswer:
      "The sky looks blue because air molecules scatter shorter wavelengths of sunlight (blue) far more strongly than longer wavelengths (red). This is called Rayleigh scattering. It's also why sunsets turn red — near the horizon, sunlight passes through much more atmosphere, so most of the blue is scattered away before the light reaches your eyes.",
    truthState: "reliable",
    idealAction: "trust",
    explanation:
      "This is a well-established explanation in physics. Rayleigh scattering appears in every atmospheric science textbook, and both parts of the answer — blue daytime skies and redder sunsets — follow from the same mechanism.",
    tags: ["textbook science", "well-established", "verifiable"],
  },
  {
    id: "s2",
    category: "Statistics",
    question:
      "How many people need to be in a room before there's a better-than-even chance two of them share a birthday?",
    aiAnswer:
      "Just 23. With 23 people, the probability that at least two share a birthday is about 50.7%. It feels wrong because we intuitively compare one person against everyone else (22 chances), but the math counts every possible pair — 23 people make 253 pairs, so coincidences add up fast.",
    truthState: "reliable",
    idealAction: "trust",
    explanation:
      "This is the famous 'birthday problem', and 23 is the accepted answer (≈50.7%); the 253-pairs reasoning is correct too. Counterintuitive-but-true results like this are exactly when it's reasonable to check a source — but the answer itself is solid.",
    tags: ["counterintuitive but true", "classic result", "verifiable"],
  },
  {
    id: "s3",
    category: "History",
    question: "When did woolly mammoths go extinct?",
    aiAnswer:
      "Woolly mammoths went extinct around 10,000 BCE, when the last ice age ended. They vanished long before humans built any cities or monuments — the first pyramids came thousands of years later.",
    truthState: "unreliable",
    idealAction: "reject",
    explanation:
      "Mostly right is not right. Mainland mammoths did die out around 10,000 years ago, but a population survived on Wrangel Island in the Arctic until roughly 4,000 years ago — about a thousand years AFTER the Great Pyramid of Giza was built (c. 2560 BCE). The confident framing hides a real error.",
    tags: ["confidently wrong", "partially true", "natural history"],
  },
  {
    id: "s4",
    category: "Geography",
    question: "What is the longest river in the world?",
    aiAnswer:
      "The Nile is the longest river in the world at 6,650 km, edging out the Amazon (about 6,400 km). This is a settled geographic fact.",
    truthState: "uncertain",
    idealAction: "verify",
    explanation:
      "This one is genuinely contested. The Nile is the traditional answer, but several peer-reviewed studies — notably Brazilian expeditions in 2007 and 2013 — place the Amazon ahead, depending on where you say the Amazon begins and how its seasonal mouth is measured. A definitive answer with zero hedging is itself a signal to verify.",
    tags: ["contested", "definitive tone", "needs a source"],
  },
  {
    id: "s5",
    category: "Technology",
    question: "If I browse in Chrome's Incognito mode, is my activity private?",
    aiAnswer:
      "Yes. Incognito mode keeps your browsing private: websites, your internet provider, and anyone monitoring the network cannot see which sites you visit. Your activity stays on your device instead of being sent anywhere.",
    truthState: "unreliable",
    idealAction: "reject",
    explanation:
      "This reverses what Incognito actually does. It only stops your own browser from saving history, cookies, and form data. Your internet provider, your school or employer's network, and the websites themselves can still see everything. (Google settled a consumer lawsuit over exactly this confusion in 2024.)",
    tags: ["confidently wrong", "common misconception", "privacy"],
  },
  {
    id: "s6",
    category: "Health literacy",
    question: "Should everyone drink eight glasses of water a day?",
    aiAnswer:
      "Yes — the eight-glasses rule (about two liters) is the scientifically recommended amount for adults. Studies consistently show that drinking eight glasses daily improves kidney function, skin health, and concentration.",
    truthState: "uncertain",
    idealAction: "verify",
    explanation:
      "The '8×8' rule is a popular guideline, not a clinical standard: it appears to trace back to a 1940s recommendation that also noted much of that water normally comes from food. Real fluid needs vary with body size, activity, and climate. Universal health numbers stated as hard facts — with 'studies consistently show' and no sources — are classic verify-first material.",
    tags: ["rule of thumb", "overstated certainty", "general wellness"],
  },
  {
    id: "s7",
    category: "Citations & sources",
    question: "Is there any research on whether meditation improves focus?",
    aiAnswer:
      "Absolutely. A widely cited 2018 Stanford study — Dr. Elena Marsh's team, published in the Journal of Applied Cognitive Science (Vol. 22) — found that two weeks of 10-minute daily meditation improved sustained attention by 40%, one of the largest effects reported in the field.",
    truthState: "unreliable",
    idealAction: "reject",
    explanation:
      "The citation is fabricated: the study, the author, and the statistics do not exist. Invented citations are among the most convincing LLM failure modes because the format looks perfect. Real research on meditation and attention does exist — which is exactly why the right move is verifying in a database like PubMed or Google Scholar, not judging on style.",
    tags: ["fabricated source", "plausible formatting", "hallucinated citation"],
  },
];
