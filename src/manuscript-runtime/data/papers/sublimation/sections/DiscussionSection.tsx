import { SubsectionLabel } from '../../../../components/sections/Abstract';
import { InlineCite } from '../../../../components/prose/InlineCite';

const prose = 'text-sm leading-relaxed text-[var(--text)]';

export function DiscussionSection() {
  return (
    <section id="discussion" aria-labelledby="discussion-heading" className="prose-heading mb-10">
      <div className="research-chapter-label mb-4">
        <span className="research-heading-number">5</span>
        <h2 id="discussion-heading" className="text-base font-semibold text-[var(--text)] tracking-tight">Discussion</h2>
      </div>
      <div className="space-y-4">
        <p className={prose}>
          An operating trace records the interaction of heater, product, vacuum pump, refrigerated
          chamber wall and pressure instruments. It is not a direct record of the water remaining
          in the product. Interpretation begins by asking what each sensor actually measures
          and whether a different physical process could produce the same reading.
        </p>

        <div id="discussion-synthesis" className="prose-heading">
          <SubsectionLabel number="5.1" title="Distinguishing pressure, heat input and water removal" />
          <p className={prose}>
            A stable chamber-pressure reading can accompany active sublimation when generation
            of water vapor is balanced by deposition on the refrigerated wall. It can also
            accompany slow sublimation when little vapor is being generated. The native
            thermocouple gauge adds another ambiguity because its calibration depends on
            gas composition. A change in its indicated pressure cannot, without supporting
            measurements, distinguish additional water-vapor generation, effective wall-ice
            collection, pump activity, noncondensable gases or changing mixture composition.
          </p>
          <p className={prose}>
            A favorable vapor-pressure potential likewise does not establish the amount of
            sublimation occurring. Ice can initially supply latent heat from the product's
            stored sensible energy. This causes sublimative cooling and lowers the equilibrium
            vapor pressure over the ice. Sustained drying requires heat to replace the latent
            energy consumed as well as a pathway for vapor to move through the dry layer
            and deposit on the cold wall. <InlineCite refs={['pikal1984', 'pikal1985']} />
          </p>
          <p className={prose}>
            These mechanisms explain why a single pressure setpoint cannot be derived from
            vial-scale measurements. The heat-transfer path across an open tray, resistance
            through the drying product and deposition on the chamber wall can all constrain
            water removal. Even a measured mass-loss rate at one operating condition does not
            identify which of those resistances is dominant. The value of a model lies in
            identifying the additional measurements needed to distinguish them.
          </p>
        </div>

        <div id="discussion-spatial" className="prose-heading">
          <SubsectionLabel number="5.2" title="Why the last wet shelf determines the endpoint" />
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
          </p>
        </div>

        <div id="discussion-experiments" className="prose-heading">
          <SubsectionLabel number="5.3" title="Measurements that distinguish the limiting mechanisms" />
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
      </div>
    </section>
  );
}
