/**
 * Concept diagram — the loose, first-principles sketch: the forces acting on
 * the site, the single move that resolves them, and the note that explains it.
 *
 * Drawing conventions: the site boundary is a long-dash chain, forces are
 * arrowed dashes, the built bar is the only heavy line on the sheet, and the
 * courtyard is left open (paved, not poché) because it is outdoor space.
 */
const SketchConcept = ({ className = '' }) => (
  <svg viewBox="0 0 800 560" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* ---- layer 1: site boundary ------------------------------------- */}
    <g className="sk-grid" stroke="currentColor" strokeWidth="0.9" opacity="0.34">
      <path d="M96 156 L438 104 L668 214 L604 452 L206 478 Z" strokeDasharray="12 5 3 5" />
      <text x="102" y="146" fontSize="9" fill="currentColor" stroke="none" opacity="0.95">
        SITE BOUNDARY
      </text>
    </g>

    {/* ---- layer 2: forces acting on the site -------------------------- */}
    <g className="sk-walls" stroke="currentColor" strokeWidth="1" opacity="0.7">
      {/* prevailing wind, entering from the west */}
      <path d="M44 214 C 108 190, 152 238, 214 216" strokeDasharray="5 5" />
      <path d="M204 209 L216 216 L204 223" />
      <text x="44" y="202" fontSize="9" fill="currentColor" stroke="none">
        PREVAILING WIND
      </text>

      {/* sun path, kept clear of the boundary on the right */}
      <path d="M604 96 A 200 200 0 0 1 604 424" strokeDasharray="5 5" />
      <circle cx="668" cy="196" r="8" />
      <g strokeWidth="0.6">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r = (a * Math.PI) / 180;
          return (
            <line
              key={a}
              x1={668 + Math.cos(r) * 12}
              y1={196 + Math.sin(r) * 12}
              x2={668 + Math.cos(r) * 17}
              y2={196 + Math.sin(r) * 17}
            />
          );
        })}
      </g>
      <text x="694" y="199" fontSize="9" fill="currentColor" stroke="none">
        S · 12:00
      </text>

      {/* the path people already take across the site */}
      <path d="M188 502 C 268 458, 300 430, 322 404" strokeDasharray="4 6" />
      <path d="M312 396 L324 402 L314 411" />
      <text x="150" y="520" fontSize="9" fill="currentColor" stroke="none">
        DESIRE LINE
      </text>
    </g>

    {/* ---- layer 3: the move ------------------------------------------- */}
    <g className="sk-openings" stroke="currentColor">
      {/* the bar — the only heavy line on the sheet */}
      <path d="M248 232 L556 232 L556 396 L248 396 Z" strokeWidth="2.2" />

      {/* poché: the built mass either side of the void */}
      <g opacity="0.32" strokeWidth="0.55">
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`l${i}`} x1={252 + i * 13} y1="236" x2={252 + i * 13 - 4} y2="392" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`r${i}`} x1={470 + i * 10} y1="236" x2={470 + i * 10 - 4} y2="392" />
        ))}
      </g>

      {/* the courtyard: outdoor, so left open with a paving grid */}
      <path d="M368 268 L462 268 L462 360 L368 360 Z" strokeWidth="1.1" />
      <g opacity="0.2" strokeWidth="0.45">
        {[391, 415, 439].map((x) => (
          <line key={`pv${x}`} x1={x} y1="268" x2={x} y2="360" />
        ))}
        {[291, 314, 337].map((y) => (
          <line key={`ph${y}`} x1="368" y1={y} x2="462" y2={y} />
        ))}
      </g>
      {/* open-to-sky mark */}
      <g opacity="0.55" strokeWidth="0.8">
        <path d="M405 300 L425 300 M415 290 L415 310" />
      </g>
    </g>

    {/* ---- layer 4: the note ------------------------------------------- */}
    <g className="sk-dims" stroke="currentColor" strokeWidth="0.7" opacity="0.85">
      <circle cx="415" cy="300" r="2.6" fill="currentColor" stroke="none" />
      <path d="M415 300 L415 148 L498 148" />
      <text x="504" y="144" fontSize="10" fill="currentColor" stroke="none">
        THE VOID PULLS LIGHT
      </text>
      <text x="504" y="159" fontSize="10" fill="currentColor" stroke="none" opacity="0.6">
        DOWN INTO THE PLAN
      </text>
    </g>
  </svg>
);

export default SketchConcept;
