const GOLD = "#d3a24b";

export default function ZelligeOrnament({ className = "", color = GOLD }) {
  return (
    <svg viewBox="0 0 240 32" fill="none" className={className} aria-hidden="true">
      <line x1="14" y1="16" x2="99" y2="16" stroke={color} strokeWidth="1.2" opacity="0.75" />
      <line x1="141" y1="16" x2="226" y2="16" stroke={color} strokeWidth="1.2" opacity="0.75" />
      <path d="M8 12.6 11.4 16 8 19.4 4.6 16 Z" fill={color} opacity="0.9" />
      <path d="M232 12.6 235.4 16 232 19.4 228.6 16 Z" fill={color} opacity="0.9" />
      <path d="M106 13.9 108.1 16 106 18.1 103.9 16 Z" fill={color} opacity="0.85" />
      <path d="M134 13.9 136.1 16 134 18.1 131.9 16 Z" fill={color} opacity="0.85" />
      <polygon
        points="120,5 121.8,11.8 127.8,8.2 124.3,14.2 131,16 124.3,17.8 127.8,23.8 121.8,20.2 120,27 118.2,20.2 112.2,23.8 115.8,17.8 109,16 115.8,14.2 112.2,8.2 118.2,11.8"
        stroke={color}
        strokeWidth="1.4"
        strokeLinejoin="miter"
      />
      <circle cx="120" cy="16" r="1.5" fill={color} />
    </svg>
  );
}
