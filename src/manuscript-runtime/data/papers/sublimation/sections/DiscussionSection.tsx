import { SubsectionLabel } from '../../../../components/sections/Abstract';
import { ChapterLabel } from '../../../../components/sections/ChapterLabel';
import { InlineCite } from '../../../../components/prose/InlineCite';

const prose = 'text-sm leading-relaxed text-[var(--text)]';

export function DiscussionSection() {
  return (
    <section id="discussion" aria-labelledby="discussion-heading" className="prose-heading mb-10">
      <ChapterLabel number="5" id="discussion-heading" title="Discussion" />
      <div className="space-y-4">
        <p className={prose}>
          The preceding calculations isolate pressure-dependent heating, vapor
          composition, product resistance and cold-wall capture. During a batch,
          these variables evolve together. Their interaction is most consequential
          after substantial ice has already been removed, when a small remaining
          wet region contributes progressively less vapor to the chamber.
        </p>

        <div id="discussion-synthesis" className="prose-heading">
          <SubsectionLabel number="5.1" title="Recursive pressure and heat-transfer losses" />
          <p className={prose}>
            At the start of primary drying, extensive wet area may supply enough
            water vapor to offset the combined gas-phase removal processes near
            the intended operating pressure. As ice retreats and dried-layer
            resistance increases, that source weakens. The pump continues to
            deplete noncondensable gas, while the refrigerated wall deposits
            sublimed water as frost. Total chamber pressure then approaches
            the pressure supported by the remaining sources and the available
            evacuation rate. Earlier in the cycle, a stable chamber-pressure reading
            can reflect strong sublimation balanced by rapid deposition; later,
            the same reading can arise from smaller balanced vapor fluxes.
          </p>
          <p className={prose}>
            Lower pressure reduces molecular gas-mediated heat transfer in the
            relevant rarefied regime. Where that pathway supplies appreciable
            latent heat to the final wet product, its loss lowers sublimation
            rate during the next interval. Gas removal then acts on an even
            smaller vapor source and pressure may fall further. This dependence
            is recursive: the pressure state alters heat delivery, which changes
            the vapor source that determines the next pressure state. The
            effect accumulates over successive intervals rather than arising
            from a single independently acting resistance.
          </p>
          <p className={prose}>
            Several changes can intensify this feedback simultaneously.
            Sublimative cooling lowers the equilibrium vapor pressure of ice
            when the latent-energy requirement is not replenished. Increasing
            dried-layer resistance impedes vapor release, while stainless
            tray resistance and imperfect contacts constrain alternative
            heat-delivery routes. Pressure-gated shelf-temperature control
            responds to measured shelf conditions rather than to the latent
            demand at each ice interface. Meanwhile, selective removal of
            noncondensable gas and replenishment by water vapor can increase
            the water-vapor fraction even as total pressure declines. That
            composition changes both the gas heat-transfer coefficient
            and the water-vapor partial-pressure potential for sublimation.
            The net effect follows from the coupled balances; reducing
            water-vapor backpressure can partly offset the loss of heat
            transfer at some operating states.
          </p>
          <p className={prose}>
            The feedback permits sharply nonlinear drying behavior and a
            premature decline in vapor generation with ice still present.
            Exponential growth of deviations would require a locally unstable
            dynamic response, which has not been identified experimentally
            for the target equipment. The practical ambiguity is immediate:
            pressure can approach the pump-limited state after complete
            sublimation or while a heat-starved region remains frozen.
            A controlled restoration of gas-mediated heating, paired with
            verified residual ice and measured water removal, can
            distinguish the latter condition
            <InlineCite refs={['pikal1984', 'pikal1985', 'ganguly2013']} />.
          </p>
        </div>

                <div id="discussion-spatial" className="prose-heading">
          <SubsectionLabel number="5.2" title="The final wet shelf and endpoint ambiguity" />
          <p className={prose}>
            The chamber's pressure signal aggregates vapor released from seven product shelves.
            A small remaining wet region may contribute little to that global response and
            still determine batch completion. The additional heater above the top shelf creates
            a distinct local thermal boundary, while tray contact, loading and available
            cold-wall area can vary along the rack. The heater arrangement alone does not
            establish the rate at which every shelf will dry.
          </p>
          <p className={prose}>
            One proposed approach compares a shelf's short temperature response to a controlled
            heater perturbation while wet with its characterized dry response. A lower
            latent-response signal might be consistent with ice depletion, but the comparison
            would require validated dry references, synchronized sensors, repeatable power
            input and an independently verified water inventory. It is not a residual-water
            measurement until those relationships are calibrated. Pressure-based completion
             criteria should therefore be checked against the slowest verified product region.
             Likewise, convergence of a local product probe with shelf temperature
             can indicate loss of latent cooling at that location without
             establishing that every tray or region is free of ice
             <InlineCite refs={['biopharma2019misconceptions']} />.
          </p>
        </div>

        <div id="discussion-experiments" className="prose-heading">
          <SubsectionLabel number="5.3" title="Measurements needed to identify the limitation" />
          <p className={prose}>
            A practical first comparison holds loading and thermal history constant while
            characterizing the existing tray contact and a dimensionally equivalent
            higher-conductivity alternative. Product temperatures at multiple positions
            and measured water loss would establish whether changing the solid heat path
            increases useful sublimation. Since surface contact resistance is separate from
            tray bulk conductivity, a metal substitution by itself would not identify
            the contributing interface resistance.
          </p>
          <p className={prose}>
            Paired capacitance-manometer and native thermocouple-gauge readings, together
            with the cold-wall frost temperature and product water-loss rate, would separate
            more of the pressure and vapor-capture behavior. Pressure-response studies
            must retain a product-temperature limit and should be judged by measured
            sublimation rather than by how deeply the gauge falls. Those observations would
            establish whether increasing gas-mediated heat transfer actually compensates
            for changes in vapor backpressure and dried-product resistance.
          </p>
          <p className={prose}>
            Identical product loads distributed across the seven shelf positions would
            test whether the final wet locations follow heater asymmetry, unequal contact
            or local vapor-transport limitations. These are field-identification proposals.
             No performance improvement, pressure optimum or completion threshold has yet
             been demonstrated on the target machine.
           </p>
         </div>

         <div id="discussion-controlled-bleed" className="prose-heading">
           <SubsectionLabel number="5.4" title="Testing pressure support through the drain port" />
           <p className={prose}>
             A separately metered gas inlet is a candidate intervention for this pressure regime. The worked Harvest Right Pharmaceutical
             dryer has a vacuum connection on its right side and a separate drain connection beneath
             the chamber. A proposed restricted inlet on the bottom drain port would admit a small
             controlled gas flow while the right-side pump connection remained unrestricted. The
             intention is to replenish part of the gas inventory as product-derived vapor generation
             falls, rather than reduce the pump's evacuation capacity. The concept has not been
             installed or tested on the target machine.
           </p>
           <p className={prose}>
             A replaceable 3D-printer nozzle was considered as the restriction because it offers a
             small nominal aperture. Its stated nozzle diameter, however, is not a calibrated
             vacuum-gas conductance. Actual throughput depends on upstream and chamber pressures,
             gas species, temperature, passage geometry, flow regime, sealing and possible frost
             or condensate obstruction. A fixed restriction supplies pressure-dependent flow, not
             feedback regulation at a specified pressure. A controllable, clean, dry gas source
             and independently verified isolation would be needed to evaluate it without
             conflating intentional admission with uncontrolled ambient leakage.
           </p>
           <p className={prose}>
             The physical tradeoff is consequential. Admitted non-condensable gas can increase
             total pressure and molecular heat transfer, but it can also increase resistance
             to water-vapor transport, change thermal-gauge response and change the workload of
             the pump. Ambient gas can introduce moisture, oxygen or contaminants; the drain
             connection must also remain compatible with its original drainage function.
             The method therefore cannot be assessed from pressure recovery alone.
             The proposed design is a metered-gas inlet, not an alteration to the vacuum-pump
             line or a demonstrated improvement in sublimation rate
             <InlineCite refs={['pikal1984', 'ganguly2013']} />.
           </p>
           <p className={prose}>
             A discriminating experiment would compare otherwise matched late-primary-drying
             intervals with the inlet isolated and with measured gas admission. Independent
             absolute pressure, native gauge output, introduced-gas flow, product and shelf
             temperatures, heater duty, remaining ice distribution and actual water-loss rate
             would be recorded. Water-vapor composition or partial-pressure information would
             be needed to separate improved heat delivery from increased vapor backpressure.
             Demonstrating a higher pressure or a warmer tray would not establish faster
             water removal. The comparison must determine whether ice was still present in
             the limiting product region.
           </p>
           <p className={prose}>
             The same reasoning does not establish a benefit during true secondary drying, when
             much of the remaining moisture is desorbed rather than sublimated ice. Pikal
             and colleagues observed little effect of chamber pressure between 0 and
             0.2 mmHg on secondary-drying rates in their tested formulations. Searles and
             colleagues later showed that high water-vapor partial pressure can increase
             retained moisture even where changes in total pressure alone have little effect.
             In this stage, adding gas merely to hold the earlier primary-drying pressure
             may confer no benefit or may be counterproductive. The relevant endpoint and
             gas composition must be established before applying the proposed intervention
             <InlineCite refs={['pikal1990secondary', 'searles2017secondary']} />.
           </p>
         </div>
       </div>
    </section>
  );
}
