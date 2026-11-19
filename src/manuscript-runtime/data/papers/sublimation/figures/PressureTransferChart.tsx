import { useMemo, useState } from 'react';
import { ResearchSlider } from '../../../../components/controls/ResearchSlider';
import { ScientificFigureCaption } from '../../../../components/typography/ScientificFigureCaption';
import { sublimationPressure, FtoK } from '../../../../utils/iapws-sublimation';
import { SATURATING_PARAMS, boundedPStarSeries, kSaturating, normalizedSeriesScore } from '../pressureModel';
import { ScientificLinePlot, type ScientificSeries } from './ScientificLinePlot';
import { PressureTransferTable } from './PressureTransferTable';

interface PressureTransferChartProps { isDark?: boolean }
type Lens = 'heat' | 'vapor' | 'response';
const pressures = Array.from({length:151}, (_,i) => 10 + i * (1490 / 150));
const fmt = (n:number) => Number.isFinite(n) ? n.toFixed(1) : 'n/a';
const definitions: Record<Lens,{ title:string; subtitle:string; key:string; color:string; unit:string }> = {
  heat: { title:'Gas-mediated heat transfer', subtitle:'Kc + Kr + Kg(P)',key:'k',color:'#4387b6',unit:'W/(m²·K)' },
  vapor: { title:'Water-vapor potential', subtitle:'Psub(Ti) − pH₂O',key:'potential',color:'#9b7049',unit:'mTorr' },
  response: { title:'Coupled model response', subtitle:'Series score relative to 50 mTorr',key:'score',color:'#7064a4',unit:'× reference' },
};
export function PressureTransferChart({ isDark: _isDark = false }: PressureTransferChartProps) {
  const [tempF,setTempF] = useState(20);
  const [fH2O,setFH2O] = useState(0.5);
  const [eta,setEta] = useState(1);
  const [active,setActive] = useState<Lens>('response');
  const pIce = useMemo(()=>sublimationPressure(FtoK(tempF)).p_mmHg * 1000,[tempF]);
  const pStar = useMemo(()=>boundedPStarSeries(pIce,fH2O,eta,10,1500),[pIce,fH2O,eta]);
  const modelData = useMemo(()=>{
    const base=normalizedSeriesScore(50,pIce,fH2O,eta);
    return pressures.map(pressure=>({
      pressure,
      k:kSaturating(pressure),
      potential:pIce-fH2O*pressure,
      score:base>0?normalizedSeriesScore(pressure,pIce,fH2O,eta)/base:0,
    }));
  },[pIce,fH2O,eta]);
  const panels = useMemo(()=>{
    const extremes = (key:Lens) => {
      const values=modelData.map(row=> key==='heat'?row.k:key==='vapor'?row.potential:row.score);
      const lo=Math.min(...values),hi=Math.max(...values),range=Math.max(1,hi-lo);
      if(key==='heat') return {domain:[0,17] as [number,number],ticks:[0,5,10,15]};
      if(key==='response'){
        const top=Math.max(1.2,Math.ceil(hi*1.1*2)/2);
        return {domain:[0,top] as [number,number],ticks:[0,top/3,2*top/3,top]};
      }
      const low=lo-range*.1,high=hi+range*.1;
      return {domain:[low,high] as [number,number],ticks:[low,(low+high)/2,high]};
    };
    return (Object.keys(definitions) as Lens[]).map(key=>{
      const def=definitions[key];
      const values=modelData.map(row=>({x:row.pressure,y:row[key==='heat'?'k':key==='vapor'?'potential':'score']}));
      const range=extremes(key);
      const series:ScientificSeries[]=[{name:def.title,color:def.color,values}];
      return {...def,key,series,...range};
    });
  },[modelData]);
  return (
    <>
      <figure className="lyo-pressure-explorer research-scientific-figure">
        <ScientificFigureCaption
          title="Pressure changes the thermal supply and vapor-transfer potential in opposite directions"
          detail="Fixed-coefficient analytical sensitivity; select a physical quantity to inspect on mobile."
        />
        <div className="lyo-mobile-scenario">
          <div className="lyo-pressure-controls no-print">
            <ResearchSlider label="Ice-interface temperature" value={tempF} min={-40} max={30} step={1} unit="°F" onChange={setTempF} formatValue={v=>v.toFixed(0)+'°F'} />
            <ResearchSlider label="Water-vapor mole fraction" value={fH2O} min={0.1} max={0.8} step={0.05} onChange={setFH2O} formatValue={v=>(v*100).toFixed(0)+'%'} />
            <ResearchSlider label="Series resistance η" value={eta} min={0} max={10} step={0.25} onChange={setEta} formatValue={v=>v.toFixed(2)} />
          </div>
        </div>
        <div className="lyo-pressure-metrics">
          <span>Ice equilibrium <strong>{fmt(pIce)} mTorr</strong></span>
          <span>Modeled stationary pressure <strong>{fmt(pStar)} mTorr</strong></span>
        </div>
        <div className="lyo-mobile-lens-tabs" role="group" aria-label="Choose a pressure-response chart">
          {(['heat','vapor','response'] as Lens[]).map((key,i)=>
            <button key={key} aria-pressed={active===key} type="button"
              onClick={()=>setActive(key)}><span>{['01','02','03'][i]}</span>{['Heat','Vapor','Coupled'][i]}</button>
          )}
        </div>
        <div className="lyo-pressure-panels">
          {panels.map((panel,index)=>(
            <section key={panel.key} className="lyo-pressure-panel" data-active={active===panel.key}
              aria-label={panel.title}>
              <div className="lyo-pressure-panel-head">
                <span className="lyo-mobile-panel-index">{['01','02','03'][index]}</span>
                <strong>{panel.title}</strong>
                <span>{panel.subtitle}</span>
              </div>
              <ScientificLinePlot
                series={panel.series} xDomain={[10,1500]} yDomain={panel.domain}
                xTicks={[10,500,1000,1500]} yTicks={panel.ticks}
                xLabel="Total chamber pressure (mTorr)" yLabel={panel.unit}
                description={`${panel.title}: calculated ${panel.subtitle}, with chamber pressure 10 through 1500 millitorr. Modeled ice equilibrium ${fmt(pIce)} millitorr, assumed vapor fraction ${fH2O.toFixed(2)}, resistance ratio ${eta}.`}
                zeroLine={panel.key==='vapor'}
                markerX={panel.key==='response'?pStar:undefined}
                markerLabel={panel.key==='response'?'Stationary point':undefined}
              />
              <p className="lyo-mobile-panel-meaning">
                {panel.key==='heat'
                ? <>Heat-transfer conductance increases with total pressure in the assumed saturating gas-transfer law. The radiative coefficient remains {SATURATING_PARAMS.kr.toFixed(1)} W/(m²·K).</>
                :panel.key==='vapor'
                ? <>The signed potential uses the assumed H₂O mole fraction. Values below zero favor deposition at the specified ice interface.</>
                :<>The stationary pressure is a mathematical maximum of the specified series score, not a measured drying-rate maximum.</>}
              </p>
            </section>
          ))}
        </div>
        <details className="lyo-mobile-figure-method">
          <summary>Model definitions and boundaries</summary>
          <p>Each panel uses the same total-pressure coordinate. The gas-conduction term has fixed prescribed coefficients; the heat-transfer model excludes the uncalibrated flow term. Water-vapor potential and thermal conductance are separate quantities with separate units. The model score is dimensionless after normalization to 50 mTorr.</p>
        </details>
      </figure>
      <details className="lyo-mobile-data-disclosure">
        <summary>Inspect the ten-condition numerical table</summary>
        <PressureTransferTable tempF={tempF} fH2O={fH2O} eta={eta} />
      </details>
    </>
  );
}
