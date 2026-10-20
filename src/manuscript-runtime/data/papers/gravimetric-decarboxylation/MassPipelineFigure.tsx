import { InlineMath } from '../../../components/prose/MathBlock';

/** Selectable, semantic process diagram for the mass-led argument. */
const stages = [
  { key: '01', title: 'Tare and load', math: String.raw`m_{s,0}=m_0-T`, detail: 'Subtract vessel tare from the initial gross reading.', tone: 'measure' },
  { key: '02', title: 'Set a reference', math: String.raw`m_{CO_2,\max}\;\text{or}\;q_{\mathrm{cal}}`, detail: 'Calculate theoretical capacity or calibrate an aliquot.', tone: 'gas' },
  { key: '03', title: 'Measure loss', math: String.raw`\Delta m(t)=m_0-m(t)`, detail: 'Track the gross-mass difference during processing.', tone: 'measure' },
  { key: '04', title: 'Estimate progress', math: String.raw`X_{\mathrm{app}}\;\text{or}\;X_{\mathrm{ref}}`, detail: 'Normalize loss using the selected reference.', tone: 'gas' },
  { key: '05', title: 'Use the result', math: String.raw`\Delta m_{\mathrm{target}}`, detail: 'Report progress or calculate a mass-loss stop target.', tone: 'measure' },
] as const;

export function MassPipelineFigure() {
  return <figure className="research-scientific-figure research-mass-pipeline">
    <figcaption>
      <span>Figure 1. Gravimetric measurement pathway</span>
      <span>From the initial tare to a reference-relative progress estimate.</span>
    </figcaption>
    <ol className="research-mass-pipeline-steps">
      {stages.map(stage => <li key={stage.key} className={'research-mass-pipeline-stage research-mass-pipeline-stage--' + stage.tone}>
        <span className="research-mass-pipeline-index" aria-hidden="true">{stage.key}</span>
        <strong>{stage.title}</strong>
        <div className="research-mass-pipeline-equation"><InlineMath math={stage.math} /></div>
        <p>{stage.detail}</p>
      </li>)}
    </ol>
  </figure>;
}