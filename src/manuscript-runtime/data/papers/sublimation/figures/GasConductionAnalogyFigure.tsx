import { ScientificFigureCaption } from '../../../../components/typography/ScientificFigureCaption';

/**
 * Three physical uses of reduced gas-mediated heat transfer.
 * Conceptual illustration: neither scale nor molecule count is quantitative.
 */
const commonAtoms = [
  [31, 52], [79, 44], [55, 85], [111, 72], [89, 103],
] as const;

function Molecules({ x = 0, y = 0, sparse = false }: { x?: number; y?: number; sparse?: boolean }) {
  return (
    <g fill="var(--research-line-blue)" opacity="0.75">
      {commonAtoms.slice(0, sparse ? 2 : 5).map(([cx, cy], i) => (
        <circle key={i} cx={cx + x} cy={cy + y} r="2.5" />
      ))}
    </g>
  );
}

const diagrams = [
  {
    title: 'Vacuum-insulated vessel',
    description: 'Evacuating the wall gap suppresses gas-mediated heat leakage and helps preserve the temperature difference.',
    detail: 'Heat leakage remains through radiation and solid connections.',
  },
  {
    title: 'Thermocouple vacuum gauge',
    description: 'The heated sensing element loses energy to the surrounding gas. Its temperature response provides a pressure indication.',
    detail: 'Gas species alter the calibration.',
  },
  {
    title: 'Frozen product in a dryer',
    description: 'Residual gas can carry heat from warmer surroundings to a colder product, supplying part of the latent heat of sublimation.',
    detail: 'The size of this contribution depends on the complete thermal path.',
  },
] as const;

export function GasConductionAnalogyFigure() {
  return (
    <figure className="lyo-gas-analogy research-scientific-figure">
      <ScientificFigureCaption
        title="Gas-mediated heat transfer in three familiar and scientific applications"
        detail="Conceptual geometries. The same molecular energy-transfer principle serves different thermal objectives."
      />
      <div className="lyo-gas-analogy-grid">
        {diagrams.map((item, i) => (
          <section key={item.title} className="lyo-gas-analogy-cell" aria-label={item.title}>
            <div className="lyo-gas-analogy-sketch">
              {i === 0 ? (
                <svg viewBox="0 0 170 140" role="img" aria-label="Double-walled vessel and evacuated inter-wall space">
                  <path d="M51 17V10H119V17M39 19H131V109Q131 121 119 121H51Q39 121 39 109Z" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M60 29H110V103Q110 108 105 108H65Q60 108 60 103Z" fill="var(--research-blue-wash)" stroke="var(--research-line-blue)" strokeWidth="2.5"/>
                  <path d="M47 20H123" stroke="currentColor" strokeWidth="5" strokeLinecap="round"/>
                  <path d="M85 40V97" stroke="var(--research-line-blue)" strokeWidth="2" strokeDasharray="4 4"/>
                  <path d="M52 51L58 51M112 51L119 51M52 81L58 81M112 81L119 81" stroke="var(--research-thermal)" strokeWidth="2"/>
                  <circle cx="51" cy="63" r="2" fill="var(--research-line-blue)"/>
                  <circle cx="119" cy="91" r="2" fill="var(--research-line-blue)"/>
                  <text x="85" y="132" textAnchor="middle">Evacuated annulus</text>
                </svg>
              ) : i === 1 ? (
                <svg viewBox="0 0 170 140" role="img" aria-label="Heated sensor filament loses energy to molecules in vacuum gauge">
                  <rect x="27" y="16" width="116" height="103" rx="12" fill="none" stroke="currentColor" strokeWidth="2.5"/>
                  <path d="M85 45L75 55L95 65L75 75L95 85L85 96" fill="none" stroke="var(--research-thermal)" strokeWidth="3.5" strokeLinejoin="round"/>
                  <path d="M85 22V45M85 96V112" stroke="currentColor" strokeWidth="2"/>
                  <Molecules x={14} y={-10}/>
                  <path d="M102 63L120 55M102 76L124 86M68 67L50 60" fill="none" stroke="var(--research-thermal)" strokeWidth="1.5" strokeDasharray="3 3"/>
                  <text x="85" y="132" textAnchor="middle">Filament + residual gas</text>
                </svg>
              ) : (
                <svg viewBox="0 0 170 140" role="img" aria-label="Heated shelf, gas gap, and ice receiving heat">
                  <rect x="27" y="17" width="116" height="14" rx="2" fill="var(--research-amber-wash)" stroke="var(--research-thermal)" strokeWidth="2"/>
                  <path d="M47 24H123" stroke="var(--research-thermal)" strokeWidth="2.5"/>
                  <Molecules x={9} y={-5}/>
                  <path d="M65 39V77M85 39V77M105 39V77" stroke="var(--research-thermal)" strokeWidth="2" strokeDasharray="4 4"/>
                  <path d="M32 94H138V110H32Z" fill="var(--research-blue-wash)" stroke="var(--research-line-blue)" strokeWidth="2"/>
                  <path d="M32 114H138" stroke="currentColor" strokeWidth="2"/>
                  <text x="85" y="132" textAnchor="middle">Heat to subliming ice</text>
                </svg>
              )}
            </div>
            <strong>{item.title}</strong>
            <p>{item.description}</p>
            <p className="lyo-gas-analogy-detail">{item.detail}</p>
          </section>
        ))}
      </div>
      <div className="lyo-gas-analogy-common">
        <strong>Common variable: gas-mediated thermal transfer</strong>
        <p>As pressure decreases in the rarefied regime, fewer molecules carry energy
        between surfaces. Insulation uses this reduction to limit heat leakage;
        the thermocouple gauge detects it through a heated sensing element;
        and a subliming product can lose part of its thermal supply.</p>
      </div>
    </figure>
  );
}
