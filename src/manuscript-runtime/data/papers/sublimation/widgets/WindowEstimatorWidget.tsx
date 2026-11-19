import { useMemo, useState } from 'react';
import { ManuscriptLabel } from '../../../../components/typography/ManuscriptLabel';
import { ScientificFigureCaption } from '../../../../components/typography/ScientificFigureCaption';
import { ResearchSlider } from '../../../../components/controls/ResearchSlider';
import { sublimationPressure, FtoK } from '../../../../utils/iapws-sublimation';
import { boundedPStarSeries, pStarScreening } from '../pressureModel';
import { ScientificLinePlot } from '../figures/ScientificLinePlot';

interface WindowEstimatorWidgetProps { className?: string; isDark?: boolean }
const resistanceValues=Array.from({length:81},(_,i)=>i/8);
const saturationAt=(tempF:number)=>sublimationPressure(FtoK(tempF)).p_mmHg*1000;
export function WindowEstimatorWidget({className}:WindowEstimatorWidgetProps) {
  const [iceTempF,setIceTempF]=useState(20);
  const [vaporFraction,setVaporFraction]=useState(.5);
  const [eta,setEta]=useState(3);
  const pIce=useMemo(()=>saturationAt(iceTempF),[iceTempF]);
  const screening=useMemo(()=>Math.max(50,Math.min(1500,pIce/vaporFraction*.999999,pStarScreening(pIce,vaporFraction))),[pIce,vaporFraction]);
  const data=useMemo(()=>resistanceValues.map(x=>({
    eta:x,screening,series:boundedPStarSeries(pIce,vaporFraction,x,50,1500),
  })),[pIce,vaporFraction,screening]);
  const chosen=boundedPStarSeries(pIce,vaporFraction,eta,50,1500);
  const gap=screening-chosen;
  return (
    <figure className={'lyo-window-figure research-scientific-figure '+(className??'')}>
      <ScientificFigureCaption
        title="The modeled operating window moves as product resistance increases"
        detail="Explore how a fixed screening optimum separates from the coupled resistance model."
      />
      <div className="lyo-mobile-model-statement">
        <ManuscriptLabel>At resistance η = {eta.toFixed(2)}</ManuscriptLabel>
        <strong>{chosen.toFixed(0)} <small>mTorr</small></strong>
        <p>Series-model stationary pressure; {gap.toFixed(0)} mTorr {gap>=0?'below':'above'} the screening-only value.</p>
      </div>
      <div className="lyo-window-controls no-print">
        <ResearchSlider label="Product-side resistance η" value={eta} min={0} max={10} step={0.25}
          onChange={setEta} formatValue={v=>v.toFixed(2)} />
        <ResearchSlider label="Ice-interface temperature" value={iceTempF} min={-40} max={30} step={1}
          unit="°F" onChange={setIceTempF} formatValue={v=>v.toFixed(0)+'°F'} />
        <ResearchSlider label="Water-vapor mole fraction" value={vaporFraction} min={0.1} max={0.8} step={0.05}
          onChange={setVaporFraction} formatValue={v=>(v*100).toFixed(0)+'%'} />
      </div>
      <ScientificLinePlot
        series={[
          {name:'Screening-only',color:'#8c8b98',dashed:true,values:data.map(d=>({x:d.eta,y:d.screening}))},
          {name:'With series resistance',color:'#4387b6',values:data.map(d=>({x:d.eta,y:d.series}))},
        ]}
        xDomain={[0,10]} yDomain={[0,1500]}
        xTicks={[0,2.5,5,7.5,10]} yTicks={[0,500,1000,1500]}
        markerX={eta} markerLabel="Selected η"
        xLabel="Product-side resistance ratio η" yLabel="Pressure (mTorr)"
        description={`Screening stationary pressure remains ${screening.toFixed(0)} millitorr over resistance ratio eta zero through ten; the series model moves toward ${data[data.length-1].series.toFixed(0)} millitorr at eta ten. Selected eta ${eta} gives ${chosen.toFixed(0)} millitorr.`}
      />
      <div className="lyo-window-metrics">
        <span>Ice equilibrium <strong>{pIce.toFixed(0)} mTorr</strong></span>
        <span>Screening-only <strong>{screening.toFixed(0)} mTorr</strong></span>
        <span>With resistance <strong>{chosen.toFixed(0)} mTorr</strong></span>
      </div>
      <p className="lyo-evidence-note">
        Both curves use fixed heat-transfer coefficients, the same assumed gas
        composition, and a bounded exploratory pressure interval of 50–1500 mTorr.
        Their stationary points are mathematical sensitivity results, not measured
        drying-rate maxima or operating prescriptions.
      </p>
    </figure>
  );
}
