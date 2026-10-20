import { SectionLabel } from '../../../components/sections/Abstract';
import { LyophilizationPathFigure } from './LyophilizationPathFigure';

export function FullAbstract() {
  return (
    <section id="abstract" aria-labelledby="abstract-heading" className="prose-heading mb-10 lyo-abstract">
      <SectionLabel number="" title="Abstract" id="abstract-heading" />
      <div className="research-abstract-card lyo-abstract-card">
        <p>
          A low chamber-pressure reading does not establish that a frozen product is drying rapidly, or even
          that substantial sublimation is continuing. The difference between ice-equilibrium vapor pressure
          and surrounding water-vapor partial pressure expresses a potential for vapor transport, not a measured
          rate of water removal. Sustained sublimation also requires heat to replace the energy absorbed by the
          phase change. When that heat is insufficient, sublimative cooling lowers the ice temperature and
          diminishes its equilibrium vapor pressure.
        </p>
        <p>
          This applied interpretation examines why familiar operating assumptions can be misleading in a
          seven-shelf Harvest Right freeze dryer. Lowering pressure can favor vapor transport while reducing
          gas-mediated heat transfer. A thermal-conductivity gauge's indicated pressure depends on gas
          composition and cannot be equated automatically with absolute chamber pressure. Water released from
          the product deposits as ice on the refrigerated inner wall of the same chamber, so vapor capture
          reduces gas-phase water without necessarily expelling that water from the apparatus. Heater control,
          tray contact, and spatial differences between shelves determine how these effects appear in practice.
        </p>
        <p>
          Published experiments and conservation laws provide the scientific basis for these interpretations.
          Equations and illustrative calculations clarify what individual measurements can establish and where
          common shortcuts fail. Vial-scale coefficients do not determine the behavior of full-width trays,
          and the target dryer's thermal contact, vapor composition, and pressure response remain uncalibrated.
          The engineering implications are field applications of established physics and testable proposals,
          not claims of new experiments, measured cycle acceleration, or a universal operating pressure.
        </p>
      </div>
      <LyophilizationPathFigure />
    </section>
  );
}
