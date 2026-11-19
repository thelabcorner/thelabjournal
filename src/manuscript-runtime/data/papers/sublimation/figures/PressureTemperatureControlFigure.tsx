import { useState } from 'react';
import { ScientificFigureCaption } from '../../../../components/typography/ScientificFigureCaption';

/** Build-specific static firmware reconstruction; no controller was run or instrumented. */
const harvestSteps = [
  { label: 'Chamber pressure', detail: 'Measured vacuum is the feedback variable.' },
  { label: 'Pressure-driven duty selection', detail: 'A recovered routine selects 25%, 50% or 75%, with separate state and hysteresis conditions.' },
  { label: 'Timer and heater actuation', detail: 'A percentage timer drives the heater pathway.' },
] as const;
const alpineSteps = [
  { label: 'Shelf-temperature signal', detail: 'Sensor reading enters a temperature-control path.' },
  { label: 'Temperature PID output', detail: 'PID computes a temperature command, not heater duty.' },
  { label: 'Pressure-band permission', detail: 'Two threshold values and a deadband govern heater enable state.' },
] as const;

function ControlLane({
  system, build, mode, steps, selected,
}: {
  system: string; build: string; mode: 'pressure' | 'temperature'; selected: boolean;
  steps: ReadonlyArray<{label: string; detail: string}>;
}) {
  return (
    <section className={'lyo-control-lane lyo-control-lane--' + mode} data-active={selected} aria-label={system + ' heater control'}>
      <div className="lyo-control-lane-title">
        <strong>{system}</strong>
        <span>{build}</span>
      </div>
      <div className="lyo-control-steps">
        {steps.map((step, index) => (
          <div className="lyo-control-step-wrap" key={step.label}>
            {index > 0 && <div className="lyo-control-link" aria-hidden="true">↓</div>}
            <div className="lyo-control-step">
              <strong>{step.label}</strong>
              <p>{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function PressureTemperatureControlFigure() {
  const [selected,setSelected] = useState<'hr'|'ba'>('hr');
  return (
    <figure className="lyo-controller-figure research-scientific-figure">
      <ScientificFigureCaption
        title="Different controller architectures regulate the same drying physics"
        detail="Static firmware evidence for two named builds, reconstructed from disassembly and control-state reports."
      />
      <div className="lyo-mobile-controller-tabs" role="group" aria-label="Select a recovered firmware heater-control path">
        <button type="button" aria-pressed={selected==='hr'} onClick={()=>setSelected('hr')}>Harvest Right</button>
        <button type="button" aria-pressed={selected==='ba'} onClick={()=>setSelected('ba')}>Blue Alpine</button>
      </div>
      <div className="lyo-control-lanes">
        <ControlLane system="Harvest Right" build="v5.5.25" mode="pressure" steps={harvestSteps} selected={selected==='hr'}/>
        <ControlLane system="Blue Alpine" build="v3.3.4" mode="temperature" steps={alpineSteps} selected={selected==='ba'}/>
      </div>
      <div className="lyo-control-shared">
        <span aria-hidden="true">↓</span>
        <strong>Heating elements → shelves → remaining frozen product</strong>
        <p>Neither inspected heater-control path directly measures residual ice mass or sublimation rate. The pressure, shelf and product heat-and-vapor balances still determine actual drying performance.</p>
      </div>
      <p className="lyo-evidence-note">
        The Harvest Right three-level routine occurs at 0x2F422. The Blue Alpine firmware
        identifies a temperature-PID pathway and a pressure gate with hysteresis.
        These findings describe the specified static images, not all firmware generations.
      </p>
    </figure>
  );
}
