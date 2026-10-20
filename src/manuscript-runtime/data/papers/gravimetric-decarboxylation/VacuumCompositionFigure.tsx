/** Schematic composition inference, not a pressure setpoint or experimental measurement. */
export function VacuumCompositionFigure() {
  return <figure className="research-scientific-figure research-gas-figure my-5 rounded-lg border border-[var(--border)] bg-[var(--figure-bg)] p-3">
    <svg viewBox="0 0 700 218" className="h-auto w-full" role="img"
      aria-labelledby="vacuum-composition-title vacuum-composition-desc">
      <title id="vacuum-composition-title">Idealized CO₂ partial-pressure inference after a low-pressure gas baseline</title>
      <desc id="vacuum-composition-desc">An initial 0.50 PSIA gas charge at 21 degrees Celsius becomes about
        0.66 PSIA at 115 degrees Celsius. In a hypothetical 40 PSIA total headspace, the original gas
        contributes 1.65 percent and reaction-associated CO2 contributes the remaining 98.35 percent,
        assuming other gas sources are negligible.</desc>
      <g fontFamily="sans-serif">
        <text x="16" y="22" fontSize="14" fontWeight="650" fill="var(--text)">Conditional headspace composition</text>
        <text x="16" y="45" fontSize="12" fill="var(--text-secondary)">
          Baseline: 0.50 PSIA at 21°C; observation: 40.00 PSIA at 115°C
        </text>
        <rect x="16" y="65" width="668" height="45" rx="5" fill="var(--sidenote-bg)" stroke="var(--border)"/>
        <path d="M21 70H668V105H21Z" fill="var(--research-gas-fill)"/>
        <rect x="668" y="70" width="11" height="35" rx="2" fill="var(--text-muted)" opacity=".8"/>
        <text x="34" y="93" fontSize="13" fontWeight="650" fill="var(--research-on-gas)">Estimated CO₂: 39.34 PSIA</text>
        <line x1="673" x2="673" y1="112" y2="133" stroke="var(--text-muted)" strokeWidth="1.4"/>
        <g fill="var(--text-secondary)" fontSize="12">
          <text x="16" y="136">CO₂ contribution</text>
          <text x="16" y="153" fontWeight="650" fill="var(--text)">98.35% of total pressure</text>
          <text x="684" y="149" textAnchor="end">Original gas: 0.66 PSIA (1.65%)</text>
        </g>
        <line x1="16" y1="169" x2="684" y2="169" stroke="var(--border)"/>
        <text x="16" y="190" fontSize="12" fill="var(--text)">
          P(CO₂) ≈ P(total) − P(initial gas, temperature-corrected)
        </text>
        <text x="16" y="208" fontSize="11" fill="var(--text-muted)">
          Calculation only. Other vapors, initial CO₂, leaks and gas-liquid exchange are excluded.
        </text>
      </g>
    </svg>
    <figcaption className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">
      Figure 5. Why a low initial gas inventory can help infer CO₂ partial pressure without a
      dedicated gas-composition instrument. This schematic assumes a sealed headspace and
      negligible other gases. It is not a measured composition or a recommended pressure.
      After venting, the original-gas contribution must also be corrected for gas released
      in each measured event.
    </figcaption>
  </figure>;
}
