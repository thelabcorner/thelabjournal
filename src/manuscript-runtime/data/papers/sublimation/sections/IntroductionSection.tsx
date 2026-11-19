import { SubsectionLabel } from '../../../../components/sections/Abstract';
import { ChapterLabel } from '../../../../components/sections/ChapterLabel';
import { InlineCite } from '../../../../components/prose/InlineCite';
import { InlineMath, MathBlock } from '../ScientificMath';
import { GasConductionAnalogyFigure } from '../figures/GasConductionAnalogyFigure';

const prose = 'text-sm leading-relaxed text-[var(--text)]';

export function IntroductionSection() {
  return <section id="introduction" aria-labelledby="intro-heading" className="prose-heading mb-10">
<ChapterLabel number="1" id="intro-heading" title="Introduction" />
    <div className="space-y-4">
       <p className={prose}>
          During primary drying, heat reaches frozen product while water vapor leaves the
          ice interface and deposits on a colder surface. The attainable rate depends on
          both processes. A chamber-pressure trace records part of the vapor balance;
          shelf temperature describes the heater-side boundary. Neither measurement
          alone determines how much water is leaving the remaining ice. These distinctions
          underlie several practical misconceptions concerning vacuum, condenser
          temperature, heater regulation and primary-drying completion
          <InlineCite refs={['biopharma2019misconceptions']} />.
       </p>
       <p className={prose}>
         Vacuum insulation provides a familiar example of pressure-dependent
         gas heat transfer. Evacuating the gap between two walls reduces
         molecular energy transport and helps preserve their temperature
         difference, although radiation and solid connections continue to
         carry heat. In a freeze dryer, residual gas can carry energy from
         warmer surroundings to ice across gaps in the thermal path.
         Pump-down can therefore weaken useful heat delivery as the
         water-vapor pressure potential for sublimation increases
         <InlineCite refs={['pikal1984', 'ganguly2013']} />.
         A thermocouple vacuum gauge employs the same molecular heat transfer
         in its measurement: surrounding gas cools a heated sensing element,
         and its temperature response is converted to an indicated pressure.
         The composition of that gas affects both the instrument response
         and heat exchange with the product
         <InlineCite refs={['agilent531']} />.
       </p>
       <GasConductionAnalogyFigure />
       <div id="introduction-motivation" className="prose-heading">
         <SubsectionLabel number="1.1" title="The integrated chamber and its measured signals" />
         <p className={prose}>
           A central geometric distinction is whether ice collects in a separate
           condenser vessel or on a refrigerated wall in the product chamber.
           Introductory condenser schematics often depict the former
           <InlineCite refs={['biopharma2019misconceptions']} />. This paper
           examines the latter: a shared chamber in which sublimation, internal
           deposition, pump exhaust, and product heating determine the same gas
           inventory. Harvest Right, Stay Fresh, and Blue Alpine document versions
           of this architecture with different controls and capacities
           <InlineCite refs={['harvestRightHowWorks', 'stayFreshManual', 'blueAlpine2024support']} />.
         </p>
         <p className={prose}>
           The same equipment can exhibit different operating behavior as a batch dries.
           Water-vapor generation declines as the remaining wet area contracts and
           the vapor path through the dried product becomes more resistant. Continued
           pumping then changes total pressure and the gas composition that governs
           heat exchange. In a seven-shelf Harvest Right Pharmaceutical configuration,
           this process also depends on the position and heat supply of the last wet
           shelf. That geometry serves as a worked case; thermal coefficients and
           controller behavior remain specific to the equipment measured.
         </p>
       </div>
      <div id="introduction-pressure-notation" className="prose-heading">
        <SubsectionLabel number="1.2" title="Pressure and measurement notation" />
        <p className={prose}>
          Total chamber pressure, the partial pressure of water vapor, and a thermal-gauge indication are
          different physical quantities. Treating them as interchangeable would distort the transport model.
        </p>
        <div className="lyo-notation-table overflow-x-auto">
          <table className="research-data-table w-full">
            <thead><tr><th scope="col">Quantity</th><th scope="col">Meaning</th><th scope="col">Measurement</th></tr></thead>
            <tbody>
              <tr><td><InlineMath math={String.raw`P_{\mathrm{total}}`}/></td><td>Total absolute chamber pressure</td><td>Composition-independent reference, e.g. capacitance manometer</td></tr>
              <tr><td><InlineMath math={String.raw`p_{\mathrm{H_2O}}`}/></td><td>Water-vapor partial pressure</td><td>Requires composition information or a justified approximation</td></tr>
              <tr><td><InlineMath math={String.raw`p_{\mathrm{NCG}}`}/></td><td>Partial pressure of non-condensable gases</td><td>Part of total pressure, not water-vapor pressure</td></tr>
              <tr><td><InlineMath math={String.raw`P_{\mathrm{sub}}(T_i)`}/></td><td>Equilibrium vapor pressure above ice at interface temperature</td><td>Thermodynamic relation <InlineCite refs={['wagner2011']}/></td></tr>
              <tr><td><InlineMath math={String.raw`P_{\mathrm{app}}`}/></td><td>Thermal-conductivity gauge's indicated pressure</td><td>Gas-species-dependent apparent reading</td></tr>
              <tr><td><InlineMath math={String.raw`P_1,\ P_2`}/></td><td>Controller switching thresholds</td><td>Referenced to the installed gauge and firmware</td></tr>
            </tbody>
          </table>
        </div>
        <p className={prose}>
          For a simplified binary mixture, the water mole fraction <InlineMath math={String.raw`f_{\mathrm{H_2O}}`}/> gives
          {' '}<InlineMath math={String.raw`p_{\mathrm{H_2O}}=f_{\mathrm{H_2O}}P_{\mathrm{total}}`}/>.
          This relation does not determine that fraction from a single total-pressure measurement. A thermal-conductivity
          gauge calibrated on one gas must not silently stand in for a composition-independent pressure reference.
        </p>
      </div>
      <div id="introduction-thermodynamic" className="prose-heading">
         <SubsectionLabel number="1.3" title="Vapor-pressure potential and sublimative cooling" />
        <p className={prose}>
           The expression commonly called a sublimation driving force is a thermodynamic
           potential for vapor transfer, not a mechanical force exerted on the ice. At a
           specified interface temperature, its sign depends on the water-vapor partial
           pressure relative to ice equilibrium. The corresponding chemical-potential
           difference, including a small condensed-phase pressure correction, is
        </p>
        <MathBlock
          math={String.raw`\Delta\mu=RT\ln\left(\frac{p_{\mathrm{H_2O}}}{P_{\mathrm{sub}}(T_i)}\right)-v_{\mathrm{ice}}\left[P_{\mathrm{total}}-P_{\mathrm{sub}}(T_i)\right]`}
          label="(1.1)"
          caption="Interfacial chemical-potential difference, including the condensed-phase pressure correction."
        />
        <p className={prose}>
          Here <InlineMath math={String.raw`v_{\mathrm{ice}}`}/> is the molar volume of ice. The condensed-phase pressure correction is referenced to ice-vapor coexistence at <InlineMath math={String.raw`P_{\mathrm{sub}}(T_i)`}/> and assumes the ice phase is mechanically exposed to total chamber pressure. The usual
          low-pressure approximation for net sublimation is
          {' '}<InlineMath math={String.raw`p_{\mathrm{H_2O}}<P_{\mathrm{sub}}(T_i)`}/>.
           Non-condensable gas can still affect vapor transport through diffusion and flow resistance even where
           its direct correction to phase equilibrium is negligible.
         </p>
         <p className={prose}>
           The vapor-pressure driving potential
           {' '}<InlineMath math={String.raw`\Delta p_w=P_{\mathrm{sub}}(T_i)-p_{\mathrm{H_2O}}`}/>{' '}
           expresses the available pressure difference for vapor transfer from ice.
           A positive value permits net sublimation in the idealized local pressure
           balance, but does not compel any particular water-removal rate. It is
           thermodynamic headroom, not accumulated water, energy, or throughput.
           Actual flux also requires a heat supply to replace sublimation enthalpy
           and a finite-conductance path through the product and chamber.
           A large potential can therefore coexist with negligible drying.
           Sublimation can initially consume stored sensible heat even without additional heater input;
           the resulting sublimative cooling lowers the ice temperature and its equilibrium vapor pressure.
           Sustained drying requires replacement of that latent energy, although product temperature
           need not continue falling when the heat balance is maintained.
         </p>

      </div>

    </div>
  </section>;
}
