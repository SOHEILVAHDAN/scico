/**
 * Exploded axonometric — the massing pulled apart into its layers,
 * which is how the concept is usually explained in a review.
 */
const SketchAxo = ({ className = '' }) => (
  <svg viewBox="0 0 800 560" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    {/* ---- layer 1: projection guides --------------------------------- */}
    <g className="sk-grid" stroke="currentColor" strokeWidth="0.5" opacity="0.2" strokeDasharray="3 6">
      {[
        [230, 130],
        [400, 60],
        [570, 130],
      ].map(([x, y]) => (
        <line key={`${x}`} x1={x} y1={y} x2={x} y2="520" />
      ))}
    </g>

    {/* ---- layer 2: roof plane ---------------------------------------- */}
    <g className="sk-walls" stroke="currentColor" strokeWidth="1.8">
      <path d="M400 60 L570 160 L400 260 L230 160 Z" />
      <path d="M400 76 L544 160 L400 244 L256 160 Z" strokeWidth="0.7" opacity="0.45" />
      {/* fall arrows */}
      <g opacity="0.5" strokeWidth="0.7">
        <path d="M340 130 L400 165" strokeDasharray="4 4" />
        <path d="M392 156 L400 166 L390 168" />
      </g>
    </g>

    {/* ---- layer 3: primary volume ------------------------------------ */}
    <g className="sk-openings" stroke="currentColor" strokeWidth="1.8">
      <path d="M400 210 L570 310 L400 410 L230 310 Z" />
      <path d="M230 310 L230 390 L400 490 L400 410" />
      <path d="M570 310 L570 390 L400 490" />

      {/* facade rhythm on the two visible faces */}
      <g strokeWidth="0.8" opacity="0.6">
        {[1, 2, 3, 4].map((i) => (
          <line key={`l${i}`} x1={230 + i * 34} y1={310 + i * 20} x2={230 + i * 34} y2={390 + i * 20} />
        ))}
        {[1, 2, 3, 4].map((i) => (
          <line key={`r${i}`} x1={570 - i * 34} y1={310 + i * 20} x2={570 - i * 34} y2={390 + i * 20} />
        ))}
      </g>
    </g>

    {/* ---- layer 4: base, explode arrows, annotation ------------------- */}
    <g className="sk-dims" stroke="currentColor">
      {/* podium */}
      <g strokeWidth="1.4" opacity="0.8">
        <path d="M400 440 L600 558" strokeDasharray="0" opacity="0" />
        <path d="M400 430 L590 542" strokeWidth="0.6" opacity="0.3" strokeDasharray="4 5" />
      </g>

      {/* explode arrows between the layers */}
      <g strokeWidth="0.8" opacity="0.6">
        <path d="M400 274 L400 200" strokeDasharray="5 5" />
        <path d="M394 214 L400 196 L406 214" />
        <path d="M400 424 L400 470" strokeDasharray="5 5" />
        <path d="M394 456 L400 474 L406 456" />
      </g>

      {/* leader lines + labels */}
      <g strokeWidth="0.7" opacity="0.75">
        <path d="M570 160 L660 130 L700 130" />
        <text x="704" y="127" fontSize="10" fill="currentColor" stroke="none">
          ROOF · SHADING
        </text>

        <path d="M570 360 L660 330 L700 330" />
        <text x="704" y="327" fontSize="10" fill="currentColor" stroke="none">
          PROGRAMME
        </text>

        <path d="M400 490 L470 520 L520 520" />
        <text x="524" y="517" fontSize="10" fill="currentColor" stroke="none">
          GROUND · ACCESS
        </text>
      </g>
    </g>
  </svg>
);

export default SketchAxo;
