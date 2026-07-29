/**
 * Architectural floor plan — drawn as a line sketch.
 *
 * Every stroke is a real path so `DrawnSketch` can animate it on with
 * stroke-dashoffset, the way a plan is laid down on trace paper: setting-out
 * grid first, then walls, then openings and fittings, then dimensions.
 *
 * Layer order is drawing order: .sk-grid → .sk-walls → .sk-openings → .sk-dims
 */
const SketchPlan = ({ className = '' }) => (
  <svg viewBox="0 0 800 560" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* ---- layer 1: setting-out grid ---------------------------------- */}
    <g className="sk-grid" stroke="currentColor" strokeWidth="0.5" opacity="0.16">
      {[110, 250, 390, 530, 670].map((x) => (
        <line key={`v${x}`} x1={x} y1="52" x2={x} y2="500" strokeDasharray="9 4 2 4" />
      ))}
      {[110, 230, 350, 460].map((y) => (
        <line key={`h${y}`} x1="70" y1={y} x2="730" y2={y} strokeDasharray="9 4 2 4" />
      ))}
    </g>

    <g className="sk-grid" stroke="currentColor" strokeWidth="0.6" opacity="0.4">
      {[
        [110, 'A'],
        [250, 'B'],
        [390, 'C'],
        [530, 'D'],
        [670, 'E'],
      ].map(([x, label]) => (
        <g key={label}>
          <circle cx={x} cy="40" r="10" />
          <text x={x} y="43.5" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">
            {label}
          </text>
        </g>
      ))}
    </g>

    {/* ---- layer 2: walls, drawn as poché ------------------------------ */}
    <g className="sk-walls" stroke="currentColor">
      {/* outer envelope — two lines with hatch between = solid wall */}
      <path d="M110 110 L670 110 L670 460 L110 460 Z" strokeWidth="1.6" />
      <path d="M124 124 L656 124 L656 446 L124 446 Z" strokeWidth="1.6" />
      <g opacity="0.35" strokeWidth="0.5">
        {Array.from({ length: 40 }).map((_, i) => (
          <line key={`t${i}`} x1={112 + i * 14} y1="110" x2={106 + i * 14} y2="124" />
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <line key={`b${i}`} x1={112 + i * 14} y1="446" x2={106 + i * 14} y2="460" />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={`ll${i}`} x1="110" y1={112 + i * 14} x2="124" y2={106 + i * 14} />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <line key={`rr${i}`} x1="656" y1={112 + i * 14} x2="670" y2={106 + i * 14} />
        ))}
      </g>

      {/* internal partitions — single thickness */}
      <path d="M390 124 L390 250" strokeWidth="1.4" />
      <path d="M396 124 L396 250" strokeWidth="1.4" />
      <path d="M390 310 L390 446" strokeWidth="1.4" />
      <path d="M396 310 L396 446" strokeWidth="1.4" />
      <path d="M396 250 L530 250" strokeWidth="1.4" />
      <path d="M396 256 L530 256" strokeWidth="1.4" />
      <path d="M530 124 L530 250" strokeWidth="1.4" />
      <path d="M536 124 L536 250" strokeWidth="1.4" />
    </g>

    {/* ---- layer 3: openings, fittings, circulation -------------------- */}
    <g className="sk-openings" stroke="currentColor" strokeWidth="1.1">
      {/* door: leaf + swing arc */}
      <path d="M393 250 L393 310" strokeWidth="3" stroke="var(--sk-bg, #0B0B0D)" />
      <path d="M393 256 L393 306" strokeWidth="1.2" />
      <path d="M393 256 A 50 50 0 0 1 443 306" strokeDasharray="3 4" opacity="0.6" strokeWidth="0.7" />

      <path d="M230 457 L300 457" strokeWidth="4" stroke="var(--sk-bg, #0B0B0D)" />
      <path d="M234 453 L234 400" strokeWidth="1.2" />
      <path d="M234 453 A 53 53 0 0 0 287 400" strokeDasharray="3 4" opacity="0.6" strokeWidth="0.7" />

      {/* glazing: thin double line breaking the wall */}
      <g strokeWidth="0.8">
        <path d="M117 200 L117 380" />
        <path d="M110 200 L110 380" opacity="0" />
        <path d="M663 170 L663 300" />
      </g>

      {/* stair: treads, going line, up arrow */}
      <g opacity="0.9">
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={i} x1="560" y1={300 + i * 17} x2="640" y2={300 + i * 17} strokeWidth="0.8" />
        ))}
        <path d="M600 438 L600 306" strokeWidth="0.8" />
        <path d="M594 318 L600 302 L606 318" strokeWidth="0.8" />
        <text x="600" y="292" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none" opacity="0.8">
          UP
        </text>
      </g>

      {/* courtyard: open to sky, paved */}
      <g opacity="0.22" strokeWidth="0.5">
        {[170, 220, 270, 320].map((x) => (
          <line key={`cv${x}`} x1={x} y1="150" x2={x} y2="330" />
        ))}
        {[195, 240, 285].map((y) => (
          <line key={`ch${y}`} x1="145" y1={y} x2="360" y2={y} />
        ))}
      </g>
      <g opacity="0.55" strokeWidth="0.7">
        <path d="M240 232 L268 232 M254 218 L254 246" />
      </g>

      {/* the tree at the centre of the courtyard */}
      <g opacity="0.5" strokeWidth="0.7">
        <circle cx="254" cy="232" r="34" strokeDasharray="2 4" />
      </g>

      {/* room labels */}
      <g opacity="0.8">
        <text x="254" y="300" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">
          COURTYARD
        </text>
        <text x="463" y="190" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">
          LIVING
        </text>
        <text x="600" y="190" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">
          KITCHEN
        </text>
        <text x="463" y="380" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">
          STUDY
        </text>
      </g>
    </g>

    {/* ---- layer 4: dimensions, section mark, north -------------------- */}
    <g className="sk-dims" stroke="currentColor" strokeWidth="0.65" opacity="0.65">
      {/* running dimension below */}
      <path d="M110 505 L670 505" />
      <path d="M110 499 L110 511 M390 499 L390 511 M670 499 L670 511" />
      <text x="250" y="523" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">
        11 200
      </text>
      <text x="530" y="523" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none">
        11 200
      </text>

      {/* vertical dimension */}
      <path d="M84 110 L84 460" />
      <path d="M78 110 L90 110 M78 460 L90 460" />
      <text x="72" y="290" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none" transform="rotate(-90 72 290)">
        14 000
      </text>

      {/* section cut line A–A */}
      <g strokeWidth="0.8" opacity="0.75">
        <path d="M96 350 L140 350 M640 350 L700 350" />
        <path d="M132 344 L140 350 L132 356" />
        <path d="M648 344 L640 350 L648 356" />
        <text x="96" y="341" fontSize="9" fill="currentColor" stroke="none">
          A
        </text>
        <text x="694" y="341" fontSize="9" fill="currentColor" stroke="none">
          A
        </text>
      </g>

      {/* north point */}
      <g transform="translate(714 96)">
        <circle r="15" strokeWidth="0.65" />
        <path d="M0 -12 L4.5 5 L0 1 L-4.5 5 Z" fill="currentColor" stroke="none" opacity="0.85" />
        <text y="-19" textAnchor="middle" fontSize="8" fill="currentColor" stroke="none">
          N
        </text>
      </g>
    </g>
  </svg>
);

export default SketchPlan;
