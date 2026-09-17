import { IconCheck, IconSearch, IconX, IconArrow } from "./icons";

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <section className="fade-in intro" aria-labelledby="intro-heading">
      <div className="intro-hero">
        <h1 id="intro-heading">
          Learn when to <span className="accent">trust AI</span>.
        </h1>
        <p className="intro-sub">
          AI answers arrive fluent, confident, and evenly persuasive — whether they're right or
          completely made up. Calibrity trains the skill most tutorials skip: matching your
          confidence to the evidence.
        </p>
      </div>

      <div className="card how-card">
        <p className="how-lead">
          You'll see several AI answers. Decide whether you would <strong>Trust</strong>,{" "}
          <strong>Verify</strong>, or <strong>Reject</strong> each answer, then tell us how confident
          you are.
        </p>
        <ol className="steps">
          <li>
            <span className="step-num">1</span>
            <div>
              <p className="step-title">Read the answer</p>
              <p className="step-text">A question and a simulated AI response.</p>
            </div>
          </li>
          <li>
            <span className="step-num">2</span>
            <div>
              <p className="step-title">
                Make the call: <IconCheck className="i-trust" /> Trust · <IconSearch className="i-verify" />{" "}
                Verify · <IconX className="i-reject" /> Reject
              </p>
              <p className="step-text">What would you do with this answer?</p>
            </div>
          </li>
          <li>
            <span className="step-num">3</span>
            <div>
              <p className="step-title">Rate your confidence, 0–100%</p>
              <p className="step-text">Confidence is half the game — it's how we spot overtrust and undertrust.</p>
            </div>
          </li>
        </ol>
        <p className="intro-meta">7 answers · about 3 minutes · nothing leaves your browser</p>
      </div>

      <div className="glossary">
        <div className="card gloss">
          <p className="gloss-term"><IconCheck className="i-trust" /> Overtrust</p>
          <p className="gloss-text">Trusting answers that don't deserve it.</p>
        </div>
        <div className="card gloss">
          <p className="gloss-term"><IconX className="i-reject" /> Undertrust</p>
          <p className="gloss-text">Rejecting answers that do.</p>
        </div>
        <div className="card gloss">
          <p className="gloss-term"><IconSearch className="i-verify" /> Calibration</p>
          <p className="gloss-text">Confidence matched to evidence.</p>
        </div>
      </div>

      <div className="intro-cta">
        <button className="btn-primary btn-xl" onClick={onStart}>
          Start calibration <IconArrow />
        </button>
      </div>

      <p className="disclaimer">Hackathon prototype — educational feedback, not a psychological assessment.</p>
    </section>
  );
}
