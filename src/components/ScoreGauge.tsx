interface Props {
  score: number; // 0–100
}

export default function ScoreGauge({ score }: Props) {
  const r = 84;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score / 100);

  return (
    <svg viewBox="0 0 200 200" className="gauge" role="img" aria-label={`Calibration score: ${score} out of 100`}>
      <defs>
        <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b7bff" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r={r} className="gauge-track" />
      <circle
        cx="100"
        cy="100"
        r={r}
        className="gauge-fill"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 100 100)"
      />
      <text x="100" y="96" textAnchor="middle" className="gauge-num">
        {score}
      </text>
      <text x="100" y="122" textAnchor="middle" className="gauge-sub">
        / 100
      </text>
    </svg>
  );
}
