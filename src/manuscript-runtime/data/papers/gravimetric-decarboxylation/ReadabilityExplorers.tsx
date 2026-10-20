import { useId, useState } from 'react';
import {
  conservativeMassG, gaugeReadability, scaleReadability,
  type ReadabilityAssessment, type ReadabilityStatus,
} from './readability';

const scaleDefaults = { mass:'2', acid:'1', progress:'100', step:'0.001' };
const gaugeDefaults = { mass:'10', acid:'10', progress:'10', volume:'16', startTemp:'20', endTemp:'90', step:'0.1' };
const buttonStyle = 'h-7 shrink-0 rounded-md border border-[var(--border)] bg-[var(--bg-app)] px-2.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]';
const num = (s:string) => s.trim() ? Number(s) : NaN;
const precise = (v:number, sig=4) => !Number.isFinite(v) ? '—' : v===0 ? '0' : Number(v.toPrecision(sig)).toString();
const grams = (v:number) => precise(v,5) + ' g';
const useMass = (v:number) => Number(conservativeMassG(v).toPrecision(6)).toString();
const clamp = (v:number,min:number,max:number) => Math.max(min,Math.min(max,v));
const optionsMass = {min:0.001,max:1000};
const limits:Record<ReadabilityStatus,{name:string;description:string;color:string}> = {
  below: {name:'Below display threshold',description:'Expected signal is below the two-increment screening criterion.',color:'var(--status-danger-text)'},
  marginal: {name:'Visible with limited margin',description:'The two-increment criterion is met; the five-increment margin is not.',color:'var(--status-warning-text)'},
  clear: {name:'Clearly within display range',description:'Expected signal meets or exceeds five increments of the selected display criterion.',color:'var(--status-success-text)'},
};
type SliderProps = {
  label:string; value:string; onChange:(v:string)=>void; unit:string;
  min:number;max:number; sliderMin:number;sliderMax:number;
  precision?:number;scale?:'log'|'linear';steps?:readonly number[];hint?:string;
};
function SliderField({
  label,value,onChange,unit,min,max,sliderMin,sliderMax,
  precision=3,scale='linear',steps,hint,
}:SliderProps) {
  const id=useId();
  const v=num(value);
  const invalid=!Number.isFinite(v)||v<min||v>max;
  const nearest=steps ? Math.max(0,steps.reduce((best,n,i)=>Math.abs(n-v)<Math.abs(steps![best]-v)?i:best,0)) : 0;
  const progress=steps
    ? nearest
    : scale==='log'
      ? (Math.log10(clamp(Number.isFinite(v)?v:sliderMin,sliderMin,sliderMax))-Math.log10(sliderMin))/
          (Math.log10(sliderMax)-Math.log10(sliderMin))*1000
      : (clamp(Number.isFinite(v)?v:sliderMin,sliderMin,sliderMax)-sliderMin)/(sliderMax-sliderMin)*1000;
  const normalized=clamp(progress,0,steps?steps.length-1:1000);
  function changeRange(raw:string) {
    const p=Number(raw);
    if(steps) onChange(steps[Math.round(p)]?.toString()??value);
    else if(scale==='log') onChange(Number((10**(Math.log10(sliderMin)+p/1000*(Math.log10(sliderMax)-Math.log10(sliderMin)))).toPrecision(precision)).toString());
    else onChange(Number((sliderMin+p/1000*(sliderMax-sliderMin)).toFixed(precision)).toString());
  }
  return <div className="min-w-0 space-y-1.5">
    <div className="flex min-w-0 items-center justify-between gap-2">
      <label htmlFor={id} className="min-w-0 text-xs font-medium leading-snug text-[var(--text-secondary)]">{label}</label>
      <div className="flex h-7 max-w-[124px] shrink-0 items-center rounded-md border border-[var(--input-border)] bg-[var(--bg-app)] focus-within:ring-2 focus-within:ring-[var(--accent-muted)]">
        <input type="number" aria-label={label+' numeric value'} step="any"
          min={min} max={max} value={value} onChange={e=>onChange(e.target.value)}
          aria-invalid={invalid} className="h-full w-[63px] min-w-0 bg-transparent px-1.5 text-right text-xs tabular-nums text-[var(--text)] outline-none aria-invalid:text-[var(--danger)]" />
        <span className="shrink-0 pr-1.5 text-[11px] text-[var(--text-muted)]">{unit}</span>
      </div>
    </div>
    <input id={id} type="range" aria-label={label+' slider'}
      min={0} max={steps?steps.length-1:1000} step={steps?1:1}
      value={normalized} onChange={e=>changeRange(e.target.value)}
      className="research-range readability-range block w-full touch-pan-y"
      aria-valuetext={precise(v,6)+' '+unit} />
    <div className="flex items-center justify-between gap-1 text-[11px] leading-none tabular-nums text-[var(--text-muted)]">
      <span>{steps?precise(steps[0])+' '+unit:precise(sliderMin)+' '+unit}</span>
      <span>{steps?precise(steps[steps.length-1])+' '+unit:precise(sliderMax)+' '+unit}</span>
    </div>
    {hint && <p className="text-[11px] leading-snug text-[var(--text-muted)]">{hint}</p>}
  </div>;
}
function LiveSummary({readout,kind}:{readout:ReadabilityAssessment;kind:'scale'|'gauge'}) {
  const status=limits[readout.status];
  const steps=readout.steps;
  const fill=clamp(steps/8*100,0,100);
  return <div className="min-w-0 space-y-3">
    <div aria-live="polite" className="flex min-w-0 items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-xs text-[var(--text-muted)]">At the selected sample and instrument</div>
        <div className="mt-1 flex items-center gap-2 text-sm font-semibold leading-snug text-[var(--text)]">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{background:status.color}} />
          {status.name}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-2xl font-semibold leading-none tabular-nums text-[var(--text)]">{precise(steps,3)}×</div>
        <div className="mt-1 text-[11px] text-[var(--text-muted)]">display margin</div>
      </div>
    </div>
    <div>
      <div className="relative h-3 overflow-visible rounded-sm border border-[var(--border)] bg-[var(--bg-surface)]"
        role="img" aria-label={'Expected signal: '+precise(steps,3)+' times the instrument display criterion. Below 2 is below threshold; 2 to 5 is limited; 5 or more is clear.'}>
        <div className="absolute inset-y-0 left-0 rounded-sm bg-[var(--accent)]" style={{width:fill+'%'}}/>
        <div className="absolute inset-y-[-3px] left-1/4 w-px bg-[var(--text-secondary)]"/>
        <div className="absolute inset-y-[-3px] left-[62.5%] w-px bg-[var(--text-secondary)]"/>
      </div>
      <div className="relative mt-2 flex justify-between text-[11px] tabular-nums text-[var(--text-muted)]">
        <span>0</span><span className="absolute left-1/4 -translate-x-1/2">2× · threshold</span>
        <span className="absolute left-[62.5%] -translate-x-1/2">5× · clear</span><span>8+</span>
      </div>
    </div>
    <p className="text-xs leading-snug text-[var(--text-secondary)]">{status.description}</p>
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-[var(--border)] bg-[var(--border)]">
      <div className="min-w-0 bg-[var(--bg-app)] p-2.5">
        <div className="text-[11px] text-[var(--text-muted)]">Expected signal</div>
        <div className="mt-0.5 text-base font-semibold tabular-nums text-[var(--text)]">
          {kind==='scale' ? precise(readout.signal*1000,5)+' mg' : precise(readout.signal,5)+' PSI'}
        </div>
      </div>
      <div className="min-w-0 bg-[var(--bg-app)] p-2.5">
        <div className="text-[11px] text-[var(--text-muted)]">
          {kind==='scale'?'One scale increment':'Two-reading rounding bound'}
        </div>
        <div className="mt-0.5 text-base font-semibold tabular-nums text-[var(--text)]">
          {kind==='scale'?precise(readout.step*1000,5)+' mg':precise(readout.step,5)+' PSI'}
        </div>
      </div>
    </div>
  </div>;
}
function CompactMobileStatus({readout}:{readout:ReadabilityAssessment|null}) {
  if(!readout) return null;
  const info=limits[readout.status];
  return <div aria-live="polite" className="sticky top-16 z-10 -mx-3 -mt-3 mb-2 flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--bg-app)] px-3 py-2 @[600px]:hidden">
    <span className="flex min-w-0 items-center gap-2 text-xs font-medium text-[var(--text)]">
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{background:info.color}} />
      {info.name}
    </span>
    <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--text)]">{precise(readout.steps,3)}×</span>
  </div>;
}
function Thresholds({assessment,apply}:{assessment:ReadabilityAssessment;apply:(v:string)=>void}) {
  return <div className="grid grid-cols-2 gap-2">
    {([
      {label:'Minimum detectable',mass:assessment.minimumMassG,n:2},
      {label:'Clearer readout',mass:assessment.clearMassG,n:5},
    ] as const).map(row=><div key={row.n} className="min-w-0 rounded-md border border-[var(--border)] bg-[var(--bg-app)] p-2.5">
      <div className="text-[11px] leading-snug text-[var(--text-secondary)]">{row.label} · {row.n}×</div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-[var(--text)]">{grams(row.mass)}</div>
      <button type="button" onClick={()=>apply(useMass(row.mass))}
        className="mt-1 text-xs font-medium text-[var(--text-secondary)] underline underline-offset-2 hover:text-[var(--text)]">
        Try this mass
      </button>
    </div>)}
  </div>;
}
function Compare({title,steps,current,calc,unit}:{title:string;steps:readonly number[];current:number;calc:(v:number)=>ReadabilityAssessment|null;unit:string}) {
  return <div className="min-w-0">
    <div className="mb-2 text-xs font-medium text-[var(--text-secondary)]">{title}</div>
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      {steps.map(step=>{
        const a=calc(step);
        if(!a)return null;
        const chosen=current===step;
        return <div key={step}
          className={'min-w-0 rounded-md border p-2 tabular-nums '+(chosen?'border-[var(--accent)] bg-[var(--accent-muted)]':'border-[var(--border)] bg-[var(--bg-app)]')}>
          <div className="text-xs font-semibold text-[var(--text)]">{precise(step)} {unit}</div>
          <div className="mt-1 text-[11px] text-[var(--text-muted)]">2× at <span className="font-medium text-[var(--text)]">{grams(a.minimumMassG)}</span></div>
          <div className="text-[11px] text-[var(--text-muted)]">5× at <span className="font-medium text-[var(--text)]">{grams(a.clearMassG)}</span></div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-[var(--text-secondary)]">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full" style={{background:limits[a.status].color}}/>
            {a.status==='below'?'Below':a.status==='marginal'?'Limited':'Clear'} at your sample
          </div>
        </div>;
      })}
    </div>
  </div>;
}
function Frame({title,description,reset,children}:{title:string;description:string;reset:()=>void;children:React.ReactNode}) {
  return <section aria-label={title} className="my-4 min-w-0 overflow-clip rounded-lg border border-[var(--border)] bg-[var(--bg-panel)]">
    <div className="flex items-start justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5">
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-[var(--text)]">{title}</h4>
        <p className="mt-0.5 max-w-[65ch] text-xs leading-snug text-[var(--text-secondary)]">{description}</p>
      </div>
      <button type="button" onClick={reset} className={buttonStyle}>Reset</button>
    </div>
    <div className="@container">{children}</div>
  </section>;
}
function Split({controls,readout,comparison,note}:{
  controls:React.ReactNode;readout:React.ReactNode;comparison:React.ReactNode;note:string;
}) {
  return <>
    <div className="grid min-w-0 grid-cols-1 gap-px bg-[var(--border)] @[600px]:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="order-2 min-w-0 bg-[var(--bg-app)] p-3 @[600px]:order-1">{controls}</div>
      <div className="order-1 min-w-0 bg-[var(--bg-panel)] p-3 @[600px]:order-2">{readout}</div>
    </div>
    <div className="border-t border-[var(--border)] bg-[var(--bg-app)] px-3 py-2.5">{comparison}</div>
    <p className="border-t border-[var(--border)] px-3 py-2 text-[11px] leading-snug text-[var(--text-muted)]">{note}</p>
  </>;
}
function Warning({kind}:{kind:'scale'|'gauge'}) {
  return <div role="status" className="rounded-md border border-[var(--status-danger-border)] bg-[var(--bg-app)] p-3 text-xs text-[var(--status-danger-text)]">
    Enter a positive sample mass and valid instrument increment. Fractions and progress must be above 0% and at most 100%.
    {kind==='gauge'?' Headspace volume must be positive and temperatures must exceed absolute zero.':''}
  </div>;
}
export function ScaleReadabilityExplorer() {
  const [state,setState]=useState(scaleDefaults);
  const update=(key:keyof typeof state)=>(value:string)=>setState(s=>({...s,[key]:value}));
  const common={sampleG:num(state.mass),acidPercent:num(state.acid),observedPercent:num(state.progress)};
  const increment=num(state.step);
  const readout=scaleReadability({...common,scaleStepG:increment});
  return <Frame title="Can your scale resolve this reaction?"
    description="Adjust the sliders to see when the expected CO₂ mass loss becomes visible on the selected scale."
    reset={()=>setState(scaleDefaults)}>
    <Split controls={
      <div className="grid min-w-0 grid-cols-1 gap-3">
        <CompactMobileStatus readout={readout}/>
        <SliderField label="Scale increment" value={state.step} onChange={update('step')} unit="g"
          min={0.0001} max={0.1} sliderMin={0.0001} sliderMax={0.1} steps={[0.0001,0.001,0.01,0.1]}/>
        <SliderField label="Sample mass" value={state.mass} onChange={update('mass')} unit="g"
          min={0.000001} max={1e6} sliderMin={optionsMass.min} sliderMax={optionsMass.max} scale="log"/>
        <SliderField label="Starting THCa" value={state.acid} onChange={update('acid')} unit="%"
          min={0.000001} max={100} sliderMin={0.1} sliderMax={100} scale="log"/>
        <SliderField label="Progress to observe" value={state.progress} onChange={update('progress')} unit="%"
          min={0.000001} max={100} sliderMin={1} sliderMax={100} precision={1}/>
      </div>
    } readout={readout ? <>
      <LiveSummary readout={readout} kind="scale"/>
      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <div className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Required starting mass at the selected settings</div>
        <Thresholds assessment={readout} apply={update('mass')}/>
      </div>
    </> : <Warning kind="scale"/>}
    comparison={readout ? <Compare title="At other scale increments · same sample and observation point"
      steps={[0.0001,0.001,0.01,0.1]} current={increment} unit="g"
      calc={step=>scaleReadability({...common,scaleStepG:step})}/> : <span className="text-xs text-[var(--text-secondary)]">Enter valid measurements to compare instruments.</span>}
    note="2× and 5× are display-screening conventions, not detection limits. The model assumes CO₂-only loss and excludes noise, thermal drift, and other volatiles."/>
  </Frame>;
}
export function GaugeReadabilityExplorer() {
  const [state,setState]=useState(gaugeDefaults);
  const update=(key:keyof typeof state)=>(value:string)=>setState(s=>({...s,[key]:value}));
  const common={sampleG:num(state.mass),acidPercent:num(state.acid),observedPercent:num(state.progress),
    headspaceFloz:num(state.volume),initialTempC:num(state.startTemp),currentTempC:num(state.endTemp)};
  const increment=num(state.step);
  const readout=gaugeReadability({...common,gaugeStepPsi:increment});
  return <Frame title="Can your gauge resolve this reaction?"
    description="Explore the CO₂-only pressure increase above the temperature-adjusted initial gas pressure in a sealed vessel."
    reset={()=>setState(gaugeDefaults)}>
    <Split controls={<div className="@container grid min-w-0 grid-cols-1 gap-3">
      <CompactMobileStatus readout={readout}/>
      <SliderField label="Gauge increment" value={state.step} onChange={update('step')} unit="PSI"
        min={0.001} max={1} sliderMin={0.001} sliderMax={1} steps={[0.001,0.01,0.1,1]}/>
      <SliderField label="Sample mass" value={state.mass} onChange={update('mass')} unit="g"
        min={0.000001} max={1e6} sliderMin={optionsMass.min} sliderMax={optionsMass.max} scale="log"/>
      <SliderField label="Starting THCa" value={state.acid} onChange={update('acid')} unit="%"
        min={0.000001} max={100} sliderMin={0.1} sliderMax={100} scale="log"/>
      <SliderField label="Progress to observe" value={state.progress} onChange={update('progress')} unit="%"
        min={0.000001} max={100} sliderMin={1} sliderMax={100} precision={1}/>
      <SliderField label="Free gas volume" value={state.volume} onChange={update('volume')} unit="fl oz"
        min={0.000001} max={1e6} sliderMin={0.5} sliderMax={128} scale="log" hint="US fluid oz · unoccupied gas space"/>
      <div className="grid min-w-0 grid-cols-1 gap-3 @[390px]:grid-cols-2">
        <SliderField label="Initial gas temp." value={state.startTemp} onChange={update('startTemp')} unit="°C"
          min={-273.14} max={1000} sliderMin={-20} sliderMax={200} precision={0}/>
        <SliderField label="Observed gas temp." value={state.endTemp} onChange={update('endTemp')} unit="°C"
          min={-273.14} max={1000} sliderMin={-20} sliderMax={250} precision={0}/>
      </div>
    </div>} readout={readout ? <>
      <LiveSummary readout={readout} kind="gauge"/>
      <div className="mt-3 border-t border-[var(--border)] pt-3">
        <div className="mb-2 text-xs font-medium text-[var(--text-secondary)]">Required starting mass at the selected settings</div>
        <Thresholds assessment={readout} apply={update('mass')}/>
      </div>
    </> : <Warning kind="gauge"/>}
    comparison={readout ? <Compare title="At other gauge increments · same sample and vessel"
      steps={[0.001,0.01,0.1,1]} current={increment} unit="PSI"
      calc={step=>gaugeReadability({...common,gaugeStepPsi:step})}/> : <span className="text-xs text-[var(--text-secondary)]">Enter valid measurements to compare instruments.</span>}
    note="The two-reading bound includes temperature normalization. This ideal-gas model assumes CO₂-only generation, fixed headspace and no leakage; it does not establish gauge accuracy or vessel safety."/>
  </Frame>;
}
