import { InlineCite } from '../../../../components/prose/InlineCite';
import { InlineMath } from '../ScientificMath';
import { ScientificFigureCaption } from '../../../../components/typography/ScientificFigureCaption';
import { ScientificLinePlot } from './ScientificLinePlot';

import {
  GANGULY_2010_FIG_13_FITS as regressions,
  GANGULY_2010_FIG_13_RADIATION_W_M2 as radiationReference,
  GANGULY_2010_FIG_14,
  GANGULY_2014_FIG_2_1,
} from './gangulyFigureData';

/** Source-label subset for immediate comparison; all labels are available below. */
const shares = GANGULY_2014_FIG_2_1.filter(row =>
  row.configuration === 'Direct contact' && [10, 100].includes(row.pressure),
);
const suspendedShares = GANGULY_2014_FIG_2_1.filter(row =>
  row.configuration === '3 mm' && [10, 100, 200].includes(row.pressure),
);
const modes = [
  { key: 'radiation', name: 'Radiation', className: 'lyo-mode-radiation' },
  { key: 'contact', name: 'Contact', className: 'lyo-mode-contact' },
  { key: 'gas', name: 'Gas conduction', className: 'lyo-mode-gas' },
  { key: 'flow', name: 'Flow-associated residual', className: 'lyo-mode-flow' },
] as const;
const fittedFlux = (slope: number, intercept: number, pressure: number) =>
  slope * pressure + intercept;
const directFit = regressions[0];
const fractionalRadiation = (pressure: number) =>
  100 * radiationReference / fittedFlux(directFit.slope, directFit.intercept, pressure);

/**
 * Two different views of the published evidence:
 *   A: absolute 2010 fitted total flux and constant-condition radiative reference;
 *   B: normalized 2014 heat-transfer pathway fractions.
 * They must never be combined as though they form one raw experimental dataset.
 */
