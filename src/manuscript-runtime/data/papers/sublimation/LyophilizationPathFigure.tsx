import { InlineMath } from './ScientificMath';
import { HeadingTextWithPermalink } from '../../../components/typography/HeadingPermalink';
import './LyophilizationPathFigure.css';

/**
 * Conceptual primary-drying balance for an integrated cold-wall chamber.
 * The feedback is conditional, not a controller trace or measured instability.
 */
const feedback = [
  { title: 'Chamber pressure declines', detail: 'The gas inventory is depleted faster than sublimation replenishes it.' },
  { title: 'Gas conduction weakens', detail: 'The remaining gas carries less thermal energy across gaps.' },
  { title: 'Less heat reaches the ice', detail: 'Latent-heat delivery may become insufficient for the remaining wet regions.' },
  { title: 'Sublimation slows further', detail: 'The weaker vapor source permits continued pump-down.' },
] as const;

function Step({
  number, title, detail, children,
}: {
  number: string;
  title: string;
  detail: string;
  children: React.ReactNode;
}) {
  return (
    <div className="lyo-loop-row">
      <span className="lyo-loop-number" aria-hidden="true">{number}</span>
      <div className="lyo-loop-row-content">
        <strong>{title}</strong>
        <p>{detail}</p>
        <div className="lyo-loop-math">{children}</div>
      </div>
    </div>
  );
}

export function LyophilizationPathFigure() {
  return (
    <figure className="lyo-process-figure lyo-loop-figure research-scientific-figure">
      <figcaption className="lyo-loop-caption">
        <span>When pump-down begins to suppress sublimation</span>
        <span>Heat supply, vapor generation and gas removal in an integrated cold-wall freeze dryer.</span>
      </figcaption>

      <div className="lyo-loop-premise">
        <strong>Pressure can keep falling while frozen water remains.</strong>
        <p>The chamber pressure is not an independent measure of drying completion.</p>
      </div>

      <div className="lyo-loop-layout">
        <section className="lyo-loop-panel" aria-label="Coupled energy and water-vapor balances">
          <div className="lyo-loop-panel-head">
            <strong>Coupled process</strong>
            <span className="lyo-loop-chip">Primary drying</span>
          </div>
          <div className="lyo-loop-steps">
            <Step number="01" title="Heat reaches the ice" detail="Contact, radiation and pressure-dependent gas conduction supply thermal energy.">
              <InlineMath math={String.raw`\dot Q_{\mathrm{in}}=\dot Q_c+\dot Q_r+\dot Q_g(P,\mathbf y)`} />
              <span className="lyo-loop-chip">Gas conduction · Pressure-dependent</span>
            </Step>
            <Step number="02" title="Sublimation supplies vapor" detail="The remaining wet area, interface temperature and product resistance determine vapor production.">
              <InlineMath math={String.raw`\dot n_{\mathrm{sub}}=\sum_i A_i j_i/M_w`} />
            </Step>
            <Step number="03" title="Chamber pressure responds" detail="Vapor generation competes with deposition and pump exhaust.">
              <InlineMath math={String.raw`P=p_{\mathrm{H_2O}}+p_{\mathrm{NCG}}`} />
            </Step>
          </div>

          <div className="lyo-loop-sinks" role="group" aria-label="Two distinct pathways remove water vapor from the chamber gas">
            <div className="lyo-loop-sink">
              <strong>Cold-wall deposition</strong>
              <p>Vapor becomes ice inside the chamber.</p>
            </div>
            <div className="lyo-loop-sink">
              <strong>Vacuum-pump exhaust</strong>
              <p>Vapor and noncondensables leave the system.</p>
            </div>
          </div>
          <div className="lyo-loop-balance">
            <span>Water-vapor balance</span>
            <div className="lyo-loop-balance-equation">
              <InlineMath math={String.raw`\dot n_w=\dot n_{\mathrm{sub}}-\dot n_{\mathrm{wall}}-\dot n_{\mathrm{pump},w}`} />
            </div>
          </div>
        </section>

        <section className="lyo-loop-feedback" aria-labelledby="lyo-loop-feedback-title">
          <div className="lyo-loop-panel-head">
            <h3 id="lyo-loop-feedback-title" aria-label="The self-reinforcing limitation" className="research-anchor-heading">
              <HeadingTextWithPermalink title="The self-reinforcing limitation" targetId="lyo-loop-feedback-title" />
            </h3>
            <span className="lyo-loop-chip">If ice remains</span>
          </div>
          <p className="lyo-loop-feedback-intro">When the chamber removes water vapor faster than the product replaces it:</p>
          <div className="lyo-loop-threshold">
            <InlineMath math={String.raw`\dot n_{\mathrm{sub}}<\dot n_{\mathrm{wall}}+\dot n_{\mathrm{pump},w}`} />
          </div>
          <div className="lyo-loop-cycle" role="list" aria-label="Potentially self-reinforcing changes">
            {feedback.map((step, i) => (
              <div className="lyo-loop-cycle-row" role="listitem" key={step.title}>
                <span className="lyo-loop-cycle-dot" aria-hidden="true" />
                <div>
                  <strong>{step.title}</strong>
                  <p>{step.detail}</p>
                </div>
                <span className="lyo-loop-cycle-index" aria-hidden="true">0{i + 1}</span>
              </div>
            ))}
          </div>
          <div className="lyo-loop-return">
            <span aria-hidden="true">↺</span>
            <strong>Reduced vapor generation feeds the pressure decline.</strong>
          </div>
          <p className="lyo-loop-boundary">
            This feedback becomes limiting when the loss of gas-mediated heating outweighs competing transport effects.
          </p>
        </section>
      </div>
      <div className="lyo-loop-conclusion">
        <span className="lyo-loop-chip">Interpretation</span>
        <p><strong>Deeper vacuum does not inherently mean faster drying.</strong> The same declining-pressure trace can accompany completion or heat-limited residual ice.</p>
      </div>
    </figure>
  );
}
