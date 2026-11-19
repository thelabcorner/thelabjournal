import { SubsectionLabel } from '../../../../components/sections/Abstract';
import { ChapterLabel } from '../../../../components/sections/ChapterLabel';
import { InlineCite } from '../../../../components/prose/InlineCite';
import { MathBlock, InlineMath } from '../ScientificMath';
import { GangulyExperimentalEvidenceFigure } from '../figures/GangulyExperimentalEvidenceFigure';

export function LiteratureReviewSection() {
  return (
    <section id="literature" aria-labelledby="lit-heading" className="prose-heading mb-10">
      <ChapterLabel number="2" id="lit-heading" title="Physical evidence and its limits" />

      <div className="space-y-4">
        <p className="text-sm text-[var(--text)] leading-relaxed">
          Sublimation requires energy at the ice interface and a route for vapor to reach
          the refrigerated collection surface. Chamber pressure affects each route differently.
          Experiments with vials establish pressure-dependent gas conduction and the competing
          resistance to vapor transport. Studies of bulk trays identify additional heat-transfer
          losses at material interfaces. Equipment documents and vacuum-gauge measurements then
          determine which parts of that physics can be recognized in an integrated cold-wall
          chamber. The evidence is considered in that order, with its original geometry and
          operating conditions retained.
         </p>

        <div id="literature-pikal" className="prose-heading">
          <SubsectionLabel number="2.1" title="Pressure-dependent molecular gas conduction" />

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
            The gas contribution declines with pressure in this model and approaches
            a finite plateau at higher pressures. Sublimation responds to the accompanying
            heat delivery as well as to the water-vapor pressure at the ice interface.
            The model therefore provides the heat-transfer component of a pressure
            comparison; the mass-transfer component must be evaluated alongside it.
          </p>
          <p className="text-sm text-[var(--text)] leading-relaxed">
            Pikal (1985) extended the framework to process design, emphasizing that pressure-dependent heat-transfer
            coefficients are a design variable and that the optimal drying pressure depends on product temperature constraints
            <InlineCite refs={['pikal1985']} />.
          </p>
        </div>

        <div id="literature-nail" className="prose-heading">
          <SubsectionLabel number="2.2" title="Measured drying response to chamber pressure" />

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
            Across Nail's tested pressures, the higher-pressure condition yielded
            approximately 2.6 times the drying rate at the same shelf temperature.
            The measured throughput response is consistent with greater gas-mediated
            heat delivery in that apparatus. Its magnitude belongs to the tested
            formulation and geometry; the next question is how the relevant
            heat-transfer gap and vapor route change in an open-tray chamber.
          </p>
        </div>

        <div id="literature-ganguly" className="prose-heading">
          <SubsectionLabel number="2.3" title="Transfer geometry and the origin of spatial differences" />

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
              The pie-chart percentages are each pathway's share of the total,
              not the absolute heat flux supplied by that pathway. At fixed
              surface temperatures and geometry, the radiative contribution is
              independent of chamber pressure. Its declining percentage reflects
              the growing denominator as gas-mediated heat transfer increases.
              In the 2014 direct-contact pies, radiation falls from 69% at
              10 mTorr to 45% at 100 mTorr, while gas conduction and the
              flow-associated contribution rise from 13% to 44%. The accompanying
              figure separates this normalization effect from the absolute
              2010 heat-flux regressions, which report an approximately
              2,666 W/m² radiative reference over the pressure comparison.
          </p>
           <GangulyExperimentalEvidenceFigure />
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
           <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
             The dissertation's Figures 6.7–6.9 extend these transport balances
             into calculated equipment limits and time-dependent sublimation
             surfaces. Their calibration includes Baxter Medical Products
             measurements on a 5% mannitol/5% sucrose formulation, 15 mL
             per 30 mL vial, at a load of 112 vials. Sublimation was measured
             by tunable diode laser absorption spectroscopy at 100 mTorr,
             with the shelf ramped from −40 to −22 °C; product resistance
             was estimated using 16 monitored vials. The displayed surfaces
             are outputs of the coupled model, not an experimental grid.
             The 150 L production calibration coefficients from a separate
             dissertation case are not transferable to these curves
             <InlineCite refs={['ganguly2014']} />.
           </p>


        </div>

         <div id="literature-patents" className="prose-heading">
           <SubsectionLabel number="2.4" title="Integrated cold-wall equipment and control practices" />

           <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
             Harvest Right's patent US 9,459,044 describes a cylindrical refrigerated chamber
             with heated shelves, an external vacuum pump and pressure-activated heater cycling.
             Water leaving the product is collected as ice on the inside wall of the same chamber
             <InlineCite refs={['hrpatent2016', 'harvestRightHowWorks']} />. This physical
             arrangement is relevant beyond that manufacturer's controller. Stay Fresh documents
             internal wall-ice formation and continuous pump operation during primary drying,
             with an algorithm that alternates pressure-regulated and temperature-regulated
             intervals <InlineCite refs={['stayFreshManual']} />. Blue Alpine's technical
             guidance likewise describes water-vapor capture on the chamber walls and its
             sensitivity to accumulated frost <InlineCite refs={['blueAlpine2024support']} />.
           </p>
           <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
              This geometric distinction limits direct use of introductory
              guidance. Biopharma Group's schematic depicts a separate condenser chamber,
              whereas these designs collect frost on the wall of the product chamber
              <InlineCite refs={['biopharma2019misconceptions']} />. Its cautions
              about excessive vacuum and insufficient heat remain relevant,
              but condenser-to-product pressure differences, flow conductance,
              and available deposition area must be evaluated for the actual geometry.
            </p>
            <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
              The shared cold-wall architecture provides common mass and energy
              conservation boundaries. Heater logic, pump conductance, tray construction,
              frost deposition and load capacity remain equipment-dependent.
              The efficiency concern developed here concerns how those elements are
              controlled as vapor production declines; quantifying its prevalence
              across commercial dryers requires comparative throughput measurements.
           </p>
           <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
             Harvest Right's disclosed two-threshold scheme enables heating below
             {' '}<InlineMath math="P_1" /> and interrupts heating above
             {' '}<InlineMath math="P_2" />. Pressure response also enters its reported
             completion logic <InlineCite refs={['hrpatent2016', 'hrpatent2022']} />.
             Archived firmware interpretation suggests temperature regulation within a
             pressure-enabled state <InlineCite refs={['cummings2024']} />. A patent,
             an operating manual and a reverse-engineered firmware interpretation describe
              different levels of evidence. Their provisions cannot be assigned to every
              shipped controller revision. Static firmware analysis now supplies
              a version-specific comparison. In Harvest Right v5.5.25 a
              pressure-dependent three-level duty selection is evident in
              the heater-control path; a temperature PID was not identified
              there. In Blue Alpine v3.3.4 the recovered path combines
              temperature PID and a two-threshold pressure gate. The
              findings describe those binaries, not a common market-wide
              control law <InlineCite refs={['firmwareAnalysis2026']} />.
           </p>
           <p className="text-sm text-[var(--text)] leading-relaxed mb-3">
             Pharmaceutical process-design literature explicitly treats pressure and shelf
             temperature as joint controls that balance sublimation driving potential,
             gas-mediated heat transfer and product-temperature limits
             <InlineCite refs={['tchessalov2023']} />. Consequently a higher gas-conduction
             coefficient alone is not a standard for correct operation. The relevant comparison
             is realized water-removal throughput under matched product and equipment limits.
             Fixed or scheduled pressure thresholds cannot establish that throughput from
             chamber pressure alone.
           </p>
         </div>

        <div id="literature-instrumentation" className="prose-heading">
          <SubsectionLabel number="2.5" title="Composition-sensitive pressure indication" />

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
             The gauge loses less heat as its gas environment becomes rarer, just as
             a gas gap transfers less heat to a frozen product at lower pressure.
             Surface conditions and geometry determine the magnitude in each case.
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
          <SubsectionLabel number="2.6" title="The tray and its thermal contacts" />

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
            Representative room-temperature conductivities place 300-series
            stainless steel near 15–17 W/m·K and common aluminum sheet
            alloys near 150–205 W/m·K. For equal area and thickness, the
            aluminum layer has roughly one-tenth the bulk thermal resistance.
            Shelf/tray and tray/product contacts, radiation, gas conduction and
            product-side vapor resistance determine how much that material
            substitution changes the full drying process.
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
