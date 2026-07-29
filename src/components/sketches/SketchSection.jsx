/**
 * Architectural cross-section — ground line, slabs, structure, and the
 * daylight studies that justify the massing.
 */
const SketchSection = ({ className = '' }) => (
  <svg viewBox="0 0 800 560" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* ---- layer 1: levels ------------------------------------------- */}
    <g className="sk-grid" stroke="currentColor" strokeWidth="0.5" opacity="0.25">
      {[
        [120, '+9.60'],
        [220, '+6.40'],
        [320, '+3.20'],
        [420, '±0.00'],
      ].map(([y, label]) => (
        <g key={label}>
          <line x1="70" y1={y} x2="740" y2={y} strokeDasharray="10 4 2 4" />
          <text x="748" y={y + 3} fontSize="9" fill="currentColor" stroke="none" opacity="0.9">
            {label}
          </text>
        </g>
      ))}
    </g>

    {/* ---- layer 2: ground + slabs ----------------------------------- */}
    <g className="sk-walls" stroke="currentColor">
      {/* ground line, heavy */}
      <path d="M40 420 L760 420" strokeWidth="2.6" />
      <g opacity="0.5" strokeWidth="0.7">
        {Array.from({ length: 36 }).map((_, i) => (
          <line key={i} x1={44 + i * 20} y1="420" x2={32 + i * 20} y2="436" />
        ))}
      </g>

      {/* slabs */}
      {[120, 220, 320].map((y) => (
        <g key={y}>
          <path d={`M150 ${y} L650 ${y}`} strokeWidth="2.2" />
          <path d={`M150 ${y + 9} L650 ${y + 9}`} strokeWidth="1" opacity="0.6" />
        </g>
      ))}
      <path d="M150 420 L650 420" strokeWidth="2.2" />

      {/* end walls */}
      <path d="M150 120 L150 420" strokeWidth="2.2" />
      <path d="M650 120 L650 420" strokeWidth="2.2" />

      {/* roof */}
      <path d="M150 120 L400 66 L650 120" strokeWidth="2.4" />
    </g>

    {/* ---- layer 3: structure + occupation ---------------------------- */}
    <g className="sk-openings" stroke="currentColor" strokeWidth="1.1">
      {/* columns */}
      {[250, 400, 550].map((x) => (
        <g key={x} opacity="0.85">
          <line x1={x} y1="129" x2={x} y2="220" />
          <line x1={x + 6} y1="129" x2={x + 6} y2="220" />
          <line x1={x} y1="229" x2={x} y2="320" />
          <line x1={x + 6} y1="229" x2={x + 6} y2="320" />
          <line x1={x} y1="329" x2={x} y2="420" />
          <line x1={x + 6} y1="329" x2={x + 6} y2="420" />
        </g>
      ))}

      {/* double-height void */}
      <g opacity="0.45" strokeWidth="0.6" strokeDasharray="3 5">
        <path d="M400 129 L400 320" />
        <path d="M470 129 L470 320" />
      </g>

      {/* human figures — scale reference */}
      <g opacity="0.75" strokeWidth="1">
        {[
          [200, 420],
          [520, 320],
          [330, 220],
        ].map(([x, base]) => (
          <g key={`${x}-${base}`} transform={`translate(${x} ${base})`}>
            <circle cx="0" cy="-34" r="4" />
            <path d="M0 -30 L0 -12" />
            <path d="M-6 -24 L6 -24" />
            <path d="M0 -12 L-5 0 M0 -12 L5 0" />
          </g>
        ))}
      </g>
    </g>

    {/* ---- layer 4: daylight study ------------------------------------ */}
    <g className="sk-dims" stroke="currentColor" strokeWidth="0.8" opacity="0.55">
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <path d={`M${700 - i * 34} 40 L${520 - i * 52} ${150 + i * 22}`} strokeDasharray="6 5" />
          <path d={`M${528 - i * 52} ${140 + i * 22} L${520 - i * 52} ${150 + i * 22} L${532 - i * 52} ${154 + i * 22}`} />
        </g>
      ))}
      <text x="690" y="30" textAnchor="end" fontSize="10" fill="currentColor" stroke="none">
        21 JUN · 14:00
      </text>
    </g>
  </svg>
);

export default SketchSection;
