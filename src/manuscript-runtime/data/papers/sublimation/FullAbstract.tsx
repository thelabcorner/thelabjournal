import { Abstract } from '../../../components/sections/Abstract';
import { LyophilizationPathFigure } from './LyophilizationPathFigure';

export function FullAbstract() {
  return (
    <Abstract after={<LyophilizationPathFigure />}>
        <p>
          Common operating assumptions in single-chamber freeze drying equate deeper
          vacuum with faster drying, an indicated shelf temperature with sufficient
          heat input, and falling pressure with completion of primary drying.
          This analysis tests those assumptions against phase equilibrium,
          heat- and mass-transfer measurements, conservation balances,
          equipment documentation, and archived controller observations.
        </p>
        <p>
          The vapor-pressure difference at an ice interface represents a
          potential for transfer. It is not a mechanical force and not a measured
          sublimation rate.
          Lower water-vapor partial pressure may favor vapor release, whereas
          reduced total pressure weakens molecular gas conduction in the
          relevant rarefied regime. Vacuum insulation deliberately suppresses
          that energy transfer, while thermal-conductivity vacuum gauges use
          it to infer pressure and a freeze dryer can use it to heat ice.
          In integrated cold-wall units, vapor deposits inside the product
          chamber rather than in a separate condenser vessel.
          The effects of sublimative cooling, growing dried-layer resistance, changing
          gas composition, tray contacts, and pressure-gated heater control
          determine how these competing effects develop.
        </p>
        <p>
          A late-primary-drying limitation can arise when falling vapor
          production permits pump-down, weaker gas-mediated heat delivery
          further suppresses sublimation, and the diminished source allows
          pressure to decline again. This recursive limitation cannot be
          distinguished from genuine completion by chamber pressure alone.
          Its extent in marketed dryers remains unmeasured; verification
          requires product-resolved thermal and water-removal data.
        </p>
    </Abstract>
  );
}
