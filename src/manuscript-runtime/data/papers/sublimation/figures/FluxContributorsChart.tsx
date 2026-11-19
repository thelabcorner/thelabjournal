import { useMemo, useState } from 'react';
import { ManuscriptLabel } from '../../../../components/typography/ManuscriptLabel';
import { ScientificFigureCaption } from '../../../../components/typography/ScientificFigureCaption';
import { SATURATING_PARAMS, kgSaturating, kSaturating } from '../pressureModel';
import { ScientificLinePlot } from './ScientificLinePlot';

interface FluxContributorsChartProps { isDark?: boolean }
const { kc, kr, c2, c3 } = SATURATING_PARAMS;
const steps = [10, 50, 100, 200, 500, 1500] as const;
const pressures = Array.from({ length: 150 }, (_, i) => 10 * (150 ** (i / 149)));
const shareAt = (pressure: number) => {
  const total = kSaturating(pressure);
  return { pressure, contact: 100 * kc / total, radiation: 100 * kr / total, gas: 100 * kgSaturating(pressure) / total };
};
function CompositionBar({ pressure }: { pressure: number }) {
  const d = shareAt(pressure);
  return (
    <div className="lyo-mobile-composition">
      <div className="lyo-mobile-composition-head">
        <strong>{pressure.toLocaleString()} mTorr</strong><span>{d.radiation.toFixed(1)}% radiation</span>
      </div>
      <div className="lyo-mobile-composition-bar" role="img" aria-label={`At ${pressure} millitorr, constant contact coefficient represents ${d.contact.toFixed(1)}%, constant radiative coefficient ${d.radiation.toFixed(1)}%, gas conduction ${d.gas.toFixed(1)}% of the total`}>
        <span style={{width:d.contact+'%',background:'#a18662'}} />
        <span style={{width:d.radiation+'%',background:'#8895a8'}} />
        <span style={{width:d.gas+'%',background:'#4387b6'}} />
      </div>
    </div>
  );
}

export function FluxContributorsChart({ isDark: _isDark = false }: FluxContributorsChartProps) {
  const [selected, setSelected] = useState<number>(500);
  const selectedShare = shareAt(selected);
  const series = useMemo(() => [
    { name: 'Total', color: 'var(--foreground)', values: pressures.map(x => ({x, y:kSaturating(x)})), thickness:3.1 },
    { name: 'Gas conduction', color: '#4387b6', values: pressures.map(x => ({x,y:kgSaturating(x)})) },
    { name: 'Radiation · fixed', color: '#8895a8', dashed:true, values: [{x:10,y:kr},{x:1500,y:kr}] },
    { name: 'Contact · fixed', color: '#a18662', dashed:true, values: [{x:10,y:kc},{x:1500,y:kc}] },
  ], []);
  return (
    <figure className="lyo-model-transfer research-scientific-figure">
      <ScientificFigureCaption
        title="The radiation fraction falls while its coefficient remains constant"
        detail="Reduced-order coefficients, not measured tray heat flux."
      />
      <div className="lyo-mobile-model-statement">
        <ManuscriptLabel>Fixed model coefficient</ManuscriptLabel>
        <strong>K<sub>r</sub> = {kr.toFixed(1)} W/(m²·K)</strong>
        <p>Radiation has the same assigned coefficient at every pressure. Rising gas conduction increases the denominator.</p>
      </div>
      <div className="lyo-mobile-pressure-picks" aria-label="Compare modeled pressure conditions">
        {steps.map(p => <button key={p} type="button" aria-pressed={p===selected}
          onClick={()=>setSelected(p)}>{p >= 1000 ? (p/1000).toFixed(1)+'k' : p}<span>mTorr</span></button>)}
      </div>
      <ScientificLinePlot
        series={series} xDomain={[10,1500]} xScale="log"
        yDomain={[0,17]} xTicks={[10,50,200,500,1500]} yTicks={[0,5,10,15]}
        xLabel="Total pressure (mTorr) · log scale" yLabel="W/(m²·K)"
        markerX={selected}
        description="Total and gas-conduction model heat-transfer coefficients increase across 10 to 1500 millitorr. Radiation is a flat 2.0 and contact a flat 1.2 watts per square meter per kelvin."
      />
      <div className="lyo-mobile-normalized" aria-label="Compare absolute constants and normalized percentage">
        <div className="lyo-mobile-section-name">The same model normalized to 100%</div>
        <div className="lyo-mobile-composition-legend">
          <span><i style={{background:'#a18662'}}/>Contact</span>
          <span><i style={{background:'#8895a8'}}/>Radiation</span>
          <span><i style={{background:'#4387b6'}}/>Gas conduction</span>
        </div>
        <CompositionBar pressure={10} />
        <div className="lyo-mobile-comparison-arrow" aria-hidden="true">↓ pressure changes; <strong>K<sub>r</sub> does not</strong></div>
        <CompositionBar pressure={selected} />
        <p>Radiation is <strong>{kr.toFixed(1)} W/(m²·K)</strong> in both cases, but its share changes from <strong>{shareAt(10).radiation.toFixed(1)}%</strong> to <strong>{selectedShare.radiation.toFixed(1)}%</strong>.</p>
      </div>
      <details className="lyo-mobile-figure-method">
        <summary>Model assumptions and equation</summary>
        <p>K<sub>total</sub> = K<sub>c</sub> + K<sub>r</sub> + K<sub>g</sub>(P), where K<sub>c</sub> = {kc}, K<sub>r</sub> = {kr}, and K<sub>g</sub>(P) = C<sub>2</sub>P/(P+C<sub>3</sub>), C<sub>2</sub> = {c2} W/(m²·K), C<sub>3</sub> = {c3} mTorr. The flow term is omitted. These prescribed coefficients require a temperature difference to represent heat flux.</p>
      </details>
    </figure>
  );
}