export function GangulyExperimentalEvidenceFigure() {
  return (
    <figure className="lyo-evidence-figure research-scientific-figure">
      <ScientificFigureCaption
        title="Pressure-dependent heat transfer: absolute flux versus normalized contribution"
        detail="Ganguly et al. (2010), Figure 13, and Ganguly (2014), Figure 2.1. Separate source datasets."
      />
      <div className="lyo-evidence-equation">
        <strong>Radiative heat flux remains constant across a fixed-boundary pressure sweep.</strong>
        <p>
          At fixed surface temperatures, emissivities and geometry, radiative heat flux is
          independent of gas pressure. Its share of total heat transfer can fall solely
          because other pathways carry more heat.
        </p>
        <div className="lyo-evidence-equation-math">
          <InlineMath math={String.raw`q_{\mathrm{rad}}\approx\mathrm{constant}`}/>
          <span aria-hidden="true">·</span>
          <InlineMath math={String.raw`f_{\mathrm{rad}}=\frac{q_{\mathrm{rad}}}{q_{\mathrm{total}}}`}/>
        </div>
      </div>
      <div className="lyo-evidence-panel">
        <div className="lyo-evidence-panel-heading">
          <strong>A. Absolute heat flux</strong>
          <span>2010 Figure 13 · fitted total flux, plus reported radiation reference</span>
        </div>
        <div className="lyo-mobile-radiation-fact" aria-label="Radiation stays constant while its share changes">
          <div><span>Radiative reference</span><strong>2,666 <small>W/m²</small></strong><em>constant across 10–100 mTorr</em></div>
          <div><span>Fraction at 10 mTorr</span><strong>{fractionalRadiation(10).toFixed(1)}%</strong><em>of fitted total</em></div>
          <div><span>Fraction at 100 mTorr</span><strong>{fractionalRadiation(100).toFixed(1)}%</strong><em>of fitted total</em></div>
        </div>
        <ScientificLinePlot
          description="From 10 to 100 millitorr, a constant 2666 W/m² radiative reference while direct-contact fitted total heat flux rises from 3412 to 5320 W/m² and a 3 mm suspended vial total rises from 2778 to 3480 W/m²."
          series={[
            { name: 'Total · direct contact', color: '#aa7556', values: [10,40,100].map(x => ({x,y:fittedFlux(regressions[0].slope,regressions[0].intercept,x)})) },
            { name: 'Total · 3 mm gap', color: '#4387b6', values: [10,40,100].map(x => ({x,y:fittedFlux(regressions[3].slope,regressions[3].intercept,x)})) },
            { name: 'Radiation · fixed', color: '#8895a8', dashed: true, values: [10,100].map(x => ({x,y:radiationReference})) },
          ]}
          xDomain={[10,100]} yDomain={[2400,5500]}
          xTicks={[10,40,70,100]} yTicks={[2600,3600,4600,5400]}
          xLabel="Chamber pressure (mTorr)" yLabel="Heat flux (W/m²)"
        />
        <p className="lyo-evidence-note">
          Radiation is the horizontal reference; the upward curves represent total heat
          flux predicted by the published linear regressions. The reference is a modeled
          constant-boundary contribution, not separately measured radiative calorimetry.
          It is not an intercept fitted to the other lines.
        </p>

        <p className="lyo-evidence-note">
          Both percentages above use the <em>same</em> 2,666 W/m² numerator.
          Only the fitted total increases, from 3,412 to 5,320 W/m². These calculated
          ratios are illustrative checks on the 2010 fit, not transcriptions of
          its pie-chart percentage labels.
        </p>
      </div>
      <div className="lyo-evidence-panel">
        <div className="lyo-evidence-panel-heading">
          <strong>B. Percentage of the total</strong>
          <span>2014 dissertation Figure 2.1 · transcribed published labels</span>
        </div>
        <div className="lyo-evidence-legend">
          {modes.map(mode => <span key={mode.key}><i className={mode.className} aria-hidden="true" />{mode.name}</span>)}
        </div>
        <div className="lyo-evidence-rows">
          {shares.map(row => {
            const total = row.radiation + row.contact + row.gas + row.flow;
            return (
              <div className="lyo-evidence-row" key={row.configuration + row.pressure}>
                <span className="lyo-evidence-label">{row.configuration} · {row.pressure} mTorr</span>
                <div className="lyo-evidence-bar" role="img" aria-label={row.configuration + ' at ' + row.pressure + ' mTorr: ' + row.radiation + '% radiation, ' + row.contact + '% contact, ' + row.gas + '% gas conduction, ' + row.flow + '% inferred flow contribution'}>
                  {modes.map(mode => {
                    const amount = row[mode.key];
                    return amount > 0 ? <span key={mode.key} className={mode.className} style={{ width: (100 * amount / total) + '%' }} title={mode.name + ': ' + amount + '%'} /> : null;
                  })}
                </div>
                <span className="lyo-evidence-sum">{row.radiation}% radiation · {row.gas + row.flow}% gas + flow</span>
              </div>
            );
          })}
        </div>
        <details className="lyo-mobile-figure-method">
          <summary>Compare suspended-vial geometry</summary>
          <div className="lyo-evidence-rows">
            {suspendedShares.map(row => {
              const total = row.radiation + row.contact + row.gas + row.flow;
              return (
                <div className="lyo-evidence-row" key={row.configuration + row.pressure}>
                  <span className="lyo-evidence-label">3 mm separation · {row.pressure} mTorr</span>
                  <div className="lyo-evidence-bar" role="img" aria-label={`3 mm gap at ${row.pressure} mTorr: ${row.radiation}% radiation, ${row.gas}% gas conduction and ${row.flow}% residual flow`}>
                    {modes.map(mode => {
                      const amount = row[mode.key];
                      return amount > 0 ? <span key={mode.key} className={mode.className} style={{width:100*amount/total+'%'}}/> : null;
                    })}
                  </div>
                  <span className="lyo-evidence-sum">{row.radiation}% radiation · {row.gas+row.flow}% gas + flow</span>
                </div>
              );
            })}
          </div>
        </details>
        <p className="lyo-evidence-note">
          Radiation decreases from 69% to 45% of total inferred heat transfer in
          the direct-contact bars between 10 and 100 mTorr. These are <em>normalized
          fractions</em>. With radiative flux held constant, the 69% to 45%
          shift corresponds to a roughly 1.53-fold increase in total flux,
          even though radiative flux itself is unchanged. The flow-associated
          component is inferred as a residual, not measured independently.
          <InlineCite refs={['ganguly2014', 'ganguly2010']} />
        </p>
        <details className="lyo-evidence-source-table">
          <summary>Inspect all published percentage labels (2014: 20 conditions; 2010: 16 conditions)</summary>
          <p>These are separate, transcribed figure-label datasets. Rounded totals can differ from 100% by one point.</p>
          {[
            { name: '2014 dissertation, Figure 2.1', rows: GANGULY_2014_FIG_2_1 },
            { name: '2010 conference paper, Figure 14', rows: GANGULY_2010_FIG_14 },
          ].map(dataset => (
            <div key={dataset.name} className="lyo-evidence-dataset">
              <strong>{dataset.name}</strong>
              <div className="overflow-x-auto">
                <table className="research-data-table w-full">
                  <thead>
                    <tr><th scope="col">Vial position</th><th scope="col">P (mTorr)</th><th scope="col">Radiation (%)</th><th scope="col">Contact (%)</th><th scope="col">Gas (%)</th><th scope="col">Flow residual (%)</th></tr>
                  </thead>
                  <tbody>
                    {dataset.rows.map(row => (
                      <tr key={row.configuration + row.pressure}>
                        <td data-label="Position">{row.configuration}</td><td data-label="Pressure (mTorr)">{row.pressure}</td>
                        <td data-label="Radiation (%)">{row.radiation}</td><td data-label="Contact (%)">{row.contact}</td>
                        <td data-label="Gas (%)">{row.gas}</td><td data-label="Flow residual (%)">{row.flow}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </details>
      </div>
      <div className="lyo-evidence-fit">
        <strong>2010 Figure 13: reported linear regression coefficients</strong>
        <p>
          Fitted total heat flux, <em>q</em> = <em>aP</em> + <em>b</em>, for
          <em> P</em> = 10–100 mTorr. These are published fits rather than raw measurements.
        </p>
        <div className="overflow-x-auto">
          <table className="research-data-table w-full">
            <thead><tr><th scope="col">Vial position</th><th scope="col">a (W m⁻² mTorr⁻¹)</th><th scope="col">b (W m⁻²)</th><th scope="col">q at 10 mTorr</th><th scope="col">q at 100 mTorr</th></tr></thead>
            <tbody>{regressions.map(row => <tr key={row.name}><td data-label="Position">{row.name}</td><td data-label="Slope">{row.slope.toFixed(1)}</td><td data-label="Intercept">{row.intercept}</td><td data-label="10 mTorr flux">{Math.round(fittedFlux(row.slope, row.intercept, 10))}</td><td data-label="100 mTorr flux">{Math.round(fittedFlux(row.slope, row.intercept, 100))}</td></tr>)}</tbody>
          </table>
        </div>
        <p>
          The 2010 Figure 14 and 2014 Figure 2.1 pie-chart labels differ and are
          retained as separate transcriptions. Radiative transfer can change
          during actual drying if temperatures or radiative geometry change;
          the constant reference here isolates <em>pressure</em> at fixed boundaries.
        </p>
      </div>
    </figure>
  );
}
