import { SubsectionLabel } from '../../../../components/sections/Abstract';
import { Callout } from '../../../../components/prose/Callout';
import { InlineCite } from '../../../../components/prose/InlineCite';
import { InlineMath, MathBlock } from '../ScientificMath';
import { PressureTransferChart } from '../figures/PressureTransferChart';
import { PressureTransferTable } from '../figures/PressureTransferTable';
import { FluxContributorsChart } from '../figures/FluxContributorsChart';
import { WindowEstimatorWidget } from '../widgets/WindowEstimatorWidget';

interface ResultsSectionProps {
  isDark?: boolean;
}

export function ResultsSection({ isDark = false }: ResultsSectionProps) {
  return (
    <section id="results" aria-labelledby="results-heading" className="prose-heading mb-10">
      <div className="research-chapter-label mb-4">
        <span className="research-heading-number">4</span>
        <h2 id="results-heading" className="text-base font-semibold text-[var(--text)] tracking-tight">Field interpretation of drying behavior</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-[var(--text)] leading-relaxed">
          Low pressure does not prove rapid sublimation, a stable shelf temperature does not prove
          adequate heater power, and a rising thermal-gauge reading does not prove that absolute
          pressure rose by the same amount. The calculations below show why those shortcuts fail
          and what additional observations would resolve them. Their coefficients and
          controller comparisons are illustrative, not measured performance claims for this dryer.
        </p>

        <div id="results-thesis1" className="prose-heading">
          <SubsectionLabel number="4.1" title="Why a low shelf target can restrict useful heating" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            An archived firmware interpretation suggests temperature regulation within a
            pressure-enabled state <InlineCite refs={['cummings2024']} />. Harvest Right patents
            describe pressure-activated heater cycling <InlineCite refs={['hrpatent2016', 'hrpatent2022']} />.
            Because these are not proof of one common implementation, the calculation below
            isolates only how a proportional temperature-feedback path could limit heater duty.
            It does not verify the actual controller of the examined machine.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The temperature-feedback path can be represented by a conventional PID law.
          </p>

          <MathBlock
            math="u(t) = K_p \cdot e(t) + K_i \int e(t) dt + K_d \frac{de(t)}{dt}"
            label="(4.1)"
            caption="PID duty cycle output (clamped 0–100%)"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            For the assumed first-order temperature response
            {' '}<InlineMath math="e(t) = e_0 e^{-t/\tau}" />, the proportional part of the command follows
          </p>

          <MathBlock
            math="u(t) = K_p \cdot e_0 \cdot e^{-t/\tau}"
            label="(4.2)"
            caption="Proportional contribution only; integral, derivative, and supervisory terms are not represented"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The proportional component becomes smaller as shelf temperature approaches its target,
            even if ice remains. This does not establish that total heater output disappears:
            integral action, supervisory constraints, and pressure-based switching can alter the
            actual controller response. The calculation describes one feedback contribution,
            not a failure proven in the installed controller.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The field question is whether heater power remains restricted while product ice is
            present and product temperature stays below its permitted limit. A synchronized
            record of heater duty, shelf and product temperatures, and pressure is needed to
            distinguish temperature regulation from pressure-based cycling. A small shelf
            temperature error is not evidence that latent-heat demand has ended.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Earlier illustrative controller calculations gave nearly identical integrated
            heater energies over a 24-hour period. Integrated energy does not reveal when
            energy reached ice, how much was lost or which region dried last. Those totals
            therefore cannot support a claim that either controller finishes faster.
          </p>
        </div>

        <div id="results-thesis2" className="prose-heading">
          <SubsectionLabel number="4.2" title="Why deeper vacuum need not accelerate drying" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Pikal (1984) measured pressure-dependent molecular gas conduction. Ganguly (2013) resolved gas conduction
            separately from a flow-associated contribution in laboratory vial geometry. The Smoluchowski term is
            mathematically monotonic and concave; the Harvest Right fourth term above the measured range remains
            model-family uncertainty, not a universal convection law.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            In the illustrative saturating model, the assigned half-saturation pressure is 162 mTorr.
            Its gas-conduction term reaches approximately 24% of the assumed plateau at 50 mTorr,
            76% at 500 mTorr, and 90% at 1500 mTorr. These are evaluations of a fixed
             coefficient, not independently established transition pressures for the actual
             water-vapor and nitrogen mixture. The saturating plateau and its transition pressure
             both depend on effective gap width. For an ideal parallel-plate gas path with unchanged
             gas properties and accommodation, both fall approximately in inverse proportion to
             gap width. Changing only the transition pressure therefore does not constitute a
             consistent geometric scale-up. A vial-scale coefficient cannot be assigned to the
             much larger shelf spacing without identifying the actual heat-transfer gap.
             Higher gas conduction need not increase sublimation when vapor backpressure,
             product resistance and cold-wall capture change simultaneously
             <InlineCite refs={['pikal1984', 'ganguly2013']} />.
          </p>
          <FluxContributorsChart isDark={isDark} />


        </div>

        <div id="results-thesis3" className="prose-heading">
          <SubsectionLabel number="4.3" title="Why pressure depends on the gas mixture" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            In the free-molecular limit, energy transfer depends on the number of gas molecules striking a surface and their heat capacity. At fixed pressure and temperature the molecular-speed contribution scales as the inverse square root of molar mass. The accommodation coefficient and heat-capacity ratio also matter.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The corresponding free-molecular heat-transfer factor is
          </p>

          <MathBlock
            math={String.raw`\beta_{fm}=\alpha_{eff}\frac{\gamma+1}{\gamma-1}\sqrt{\frac{R}{8\pi M T_g}}`}
            label="(4.3)"
            caption="Free-molecular heat-transfer coefficient per unit pressure; effective accommodation depends on the gas and both surfaces."
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Here <InlineMath math={String.raw`\alpha_{eff}`} /> denotes effective gas-surface thermal accommodation, <InlineMath math="\gamma = C_p/C_v" /> the heat-capacity ratio, and <InlineMath math="M" /> molar mass (kg/mol) <InlineCite refs={['smoluchowski1898', 'kennard1938', 'yamaguchi2019', 'yamaguchi2020']} />. At a given pressure, gas density scales with molar mass and cancels one factor introduced by mass-specific heat capacity; the remaining molar-mass dependence is inverse square root.
            At equal temperature and equal effective accommodation, kinetic-theory coefficients
            relative to water vapor are approximately 0.718 for CO2, 0.681 for nitrogen, and 0.380
            for argon, using representative heat-capacity ratios. These are conditional species
            comparisons, not observed tray conductances. In a free-molecular mixture, each gas
            contributes according to its partial pressure. Continuum conductivity and the
            transition pressure additionally depend on mixture transport properties, accommodation
            and geometry. Transition pressures for individual gases and mixtures cannot be inferred
            from molecular mass alone. Water vapor can improve gas-mediated heat transfer while
            reducing the pressure difference available for net ice sublimation. Neither change
            independently predicts the realized drying rate.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The common 500 mTorr heuristic cannot establish the thermodynamic state
            of every frozen product. The table below assumes a water-vapor fraction of
            50% and compares the resulting partial pressure with equilibrium pressure
            above ice at several assumed interface temperatures, which need not equal
            the temperature measured at a shelf. The third column is the hypothetical
            total pressure at which that pressure potential becomes zero for the assumed
            fixed gas fraction, not a safe equipment setpoint. The ice-equilibrium values
            follow Wagner and colleagues <InlineCite refs={['wagner2011']} />.
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="text-xs text-[var(--text)] w-full border border-[var(--border)]">
              <thead className="bg-[var(--figure-bg)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]"><InlineMath math="T_i" /> (ice interface)</th>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]"><InlineMath math="P_{\mathrm{sub}}(T_i)" /> (mTorr)</th>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]">Total pressure at <InlineMath math={String.raw`\Delta p_w=0`} /> (50% H₂O)</th>
                  <th className="text-left px-3 py-2 font-semibold">Positive pressure potential at 500 mTorr?</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">−40°C (−40°F)</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">96.3</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">192.6</td>
                  <td className="text-left px-3 py-2 font-medium text-[var(--status-danger-text)]">No at the assumed 50% water-vapor fraction</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">−30°C (−22°F)</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">285.1</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">570.1</td>
                  <td className="text-left px-3 py-2 font-medium text-[var(--status-warning-text)]">Yes, with small modeled margin</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">−20°C (−4°F)</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">774.4</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">1,548.7</td>
                  <td className="text-left px-3 py-2">Yes at the assumed composition</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">−10°C (+14°F)</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">1,949.2</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">3,898.4</td>
                  <td className="text-left px-3 py-2">Yes at the assumed composition</td>
                </tr>
                <tr>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">−7°C (+19°F)</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">2,536.5</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">5,072.9</td>
                  <td className="text-left px-3 py-2">Yes at the assumed composition</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            At the assumed 500 mTorr total pressure and 50% water-vapor fraction, the water-vapor
            partial pressure is 250 mTorr. For ice at −20°C, the equilibrium vapor pressure is
            approximately 774 mTorr, leaving a positive vapor-pressure potential of about
            524 mTorr. At −40°C, the equilibrium pressure is about 96 mTorr, so the same
            assumed chamber gas instead favors net deposition at that interface. Even the
            positive-potential case does not tell us whether useful heat is reaching the ice
            or how much water is leaving the product. These calculations presume a known
            gas fraction and interface temperature, neither of which follows from the native
            gauge alone. They establish no universal setpoint or equipment safety criterion.
            <InlineCite refs={['wagner2011']} />
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The relevant distinction is between the water-vapor pressure at the ice
            and the local ability of gas and vapor to move through the product and chamber.
            Noncondensable gases can add diffusion resistance while contributing to
            the heat-transfer environment. Neither the presence of water vapor nor
            its favorable molecular properties establishes a preferred mixture:
            composition changes both the potential for sublimation and its thermal supply.
          </p>


        </div>

        <div id="results-coupled-model" className="prose-heading">
          <SubsectionLabel number="4.4" title="Why cold-wall capture constrains sublimation" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            More heater power can increase sublimation, but the newly generated vapor must
            still be captured by the chamber's refrigerated inner wall. If deposition cannot
            increase at the same rate, the water-vapor partial pressure rises and reduces
            the potential for additional sublimation. The simultaneous heat and mass balances
            describe why the wall and the product constrain the benefit of greater heating.
          </p>

          <MathBlock
            math="K_{eff}=K_c+K_r+K_g+K_f,\qquad K_{eff}(T_s-T_i)=\Delta H_{sub}\Gamma j,\qquad j=\frac{P_{sub}(T_i)-p_{H_2O}}{R_p}"
            label="(4.4)"
            caption="Four-way heat delivery coupled to the product-side mass-transfer resistance"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The September nonlinear research compared a saturating gas-transfer law
            with a continued-flow extension. Their calculated pressure optima
            diverged substantially as dried-layer resistance changed. In a broad
            simulation of uncalibrated parameters, the median theoretical optimum
            was near 520 mTorr for one family and 890 mTorr for the other.
            These are distributions over assumed model parameters, not measured
            uncertainty, and neither pressure is an operating recommendation.
            Their disagreement demonstrates that fitting a pressure optimum before
            identifying the actual tray-transfer law is not defensible
            <InlineCite refs={['cummings2026']} />.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The simplified shared-chamber balance in Equation (3.11) makes that limit explicit.
            At limited cold-wall deposition capacity and pump water-vapor throughput,
            greater vapor generation raises the shared chamber water-vapor pressure and reduces the
            benefit of increased heat delivery. The numerical seven-shelf baseline satisfies molar
            conservation for unequal shelf resistances and exposed areas. Its common pressure cannot
            produce a local vertical vapor-pressure gradient, so measured deviations from this baseline
            would help identify where a spatial transport model is necessary. No effective wall-deposition
            conductance has been fitted to the target dryer.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The examined hardware configuration has seven product shelves and eight approximately 163 W heating
            elements, and a nominal full heater-bank rating of <strong>1,304 W</strong>. Seven tray footprints total about
            0.610 m², so the gross electrical ceiling is about 2.14 kW/m² before losses. The eighth element is physically
            above the top shelf, creating a top-specific radiative boundary condition in addition to the ordinary shelf
            heating topology.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            A proposed heater-to-tray gap would weaken solid contact, leaving
            radiation and gas transfer to deliver heat across the separation.
            At equal heater temperature, good direct contact generally supplies
            more heat. A gap becomes interesting only if a higher heater-source
            temperature can compensate for lost contact without overheating the
            product or exceeding the available electrical power. Radiation
            depends strongly on the temperatures and view factor of the surfaces.
          </p>

          <MathBlock
            math="q''_{rad}=\epsilon_{eff}F\sigma(T_h^4-T_t^4),\qquad q''_{contact}=h_c(T_h-T_t)"
            label="(4.5)"
            caption="The relevant comparison is watts per tray, not mechanism percentages"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The physical reason additional heat can be absorbed without an immediate
            proportional increase in product temperature is sublimative cooling.
            While ice remains and vapor removal is possible, some additional energy
            is consumed as latent heat. The effect weakens as the dried layer
            impedes transport and disappears locally after the ice is depleted.
            A hotter separated heater is therefore not intrinsically safer than
            contact heating. Source temperature, absorbed power, dry-layer
            resistance, and the last wet region must all be characterized before
            evaluating such hardware <InlineCite refs={['pikal1985']} />.
          </p>
        </div>

        <div id="results-hardware" className="prose-heading">
          <SubsectionLabel number="4.5" title="Why tray contact matters more than material labels" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The target-machine trays are identified as stainless steel by the equipment owner. For a uniform tray layer, conductive resistance scales as
            {' '}<InlineMath math="R_{tray}=t/(kA)" />. Representative 300-series stainless conductivity is roughly 15–17 W/m·K,
            while common aluminum sheet alloys are roughly 150–205 W/m·K. Equal geometry therefore gives an approximately
            order-of-magnitude reduction in the tray material term when moving from stainless to aluminum.
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="text-xs text-[var(--text)] w-full border border-[var(--border)]">
              <thead className="bg-[var(--figure-bg)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]">Tray material</th>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]">Representative k</th>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]">Equal-geometry Rtray</th>
                  <th className="text-left px-3 py-2 font-semibold">Interpretation</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">300-series stainless</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">~15–17 W/m·K</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">1.0× baseline</td>
                  <td className="text-left px-3 py-2">Low-k structural/product-contact baseline</td>
                </tr>
                <tr>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">Common aluminum sheet</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">~150–205 W/m·K</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">~0.07–0.11× baseline</td>
                  <td className="text-left px-3 py-2">Much lower tray-layer resistance and stronger lateral heat spreading</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The system-level effect is bounded by the complete series network rather than the material ratio alone.
            Published bulk-freeze-drying guidance favors aluminum over stainless when compatible, and Trappler et al.
            measured 22.5–30.7% higher sublimation after removing a 0.060-inch 304 stainless tray-bottom barrier in their
            controlled vial experiments <InlineCite refs={['patelPikal2011', 'trappler2004']} />. Those percentages are not
            transferable directly to this machine, but they establish that the tray/contact pathway can be large enough to
            alter primary-drying throughput by tens of percent.
          </p>

          <MathBlock
            math="G_q=\frac{R_{old}}{R_{new}}=\frac{1}{(1-\phi)+\phi r},\qquad r=\frac{R_{tray,Al}}{R_{tray,SS}}\approx0.076"
            label="(4.6)"
            caption="Idealized heat-flux sensitivity when only the tray-layer resistance is reduced; φ is the tray layer's share of baseline total thermal resistance"
          />

          <div className="overflow-x-auto mb-4">
            <table className="text-xs text-[var(--text)] w-full border border-[var(--border)]">
              <thead className="bg-[var(--figure-bg)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]">Baseline R attributable to tray layer</th>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]">Idealized heat-flux multiplier</th>
                  <th className="text-left px-3 py-2 font-semibold">Increase</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">10%</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">1.10×</td>
                  <td className="text-left px-3 py-2">+10%</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">25%</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">1.30×</td>
                  <td className="text-left px-3 py-2">+30%</td>
                </tr>
                <tr className="border-b border-[var(--border)]">
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">50%</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">1.86×</td>
                  <td className="text-left px-3 py-2">+86%</td>
                </tr>
                <tr>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">75%</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">3.26×</td>
                  <td className="text-left px-3 py-2">+226%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            These values are resistance-network sensitivity bounds, <strong>not predicted drying-rate gains</strong>. Their
            purpose is to quantify why the tray-material discovery deserves first-order experimental priority: if the tray
            contributes only 10% of baseline resistance, the theoretical gain is only about 10%; if it contributes roughly
            half, reducing that one term by approximately 13× can nearly double heat delivery before other limits bind.
          </p>

          <Callout
            type="tip"
            title="Highest-value passive hardware test"
            body="Run matched stainless-versus-aluminum (and, if practical, stainless/aluminum laminate) loads before considering exotic graphite. Measure mean mass-loss rate, multi-point tray/product temperatures, and the actual shelf/tray contact state. The resistance sensitivity shows that the payoff ranges from modest to very large depending on how much of the baseline thermal bottleneck resides in the tray/contact stack, while higher in-plane conductivity may also reduce the slowest-region tail by spreading shelf/heater nonuniformity laterally."
          />
        </div>

        <div id="results-tables" className="prose-heading">
          <SubsectionLabel number="4.6" title="How to interpret model pressure comparisons" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-2">
            The following chart and table evaluate the fixed-parameter saturating heat-transfer model. They show <InlineMath math="K_c+K_r+K_g" />,
            the H₂O partial-pressure driving force, and the exact stationary point of the normalized series-resistance objective.
            The uncertain flow term <InlineMath math="K_f" /> is omitted rather than assigned an unsupported square-root pressure law.
          </p>

          <PressureTransferChart isDark={isDark} />

          <PressureTransferTable />

          <Callout
            type="info"
            title="Data scope"
            body="These interactives are model-family diagnostics, not full physical-flux predictions. K_sat uses fixed vial-derived transfer coefficients; the H2O fraction controls the driving-force term, and eta controls the normalized series-resistance penalty. The fourth flow term, tray-specific transfer, wall capture, and evolving composition remain outside this reduced UI and require measurement."
          />
        </div>

        <div id="results-estimator" className="prose-heading">
          <SubsectionLabel number="4.7" title="Exploring sensitivity without selecting a setpoint" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-2">
            The interactive widget below exposes the distinction between the legacy screening product and the current
            linearized series-resistance model. Adjust product temperature, vapor fraction, and η to see why the stationary
            pressure moves as product-side resistance becomes more important.
          </p>

          <WindowEstimatorWidget />

          <Callout
            type="info"
            title="Widget interpretation"
            body="The estimator intentionally uses only the saturating Kc + Kr + Kg family. It does not pretend that the unresolved Kf(P) law is known. Use it to inspect mathematical sensitivity, not to select a machine setpoint before tray-scale K_eff(P), product resistance, wall capture, and composition are measured."
          />
        </div>
      </div>
    </section>
  );
}
