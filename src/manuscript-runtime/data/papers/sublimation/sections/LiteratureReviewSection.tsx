import { SubsectionLabel } from '../../../../components/sections/Abstract';
import { InlineCite } from '../../../../components/prose/InlineCite';
import { MathBlock, InlineMath } from '../ScientificMath';

export function LiteratureReviewSection() {
  return (
    <section id="literature" aria-labelledby="lit-heading" className="prose-heading mb-10">
      <div className="research-chapter-label mb-4">
        <span className="research-heading-number">2</span>
        <h2 id="lit-heading" className="text-base font-semibold text-[var(--text)] tracking-tight">Physical evidence and its limits</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-[var(--text)] leading-relaxed">
          Lower pressure may favor vapor escape while simultaneously weakening heat delivery through gas.
          Published experiments establish the opposing mechanisms, but their magnitude depends on product
          geometry and the thermal boundary. Vial measurements, bulk-tray studies, controller descriptions,
          and gauge physics provide the evidence for interpreting a consumer dryer's readings.
          None independently establishes the drying performance of this seven-shelf chamber.
        </p>

        <div id="literature-pikal" className="prose-heading">
          <SubsectionLabel number="2.1" title="Why lower pressure also reduces gas conduction" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Pikal, Roy & Shah (1984) established the fundamental three-component vial heat-transfer model from
            experimental measurements of sublimation rates at systematically varied chamber pressures <InlineCite refs={['pikal1984']} />.
            The total vial heat-transfer coefficient <InlineMath math="K_v" /> combines three contributions.
          </p>

          <MathBlock
            math="K_v(P) = K_c + K_r + K_g(P)"
            label="(2.1)"
            caption="Vial heat transfer decomposition (W/m²K)"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            where <InlineMath math="K_c" /> is direct contact conduction (pressure-independent, ~1.2 W/m²K for vials),
            <InlineMath math="K_r" /> is radiation (~2.0 W/m²K), and <InlineMath math="K_g(P)" /> is gas-gap conduction
            described by the Smoluchowski interpolation <InlineCite refs={['smoluchowski1898']} />.
          </p>

          <MathBlock
            math="K_g(P) = C_2 \cdot \frac{P}{P + C_3}"
            label="(2.2)"
            caption="Smoluchowski gas conduction formula"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The coefficients depend on geometry and gas species. <InlineMath math="C_2 = k_{bulk} / \ell_{eff}" /> is
            the continuum plateau (W/m²K), and <InlineMath math="C_3 = C_2 / \beta_{fm}" /> is the half-saturation pressure
            (mTorr). For water vapor in vial geometry, Pikal's empirical fit yielded <InlineMath math="C_2 = 11.3" /> W/m²K
            and <InlineMath math="C_3 = 90" /> mTorr.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Within the stated gas-gap model, gas conduction becomes smaller as chamber
            pressure falls and approaches a finite plateau as pressure increases. This
            refutes the idea that deeper vacuum always enhances heat delivery. It does
            not mean higher pressure must improve drying, because greater water-vapor
            backpressure can reduce the potential for sublimation.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed">
            Pikal (1985) extended the framework to process design, emphasizing that pressure-dependent heat-transfer
            coefficients are a design variable and that the optimal drying pressure depends on product temperature constraints
            <InlineCite refs={['pikal1985']} />.
          </p>
        </div>

        <div id="literature-nail" className="prose-heading">
          <SubsectionLabel number="2.2" title="What higher-pressure drying experiments show" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Nail (1980) conducted a direct chamber-pressure sweep experiment at constant shelf temperature, measuring
            primary drying rate as a function of chamber pressure <InlineCite refs={['nail1980']} />. The results show
            a substantial increase in drying rate with rising pressure.
          </p>

          <div className="overflow-x-auto mb-4">
            <table className="text-xs text-[var(--text)] w-full border border-[var(--border)]">
              <thead className="bg-[var(--figure-bg)] border-b border-[var(--border)]">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]">Chamber Pressure (mm Hg)</th>
                  <th className="text-left px-3 py-2 font-semibold border-r border-[var(--border)]">Relative Rate</th>
                  <th className="text-left px-3 py-2 font-semibold">Summary</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[var(--border)]">
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">0.04</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">1.0× (baseline)</td>
                  <td className="text-left px-3 py-2">baseline</td>
                </tr>
                <tr>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">1.3</td>
                  <td className="text-left px-3 py-2 border-r border-[var(--border)]">~2.6× (160% increase)</td>
                  <td className="text-left px-3 py-2">Strong pressure leverage</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="text-sm text-[var(--text)] leading-relaxed">
            This ~160% throughput gain at constant shelf temperature directly contradicts a simplistic "deeper vacuum
            always accelerates drying" intuition and supports the pressure-dependent Kg mechanism. The effect was
            interpreted as evidence that gas-phase conduction and convection are significant contributors to total heat
            transfer and are strongly pressure-dependent in the 0.04–1.3 mm Hg range.
          </p>
        </div>

        <div id="literature-ganguly" className="prose-heading">
          <SubsectionLabel number="2.3" title="Why experimental geometry matters" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Ganguly, Nail & Alexeenko conducted experimental and computational studies of freeze-drying heat transfer,
            publishing results in 2010 (AIAA conference), 2013 (peer-reviewed journal), and 2014 (PhD dissertation)
            <InlineCite refs={['ganguly2010', 'ganguly2013', 'ganguly2014']} />. Using gravimetric sublimation measurements
            and controlled vial-shelf separations, they explicitly quantified regime boundaries and the composition-dependent
            heat transfer mechanisms. The relevant pressure ranges reflect the tested vial geometry.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            In the tested vial arrangement, heat transfer increased approximately linearly
            with pressure below 50 mTorr. The effective gap became increasingly important
            between roughly 50 and 120 mTorr, followed by a more nearly continuum-like,
            separation-dependent response at higher pressure. These experimental ranges
            are not universal thresholds for the Harvest Right chamber or its shelf-to-product
            gaps <InlineCite refs={['ganguly2013']} />.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            They reported a four-way experimental decomposition of total heat into radiation, contact conduction, gas
            conduction, and a convective/flow contribution across 10–200 mTorr. At 10 mTorr, gas conduction is minimal;
            by 100–200 mTorr the pressure-responsive gas and flow terms are material fractions of the measured heat budget
            <InlineCite refs={['ganguly2013']} />. This is the experimental basis for extending Pikal's three-term bookkeeping
            to <InlineMath math="K_{eff}=K_c+K_r+K_g+K_f" /> in the target-machine model. The symbol
            {' '}<InlineMath math="K_f" /> is deliberately broader than "natural convection": Ganguly's laboratory decomposition
            establishes a non-conductive flow contribution in that geometry, while the dominant flow driver must be
            re-identified for the Harvest Right geometry rather than assumed.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            A former table presented five heat-transfer percentage decompositions as directly
            digitized laboratory data. Their point-by-point values could not be verified
            from the primary publication and do not agree with the archived reconstruction.
            They are omitted rather than treated as measurements. The illustrative heat-budget
            chart in Section 4 is explicitly identified as a reconstruction.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Two dissertation results are particularly relevant to an open-tray, multi-shelf consumer machine. First,
            Ganguly's open-ice top-heating experiment produced normalized three-hour mass-loss responses of approximately
            1.36, 1.17, 1.09, and 1.00 as the heated-surface separation increased through 45, 65, 85, and 105 mm. This is
            direct evidence that a hotter surface above exposed ice can materially change sublimation, although changing
            separation simultaneously changes radiation, local gas transport, and pressure and therefore must not be
            interpreted as a pure view-factor experiment <InlineCite refs={['ganguly2014']} />.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Second, Ganguly's coupled chamber calculations and measurements resolve local pressure gradients rather than
            treating chamber pressure as perfectly uniform. Near a sublimation flux of 1 kg m⁻² h⁻¹, the center-to-edge
            pressure variation was about 8 mTorr at a 21 mm gap and about 4.2 mTorr at 26 mm, dropping below approximately
            1 mTorr at much larger separation. These data support a spatial pressure/conductance network for a seven-shelf
            stack and motivate measuring local geometry instead of assigning one chamber pressure to every sublimation
            interface <InlineCite refs={['ganguly2014']} />.
          </p>


        </div>

        <div id="literature-patents" className="prose-heading">
          <SubsectionLabel number="2.4" title="What heater-control evidence establishes" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Harvest Right disclosed their freeze-drying method and control logic in two patents
            <InlineCite refs={['hrpatent2016', 'hrpatent2022']} />. The patents describe a two-threshold pressure-cycling approach:
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Under the disclosed threshold scheme, the heater is enabled below <InlineMath math="P_1" /> and
            disabled above <InlineMath math="P_2" />. Pressure cycling also informs the completion decision.
            The patents describe time-dependent accommodations for small or low-moisture loads, where the
            pressure signal may be weak enough to resemble a completed batch.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Archived firmware interpretation suggests temperature regulation within a pressure-enabled
            state <InlineCite refs={['cummings2024']} />, whereas Harvest Right patents explicitly describe
            pressure-activated heater cycling <InlineCite refs={['hrpatent2016', 'hrpatent2022']} />.
            These descriptions must not be collapsed into a definitive statement about all shipped
            firmware. Heater-state logs, temperature error and native pressure readings from a known
            firmware build are required to identify what limits useful heating in that unit.
          </p>


        </div>

        <div id="literature-instrumentation" className="prose-heading">
          <SubsectionLabel number="2.5" title="What a thermocouple gauge measures" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The identified Agilent Type 531 tube is a thermocouple vacuum gauge, not a Pirani
            gauge <InlineCite refs={['agilent531']} />. Both infer pressure from heat lost by a
            heated sensing element to the surrounding gas. In the Type 531, a thermocouple
            measures the filament temperature through its voltage response. Hansen's
            <a href="https://www.belljar.net/tcgauge.htm" target="_blank" rel="noopener noreferrer"
              className="text-[var(--accent)] underline underline-offset-2 hover:text-[var(--accent-hover)]"
            >Building a Thermocouple Vacuum Gauge</a> describes this sensing mechanism and
            discusses the tube directly <InlineCite refs={['hansen1992tcgauge']} />.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            At fixed filament excitation, lower gas pressure generally reduces molecular cooling,
            altering the filament temperature and thermocouple voltage. The indicated pressure
            follows a gas-specific calibration rather than a direct mechanical measurement.
            Gas composition, filament drive, sensing geometry and parasitic heat losses all
            influence the response. Although the same rarefied-gas physics contributes to
            product heat transfer, the instrument's response cannot be equated to a tray's
            gas-conduction coefficient or corrected using a universal conductivity ratio.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            If heater switching uses the indicated gauge pressure
            {' '}<InlineMath math="P_{\mathrm{app}}" />, a fixed threshold need not correspond to
            a fixed absolute chamber pressure <InlineMath math="P_{\mathrm{total}}" /> when
            the water-vapor fraction changes. Neither value independently determines
            the water-vapor partial pressure <InlineMath math="p_{\mathrm{H_2O}}" />.
            A capacitance manometer provides a composition-independent absolute-pressure
            reference. Simultaneous readings are therefore needed to characterize the
            installed thermocouple gauge throughout drying, alongside independent
            evidence of the remaining product ice.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed">
            Patel, Doen and Pikal found that a nitrogen-calibrated Pirani gauge read
            approximately 60% higher than a capacitance manometer while chamber gas was
            predominantly water vapor. The readings converged as primary drying approached
            completion <InlineCite refs={['patelDoenPikal2010']} />. This demonstrates why
            paired measurements can help identify changes in chamber gas composition;
            the reported percentage belongs to their Pirani experiment and cannot be
            transferred to the Type 531 without instrument-specific calibration.
          </p>
        </div>

        <div id="literature-tray-material" className="prose-heading">
          <SubsectionLabel number="2.6" title="Why tray contact changes heat delivery" />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            Bulk freeze-drying introduces an additional thermal-resistance network between the temperature-controlled shelf
            and the frozen product. Patel and Pikal note that open stainless-steel trays are traditional in bulk
            lyophilization, but that aluminum trays are generally preferred when product compatibility permits because of
            aluminum&apos;s substantially higher thermal conductivity; where direct aluminum contact is undesirable, they
            specifically describe a stainless-inside/aluminum-outside laminated pan as the logical construction
            <InlineCite refs={['patelPikal2011']} />.
          </p>

          <MathBlock
            math="R_{tray} = \frac{t}{kA}"
            label="(2.3)"
            caption="Bulk conduction resistance of a tray layer; equal geometry makes resistance inversely proportional to thermal conductivity"
          />

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            This is potentially a large hardware lever. Representative room-temperature conductivities place 300-series
            stainless steel near 15–17 W/m·K, while common aluminum sheet alloys are typically on the order of 150–205
            W/m·K. For equal thickness and area, replacing stainless with aluminum can therefore reduce the tray material&apos;s
            own conduction resistance by roughly an order of magnitude. This does <strong>not</strong> imply an order-of-magnitude
            reduction in drying time because shelf/tray contact resistance, tray/product contact, radiation, gas conduction,
            and product-side mass-transfer resistance remain in series.
          </p>

          <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
            The process significance of tray resistance has been demonstrated experimentally. Trappler, Sunderland and
            Gentilcore compared vials processed on a 0.060-inch 304 stainless-steel bottomed tray against the same geometry
            with the tray bottom removed so the vials contacted the shelf directly. Under matched shelf-temperature and
            chamber-pressure conditions, removing the tray-bottom barrier increased mean sublimation rate by 30.7% for
            dextran, 22.5% for mannitol and 28.1% for water; all three differences were significant at p &lt; 0.001
            <InlineCite refs={['trappler2004']} />. The experiment does not establish that an aluminum Harvest Right tray will
            produce the same percentage gain, but it establishes that tray/interface thermal resistance can be large enough
            to change primary-drying throughput by tens of percent.
          </p>


        </div>


      </div>
    </section>
  );
}
