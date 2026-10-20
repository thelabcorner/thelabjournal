import { SubsectionLabel } from '../../../../components/sections/Abstract';
import { Callout } from '../../../../components/prose/Callout';
import { InlineCite } from '../../../../components/prose/InlineCite';
import { InlineMath, MathBlock } from '../ScientificMath';

export function MethodologySection() {
  return (
    <section id="methodology" aria-labelledby="method-heading" className="prose-heading mb-10">
      <div className="research-chapter-label mb-4">
        <span className="research-heading-number">3</span>
        <h2 id="method-heading" className="text-base font-semibold text-[var(--text)] tracking-tight">Physical relations for field interpretation</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-[var(--text)] leading-relaxed">
          The pressure gauge does not directly measure water removal, and the shelf sensor does not
          measure the temperature of every ice interface. Interpretation therefore begins with the
          conservation of heat and water rather than a single displayed reading. The relations below
          identify which physical quantities a measurement depends upon; their coefficients must be
          established in the actual tray geometry before the model can predict a drying cycle.
        </p>

        <div id="methodology-coupled-model" className="prose-heading">
          <SubsectionLabel number="3.1" title="How heat reaches the ice and water reaches the wall" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Pikal's original vial model contains three additive heat-transfer pathways. Ganguly's measurements resolve a
            fourth pressure-responsive flow contribution. The combined heat-transfer coefficient takes the form in Equation (3.1).
          </p>

          <MathBlock
            math="K_{eff} = K_c + K_r + K_g(P_{total},f_{H_2O}) + K_f(P_{total},f_{H_2O},\dot m,\mathcal G)"
            label="(3.1)"
            caption="Contact, radiation, molecular gas conduction and flow-coupled heat transfer"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            where <InlineMath math="K_c" /> is solid/contact conduction, <InlineMath math="K_r" /> is radiation,
            <InlineMath math="K_g" /> is molecular gas-gap conduction, and <InlineMath math="K_f" /> is a separate
            flow-coupled contribution. <InlineMath math="\mathcal G" /> denotes chamber geometry. In the target machine,
            <InlineMath math="K_f" /> must not be identified automatically with classical buoyant natural convection;
            pressure- and concentration-driven H₂O transport can also move energy. Here the fourth coefficient is an equivalent, geometry-dependent contribution under a specified temperature difference. Advected gas enthalpy is not automatically positive or independently additive to molecular conduction; separating it without double-counting requires measured flux and boundary temperatures. The molecular gas-conduction term follows the Smoluchowski relation in Eq. 2.2.
          </p>



          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The refrigerated inner chamber wall is the ice-deposition surface. Water vapor leaves
             the frozen product but remains inside the apparatus as wall ice. The pump evacuates
             noncondensable gases and can exhaust some water vapor. Chamber composition therefore depends on
             sublimation and these distinct gas-phase sinks.
            For a uniform ideal-gas chamber of fixed free volume, gas and deposited wall-ice inventories obey:
          </p>

          <MathBlock
            math={String.raw`\begin{aligned}\frac{d}{dt}\left(\frac{p_{H_2O}V_g}{RT_g}\right)&=\sum_i\frac{A_i j_i}{M_{H_2O}}-\dot n_{\mathrm{wall}}-\dot n_{\mathrm{pump},H_2O},\\\frac{dn_{\mathrm{ice,wall}}}{dt}&=\dot n_{\mathrm{wall}}\end{aligned}`}
            label="(3.2)"
            caption="Gas-phase water inventory and ice collected on the refrigerated inner chamber wall."
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Here <InlineMath math="A_i" /> is wet shelf area, and <InlineMath math="i" /> indexes shelves;
             <InlineMath math="j_i" /> is
            mass flux in kg per square metre per second, and <InlineMath math="M_{H_2O}" /> is the
            molar mass in kg per mole. The wall term counts net vapor deposited as ice on the refrigerated inner circumference;
             the pump term counts water-vapor molecules exhausted externally by the vacuum
            pump in moles per second. At fixed gas temperature and free volume, net wall uptake lowers
             water-vapor partial pressure whenever it exceeds ongoing vapor production, without removing
             water from the apparatus. Measured total pressure alone cannot separate the terms or supply
            the water mole fraction. Pressure, deposition, and sublimation therefore have to be
            solved together when making equipment predictions.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Multiplying a heat-transfer coefficient by a vapor-pressure potential produces a
            useful comparison between assumed pressure conditions, but not a mass-removal rate.
          </p>

          <MathBlock
            math="F_{screen}(P_{total}, f_{H_2O}, T) = K_{eff}(P_{total}, f_{H_2O}) \left[P_{sub}(T) - f_{H_2O} P_{total}\right]"
            label="(3.3)"
            caption="Heat-transfer-weighted driving-force screening metric; not a physical mass-flux equation"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Actual sublimation depends on how much heat reaches the ice and how readily the
            resulting vapor escapes through the product. Those balances must hold at a shared
            interfacial temperature. Expressed on a consistent area basis, the relations are
          </p>

          <MathBlock
             math="K_{eff}(T_s-T_i)=\Delta H_{sub}\Gamma j,\qquad j=\frac{P_{sub}(T_i)-p_{H_2O}}{R_p}"
            label="(3.4)"
             caption="Coupled energy and mass balances on a consistent area basis; R_p is product-side vapor resistance."
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
             The coefficient <InlineMath math="K_{eff}" /> refers to heat-transfer area <InlineMath math="A_v" />,
             whereas <InlineMath math="j" /> refers to sublimating area <InlineMath math="A_p" />.
             Their ratio <InlineMath math={String.raw`\Gamma=A_p/A_v`} /> is dimensionless; it equals
             unity when both are expressed on the same area basis. The product resistance
             {' '}<InlineMath math="R_p" /> has units Pa m² s/kg. Linearizing <InlineMath math="P_{sub}(T_i)" />{' '}
             around the shelf-side thermal boundary gives a series-resistance
            form rather than a product of independent factors:
          </p>

          <MathBlock
            math="j\simeq\frac{P_{sub}(T_s)-p_{H_2O}}{R_p+\left(\frac{\Delta H_{sub}\Gamma}{K_{eff}}\right)\frac{dP_{sub}}{dT}}"
            label="(3.5)"
            caption="Linearized coupled flux; heat-transfer resistance and dried-layer resistance add in series. Gamma = A_p/A_v when the heat and product reference areas differ."
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            This expression explains why increasing pressure can help only while the associated increase in heat delivery
            outweighs the loss in water-vapor driving force. It also makes the evolving dried layer a first-class state:
            the pressure optimum can move as <InlineMath math="R_p" /> changes during primary drying.
          </p>

          <MathBlock
            math="R_{thermal,total} = R_{shelf/tray} + R_{tray} + R_{tray/product} + R_{product} + \cdots, \qquad R_{tray}=\frac{t}{kA}"
            label="(3.6)"
            caption="Series thermal-resistance network for the solid heat path. Tray conductivity changes one term, while contact mechanics and product resistance remain."
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            This resistance-network form prevents a common interpretation error. A roughly order-of-magnitude reduction
            in <InlineMath math="R_{tray}" /> does not imply an order-of-magnitude reduction in cycle time; the system-level
            effect depends on the fraction of <InlineMath math="R_{thermal,total}" /> attributable to the tray and its interfaces.
            The tray material also changes lateral heat spreading, so multi-point temperature variance is treated as an
            experimental outcome alongside mean sublimation flux <InlineCite refs={['patelPikal2011', 'trappler2004']} />.
          </p>

          <Callout
            type="info"
            title="Interpretation of the flow-associated heat-transfer term"
            body="Ganguly experimentally separated a pressure-responsive flow component from molecular gas conduction in laboratory vial geometry. That observation justifies a fourth term K_f, but it does not justify blindly extrapolating K_f proportional to sqrt(P) to the Harvest Right stack. For a representative 35 mm inter-shelf gap, the target-machine regime calculation gives Ra far below 1708 through roughly 50-1200 mTorr, while sublimation-driven vertical Peclet number is order unity for one shelf and order ten above seven cumulative shelves. Pressure/concentration-driven upward vapor transport is therefore the leading working mechanism, with classical buoyancy left as a secondary hypothesis to test."
          />
        </div>

        <div id="methodology-optimal-pressure" className="prose-heading">
          <SubsectionLabel number="3.2" title="Why a calculated pressure optimum is conditional" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
             Under an explicitly fixed water-vapor fraction and fixed interfacial temperature,
             the simplified screening model has a closed-form stationary point. Let
            {' '}<InlineMath math="A=K_c+K_r" />, <InlineMath math="K(P)=A+C_2P/(P+C_3)" />, and
            {' '}<InlineMath math="f=f_{H_2O}" />. Maximizing
            {' '}<InlineMath math="F_{screen}=K(P)[P_{sub}-fP]" /> gives <InlineCite refs={['cummings2026']} />:
          </p>

          <MathBlock
            math="P^*_{screen}=\sqrt{\frac{C_2C_3\left(C_3+P_{sub}/f\right)}{A+C_2}}-C_3"
            label="(3.7)"
            caption="Interior stationary point of the fixed-composition Smoluchowski screening function."
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
             This is an interior stationary point only when it lies inside the admissible pressure
             interval and the driving force is positive. Otherwise the constrained maximum occurs at
             an interval boundary. Since changing pressure can change the vapor fraction and interface
             temperature, the result is a conditional sensitivity calculation rather than an
             operating setpoint.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Interface temperature determines <InlineMath math="P_{sub}(T)" />. The transition
            pressure <InlineMath math="C_3" /> depends on gas properties, while the plateau
            coefficient <InlineMath math="C_2" /> reflects geometry. Vapor composition enters
            the pressure term directly through <InlineMath math="P_{sub}/f_{H_2O}" />.
            The stationary point therefore changes with the physical state and the chosen heat-transfer model.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            A closed form also exists for the normalized linearized series-resistance model. With
            {' '}<InlineMath math="K_\infty=K_c+K_r+C_2" />, <InlineMath math="c=C_2C_3" />,
            <InlineMath math="r=\eta/K_{ref}" />, <InlineMath math="A_p=P_{sub}+fC_3" />, and
            {' '}<InlineMath math="d=1+rK_\infty" />. The stationary point is then given by Equation (3.8).
          </p>

          <MathBlock
            math="P^*_{series}=\frac{rc+\sqrt{\frac{c}{fK_\infty}\left(A_pd-frc\right)}}{d}-C_3"
            label="(3.8)"
            caption="Closed-form optimum for the linearized series-resistance model; reduces exactly to Eq. 3.7 when r = 0"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The exact nonlinear model solves Eq. 3.4 directly and is the preferred quantitative model. It shows that
            {' '}<InlineMath math="P^*" /> is not globally monotone in <InlineMath math="R_p" /> and that the answer is highly
            sensitive to the assumed high-pressure form of <InlineMath math="K_f" />. Consequently, no single pressure
            optimum is promoted here as a machine setpoint before tray-scale heat-transfer data are measured.
          </p>

          <Callout
            type="warning"
            title="Scope of formula"
            body="Equations 3.7 and 3.8 are derived results inside stated model families, not hardware prescriptions. Actionable setpoints require tray-geometry measurement of Kc, Kr, C₂, C₃, the flow term Kf, product resistance Rp, true H₂O partial pressure, wall/condenser state, and the product-temperature ceiling."
          />
        </div>

        <div id="methodology-radiative-gap" className="prose-heading">
          <SubsectionLabel number="3.3" title="What contact and radiative gaps change" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            A deliberate heater-to-tray gap is treated as an alternative thermal boundary condition, not as a source of
            free energy. Direct contact and net radiation obey
          </p>

          <MathBlock
            math="q''_{contact}=h_c(T_h-T_t),\qquad q''_{rad}=\epsilon_{eff}F_{12}\sigma\left(T_h^4-T_t^4\right)"
            label="(3.9)"
            caption="Contact conduction versus net diffuse-gray radiation across a gap"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Thermal decoupling across a gap permits <InlineMath math="T_h\gg T_t" /> while transmitting a finite,
            controllable flux by radiation and gas transfer. The reason additional absorbed heat need not immediately become
            sensible product temperature during wet primary drying is the latent sink. Combining the local energy balance
            with <InlineMath math="j=[P_{sub}(T_p)-p_w]/R_p" /> gives
          </p>

          <MathBlock
            math="\frac{dT_p}{dq''_{in}}=\left[\frac{\Delta H_{sub}}{R_p}\frac{dP_{sub}}{dT}+\frac{dq''_{loss}}{dT}\right]^{-1}"
            label="(3.10)"
            caption="Latent-clamp sensitivity. The clamp weakens as dried-layer resistance grows and vanishes when local ice is depleted."
          />

          <Callout
            type="info"
            title="What the gap can and cannot do"
            body="At equal source and receiver temperatures, a good solid contact generally transfers more heat than radiation. A gap becomes interesting because the heater can be operated at a substantially higher temperature than the product while the radiative/gas impedance meters the flux. Any performance gain therefore comes from better use and control of the fixed electrical power budget, not from radiation creating additional energy."
          />
        </div>

        <div id="methodology-vapor-removal" className="prose-heading">
          <SubsectionLabel number="3.4" title="What limits vapor capture in a shared chamber" />
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The product-side resistance in Equation (3.5) applies when chamber water-vapor pressure is known.
            Predicting that pressure requires a relation between vapor generation and cold-wall deposition. The
            limiting model treats the gas in one chamber as well mixed, combining wall capture with pump
            water-vapor exhaust near an operating point into a conductance <InlineMath math="C_w" /> in mol
            per second per pascal. Let <InlineMath math="p_b" /> be the locally equivalent sink
            reference pressure, not another vessel's pressure. When deposition is active and pump
             water-vapor throughput is locally pressure-proportional, the equivalent coefficients are
             {' '}<InlineMath math={String.raw`C_w=C_{\mathrm{wall}}+C_{\mathrm{pump}}`} /> and
             {' '}<InlineMath math={String.raw`p_b=C_{\mathrm{wall}}P_{\mathrm{sub}}(T_w)/C_w`} />.
             The wall-deposition term is driven by
             chamber water-vapor partial pressure above the ice equilibrium pressure at the frost surface.
             Pump water-vapor exhaust is a distinct path. Each wet shelf has exposed area <InlineMath math="A_i" />, linearized
            product-and-heat resistance <InlineMath math="R_i" />, and heat-boundary saturation pressure
            {' '}<InlineMath math={String.raw`P_{sub}(T_{s,i})`} />. Its mass flux is <InlineMath math="j_i" />.
          </p>
          <MathBlock
            math={String.raw`\begin{aligned}
            \sum_i\frac{A_i j_i}{M_{H_2O}}&=C_w(p_{H_2O}-p_b),\\
            j_i&=\frac{[P_{sub}(T_{s,i})-p_{H_2O}]_+}{R_i},\\
            R_i&=R_{p,i}+\frac{\Delta H_{sub}\Gamma_i}{K_{eff,i}}\frac{dP_{sub}}{dT}
            \end{aligned}`}
            label="(3.11)"
            caption="Steady vapor inventory shared by all wet shelves, with a locally linearized removal path."
          />
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The positive part excludes negative product sublimation. The effective sink includes internal
             wall deposition but does not track frost growth or possible resublimation. Vapor from
            any shelf raises the common partial pressure and reduces the driving force at the others.
            For one wet area this balance reduces to a third resistance in series with the product and
            heat-transfer terms:
          </p>
          <MathBlock
            math={String.raw`j=\frac{[P_{sub}(T_s)-p_b]_+}{R_p+R_h+R_{ch}},\qquad
            R_h=\frac{\Delta H_{sub}\Gamma}{K_{eff}}\frac{dP_{sub}}{dT},\qquad
            R_{ch}=\frac{A_p}{M_{H_2O}C_w}`}
            label="(3.12)"
            caption="Finite vapor-capture capacity constrains the effect of additional heating in the single-zone model."
          />
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The same removal resistance changes the latent thermal response. If added heat enters the
            wet product while the effective removal conductance remains fixed, the chamber-pressure
            rise weakens sublimation cooling. Replacing the fixed chamber pressure in Equation (3.10)
            with the single-zone balance gives:
          </p>
          <MathBlock
            math={String.raw`\left.\frac{dT_i}{dq''_{in}}\right|_{C_w}
              \simeq\left[\frac{\Delta H_{sub}}{R_p+R_{ch}}
              \frac{dP_{sub}}{dT_i}+\frac{dq''_{loss}}{dT_i}\right]^{-1}`}
            label="(3.13)"
            caption="Reduced latent cooling when cold-wall capture and pump exhaust limit vapor uptake."
          />
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            This result links tray conductivity and heater control to cold-wall deposition performance. Reducing
            thermal resistance cannot eliminate a large vapor-capture resistance. Neither the effective
            conductance nor the wall-ice temperature distribution has been measured for the target machine.
            Wall frost growth, changing gas composition, local shelf gradients, and flow limitations can
            invalidate the linear, well-mixed approximation. The accompanying numerical model uses it as
            a conservation-checked baseline, not a predicted operating pressure
            <InlineCite refs={['pikal1984', 'pikal1985']} />.
          </p>
        </div>

        <div id="methodology-assumptions" className="prose-heading">
          <SubsectionLabel number="3.5" title="What the simplified models cannot establish" />
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Vial-calibrated transfer coefficients provide an experimental point of departure, not measured
            properties of these trays. The Smoluchowski relation transfers as a physical model, while its
            geometric coefficients must be identified for the shelf-to-product gaps in this machine.
            Tray alloy, thickness, flatness, contact area, and surface finish also affect the actual
            thermal path. Conductivity data alone therefore constrain only the material resistance.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The heat and mass balances assume a quasi-steady sublimation interface over the pressure-cycle
            timescale. The controller comparison approximates shelf-to-product thermal response with
            a first-order lag. Gas mixtures are represented using literature-based conductivity mixing
            rules, and free-molecular accommodation factors are treated as species-dependent parameters.
            Neither transient overshoot nor surface-dependent accommodation is resolved by these simplifications.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            All absolute-pressure calculations refer to a composition-independent measurement. The
            installed thermocouple gauge provides a composition-sensitive indication, so its uncorrected
            output cannot serve as the absolute-pressure reference for comparisons between water-rich
            and non-condensable-gas-rich atmospheres. This distinction is retained in every numerical
            pressure comparison that follows.
          </p>
        </div>


      </div>
    </section>
  );
}
