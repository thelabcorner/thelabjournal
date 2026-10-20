import { InlineMath } from './ScientificMath';

/** One coupled physical pathway. No numbered narrative or checklist. */
const stages = [
  { title: 'Heat input', tone: 'thermal', body: 'The shelf and heater establish a thermal boundary.', math: String.raw`q''_{\mathrm{in}}` },
  { title: 'Thermal transfer', tone: 'measure', body: 'Contact, radiation, gas and flow carry heat into the product.', math: String.raw`K_c+K_r+K_g+K_f` },
  { title: 'Ice sublimation', tone: 'measure', body: 'The interface converts available energy into vapor.', math: String.raw`q''\simeq \Delta H_{\mathrm{sub}}j` },
  { title: 'Cold-wall capture', tone: 'gas', body: 'Vapor deposits as ice on the refrigerated inner wall.', math: String.raw`p_{\mathrm{H_2O}}-P_{\mathrm{sub}}(T_w)` },
  { title: 'Feedback', tone: 'thermal', body: 'Temperature and pressure signals constrain heat input.', math: String.raw`T_i,\;P,\;\dot m` },
] as const;

export function LyophilizationPathFigure() {
  return (
    <figure className="lyo-process-figure research-scientific-figure">
      <figcaption>
        <span>Figure 1. Coupled primary-drying pathway</span>
        <span>Heat transfer and vapor removal are parts of the same physical process.</span>
      </figcaption>
      <div className="lyo-process-grid">
        {stages.map(stage => (
          <div key={stage.title} className={'lyo-process-node lyo-process-node--' + stage.tone}>
            <strong>{stage.title}</strong>
            <div className="lyo-process-math"><InlineMath math={stage.math} /></div>
            <p>{stage.body}</p>
          </div>
        ))}
      </div>
    </figure>
  );
}
