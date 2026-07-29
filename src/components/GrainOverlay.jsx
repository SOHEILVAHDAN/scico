/**
 * Fixed paper grain over the whole page. Generated as an inline SVG filter so
 * it costs nothing to download and scales with the viewport — it is what stops
 * the flat dark background from reading as a screen rather than a sheet.
 */
const GrainOverlay = () => (
  <div className="grain" aria-hidden="true">
    <svg width="100%" height="100%">
      <filter id="paper-grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#paper-grain)" />
    </svg>
  </div>
);

export default GrainOverlay;
