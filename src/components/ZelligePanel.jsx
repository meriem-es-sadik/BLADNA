const GOLD = "#d3a24b";
const GOLD_SOFT = "#c9a24b";
const TERRA = "#b45f3c";
const GREEN = "#006233";
const IVORY = "#f8f3e6";

const FRIEZE_DOTS = [
  [30, 9.5],
  [90, 9.5],
  [30, 110.5],
  [90, 110.5],
  [9.5, 30],
  [9.5, 90],
  [110.5, 30],
  [110.5, 90],
];

export default function ZelligePanel({ className = "" }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden="true">
      <rect x="6" y="6" width="108" height="108" stroke={GOLD} strokeWidth="1.2" />
      <rect x="13" y="13" width="94" height="94" stroke={GOLD} strokeWidth="0.7" opacity="0.75" />

      <g fill={GOLD_SOFT}>
        <path d="M9.5 6.9 L12.1 9.5 L9.5 12.1 L6.9 9.5 Z" />
        <path d="M110.5 6.9 L113.1 9.5 L110.5 12.1 L107.9 9.5 Z" />
        <path d="M9.5 107.9 L12.1 110.5 L9.5 113.1 L6.9 110.5 Z" />
        <path d="M110.5 107.9 L113.1 110.5 L110.5 113.1 L107.9 110.5 Z" />
      </g>

      <g fill={TERRA} opacity="0.92">
        <rect x="58.4" y="7.9" width="3.2" height="3.2" />
        <rect x="58.4" y="108.9" width="3.2" height="3.2" />
        <rect x="7.9" y="58.4" width="3.2" height="3.2" />
        <rect x="108.9" y="58.4" width="3.2" height="3.2" />
      </g>

      <g fill={GOLD_SOFT} opacity="0.85">
        {FRIEZE_DOTS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9" />
        ))}
      </g>

      <circle cx="60" cy="60" r="26" stroke={GOLD} strokeWidth="0.8" opacity="0.85" />

      <polygon
        points="60,36 74.11,79.42 37.17,52.59 82.83,52.59 45.89,79.42"
        stroke={GREEN}
        strokeWidth="2.4"
        strokeLinejoin="miter"
      />

      <g fill={IVORY} stroke={GREEN} strokeWidth="0.6">
        <path d="M65.39 50.38 L67.59 52.58 L65.39 54.78 L63.19 52.58 Z" />
        <path d="M68.72 60.63 L70.92 62.83 L68.72 65.03 L66.52 62.83 Z" />
        <path d="M60 66.97 L62.2 69.17 L60 71.37 L57.8 69.17 Z" />
        <path d="M51.28 60.63 L53.48 62.83 L51.28 65.03 L49.08 62.83 Z" />
        <path d="M54.61 50.38 L56.81 52.58 L54.61 54.78 L52.41 52.58 Z" />
      </g>

      <circle cx="60" cy="60" r="1.4" fill={GREEN} />
    </svg>
  );
}
