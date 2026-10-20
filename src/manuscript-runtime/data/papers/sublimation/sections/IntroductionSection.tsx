import { SubsectionLabel } from '../../../../components/sections/Abstract';
import { InlineCite } from '../../../../components/prose/InlineCite';
import { InlineMath, MathBlock } from '../ScientificMath';

const prose = 'text-sm leading-relaxed text-[var(--text)]';

export function IntroductionSection() {
  return <section id="introduction" aria-labelledby="intro-heading" className="prose-heading mb-10">
    <div className="research-chapter-label mb-4">
      <span className="research-heading-number">1</span>
      <h2 id="intro-heading" className="text-base font-semibold text-[var(--text)] tracking-tight">Introduction</h2>
    </div>
    <div className="space-y-4">
      <p className={prose}>
         Chamber pressure is often treated as a direct indication of drying performance, although pressure
         alone reveals neither the rate of sublimation nor the amount of ice remaining in the product.
         During primary drying, heat must reach that ice while the resulting water vapor moves toward the
         refrigerated inner wall of the chamber, where it deposits. Lower pressure can favor vapor transport
         and simultaneously weaken gas-mediated heat delivery. A low shelf-temperature setting can also
         restrict heater input even as water remains to be removed from the frozen product. These limitations
         explain why freeze-dryer operation cannot be interpreted from any single pressure or temperature
         reading. <InlineCite refs={['pikal1984', 'ganguly2013']} />
      </p>
      <div id="introduction-motivation" className="prose-heading">
         <SubsectionLabel number="1.1" title="Interpreting the operating conditions" />
        <p className={prose}>
           A falling pressure reading may reflect rapid capture of water vapor on the cold wall, reduced vapor
           generation at the product, continued evacuation of non-condensable gases, or more than one of these
           processes. A stable reading is equally ambiguous. Heater duty provides additional information,
           but does not independently establish how much heat reaches the ice because thermal contact,
           radiation, gas conduction, and product resistance all affect the energy balance.
        </p>
        <p className={prose}>
          The examined Harvest Right unit has seven product shelves in one cylindrical vacuum chamber.
           Copper evaporator tubing cools the chamber wall from outside, and water vapor from the product accumulates
           as ice on its inner circumference. The vacuum pump evacuates gas through a separate connection;
           there is no separate condenser vessel. This geometry links heater control, chamber
          pressure, gas composition, and tray-to-product heat path. Published vial experiments establish
          parts of the underlying physics; the machine-specific questions are evaluated through explicit
          calculations and proposed measurements. Their implications are developed in the order that heat
          enters the product, ice sublimates, and vapor deposits on the cold chamber wall.
           <InlineCite refs={['harvestRightHowWorks']} />
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
          Water-vapor partial pressure, rather than total chamber pressure alone, enters the interfacial
          sublimation driving force. At ordinary freeze-drying pressures the pressure correction to condensed-phase
          chemical potential is small; the idealized relation may be written:
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
           The conventional expression “sublimation driving force” names a pressure difference, not a
           mechanical force or a measurement of ongoing drying. The vapor-pressure driving potential
           {' '}<InlineMath math={String.raw`\Delta p_w=P_{\mathrm{sub}}(T_i)-p_{\mathrm{H_2O}}`}/>{' '}
           indicates whether the local pressure state favors vapor leaving the ice. It cannot, by itself,
           determine the sublimation rate. That rate also depends on the heat supplied to the interface,
           the resistance through the product, and the ability of the chamber wall to capture the vapor.
           Sublimation can initially consume stored sensible heat even without additional heater input.
           The resulting sublimative cooling lowers the ice temperature and its equilibrium vapor pressure,
           reducing the available potential. During sustained primary drying, heat must replenish the latent
           energy absorbed by sublimation; sublimative cooling does not necessarily imply a continuously
           falling product temperature when that energy balance is maintained.
         </p>

      </div>

    </div>
  </section>;
}
