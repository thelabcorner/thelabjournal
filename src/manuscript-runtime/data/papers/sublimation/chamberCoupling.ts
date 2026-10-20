/**
 * A falsifiable, well-mixed chamber baseline for primary-drying vapor removal.
 *
 * NOT a calibrated Harvest Right model. The removal conductance is locally
 * linearized at the operating point and combines internal cold-wall deposition
 * with external pump exhaust into one effective sink. This is a null model against which measured vertical gradients
 * and spatial transport models can be compared.
 *
 * Dimensions:
 *   flux                kg / (m² s)
 *   pressure             Pa absolute
 *   transport resistance Pa m² s / kg
 *   removal conductance mol / (s Pa)
 *   exposed area        m²
 *   water molar mass    kg / mol
 *
 * For a wet zone i, j_i=max(0,(P_sat,i-p_w)/R_i) where
 * R_i=R_product,i+R_heat,i. A shared chamber obeys
 * Σ_i A_i j_i / M_w = C_w (p_w-p_background).
 */
export const WATER_MOLAR_MASS_KG_PER_MOL = 0.01801528;

export interface WetZone {
  readonly id: string;
  readonly sublimationAreaM2: number;
  readonly saturationPressureAtHeatBoundaryPa: number;
  readonly productResistancePaM2sPerKg: number;
  /** The linearized heat-transfer resistance ΔH Γ/K · dPsat/dT. */
  readonly thermalResistancePaM2sPerKg: number;
}

export interface ChamberCouplingInput {
  readonly zones: readonly WetZone[];
  readonly sinkConductanceMolPerSecPa: number;
  readonly backgroundVaporPressurePa: number;
  readonly molarMassKgPerMol?: number;
}

export interface ChamberCouplingResult {
  readonly waterVaporPressurePa: number;
  readonly excessPressurePa: number;
  readonly molarVaporGenerationPerSec: number;
  readonly molarVaporRemovalPerSec: number;
  readonly molarBalanceResidualPerSec: number;
  readonly zoneMassFluxesKgM2s: readonly number[];
  readonly totalMassRemovalKgPerSec: number;
}

/**
 * Closed-form effective chamber resistance for ONE wet zone with linear sink.
 * Returns Infinity for zero conductance, correctly representing no steady
 * outflow. This must not be applied to each shelf independently in a shared
 * chamber, where the backpressure couples the shelves.
 */
export function effectiveChamberResistancePaM2sPerKg(
  areaM2: number, sinkConductanceMolPerSecPa: number,
  molarMassKgPerMol = WATER_MOLAR_MASS_KG_PER_MOL,
): number {
  if (!(Number.isFinite(areaM2) && areaM2 > 0)
    || !(Number.isFinite(sinkConductanceMolPerSecPa) && sinkConductanceMolPerSecPa >= 0)
    || !(Number.isFinite(molarMassKgPerMol) && molarMassKgPerMol > 0)) {
    throw new RangeError('Invalid chamber resistance parameters');
  }
  return sinkConductanceMolPerSecPa === 0
    ? Number.POSITIVE_INFINITY
    : areaM2 / (molarMassKgPerMol * sinkConductanceMolPerSecPa);
}

/**
 * Solve the single shared-vapor-pressure fixed point by monotone bisection.
 * Positive-part fluxes exclude negative sublimation and gracefully deactivate
 * zones whose saturation pressure falls below common water-vapor pressure.
 * The legacy one-sink closure does not resolve wall deposition from pump exhaust.
 * If Cw=0 this steady model predicts no sustained
 * sublimation; startup and transient depletion require the dynamic inventory.
 */
export function solveWellMixedChamber(input: ChamberCouplingInput): ChamberCouplingResult {
  const { zones, sinkConductanceMolPerSecPa: C, backgroundVaporPressurePa: background } = input;
  const M = input.molarMassKgPerMol ?? WATER_MOLAR_MASS_KG_PER_MOL;
  if (!Number.isFinite(C) || C < 0 || !Number.isFinite(background) || background < 0
    || !Number.isFinite(M) || M <= 0 || !zones.length) {
    throw new RangeError('Invalid chamber coupling inputs');
  }
  for (const zone of zones) {
    if (!zone.id || !Number.isFinite(zone.sublimationAreaM2) || zone.sublimationAreaM2 <= 0
      || !Number.isFinite(zone.saturationPressureAtHeatBoundaryPa)
      || zone.saturationPressureAtHeatBoundaryPa < 0
      || !Number.isFinite(zone.productResistancePaM2sPerKg)
      || zone.productResistancePaM2sPerKg < 0
      || !Number.isFinite(zone.thermalResistancePaM2sPerKg)
      || zone.thermalResistancePaM2sPerKg < 0
      || zone.productResistancePaM2sPerKg + zone.thermalResistancePaM2sPerKg <= 0) {
      throw new RangeError(`Invalid wet-zone inputs: ${zone.id}`);
    }
  }

  const effective = zones.map(zone => ({
    d: Math.max(0, zone.saturationPressureAtHeatBoundaryPa - background),
    conductanceMass: 1 / (zone.productResistancePaM2sPerKg + zone.thermalResistancePaM2sPerKg),
    area: zone.sublimationAreaM2,
  }));
  const high = Math.max(...effective.map(zone => zone.d));
  let excess = 0;
  if (C > 0 && high > 0) {
    let lo = 0;
    let hi = high;
    const residual = (pressure: number) =>
      effective.reduce((sum, zone) =>
        sum + zone.area * Math.max(0, zone.d - pressure)
          * zone.conductanceMass / M, 0) - C * pressure;
    // Bracket is exact: residual(0)>=0, residual(max(D))<=0.
    for (let i = 0; i < 85; i += 1) {
      const mid = lo + (hi - lo) / 2;
      if (residual(mid) > 0) lo = mid;
      else hi = mid;
    }
    excess = lo + (hi - lo) / 2;
  } else if (C === 0) {
    excess = high; // all sources stall against the common vapor backpressure
  }
  const zoneMassFluxesKgM2s = effective.map(zone =>
    Math.max(0, zone.d - excess) * zone.conductanceMass);
  const totalMassRemovalKgPerSec = zoneMassFluxesKgM2s.reduce((sum, j, i) =>
    sum + j * effective[i].area, 0);
  const molarVaporGenerationPerSec = totalMassRemovalKgPerSec / M;
  const molarVaporRemovalPerSec = C * excess;
  return {
    waterVaporPressurePa: background + excess,
    excessPressurePa: excess,
    zoneMassFluxesKgM2s,
    totalMassRemovalKgPerSec,
    molarVaporGenerationPerSec,
    molarVaporRemovalPerSec,
    molarBalanceResidualPerSec: molarVaporGenerationPerSec - molarVaporRemovalPerSec,
  };
}

/**
 * Local wet-product temperature sensitivity to absorbed heat flux at fixed
 * removal conductance, neglecting changes to the frozen geometry during the
 * small perturbation. Units K per W/m².
 *
 * The fixed-chamber-pressure limiting case sets chamberResistance = 0.
 * A nonnegative condenser/removal resistance weakens the latent cooling
 * derivative for a positive ice saturation-pressure slope.
 */
export function latentTemperatureSensitivityKPerWm2(
  enthalpyJPerKg: number,
  saturationPressureSlopePaPerK: number,
  productResistancePaM2sPerKg: number,
  chamberResistancePaM2sPerKg = 0,
  heatLossSlopeWPerM2K = 0,
): number {
  const x = [enthalpyJPerKg, saturationPressureSlopePaPerK,
    productResistancePaM2sPerKg, chamberResistancePaM2sPerKg,
    heatLossSlopeWPerM2K];
  if (!x.every(Number.isFinite) || enthalpyJPerKg <= 0
    || saturationPressureSlopePaPerK <= 0 || productResistancePaM2sPerKg <= 0
    || chamberResistancePaM2sPerKg < 0 || heatLossSlopeWPerM2K < 0) {
    throw new RangeError('Invalid latent-temperature sensitivity parameters');
  }
  return 1 / (enthalpyJPerKg * saturationPressureSlopePaPerK
    / (productResistancePaM2sPerKg + chamberResistancePaM2sPerKg)
    + heatLossSlopeWPerM2K);
}

/** The approximate local heat-transfer resistance on the product-area basis. */
export function linearizedThermalResistancePaM2sPerKg(
  enthalpyJPerKg: number,
  exposedToHeatAreaRatio: number,
  heatTransferCoefficientWPerM2K: number,
  saturationPressureSlopePaPerK: number,
): number {
  if (![enthalpyJPerKg, exposedToHeatAreaRatio, heatTransferCoefficientWPerM2K,
    saturationPressureSlopePaPerK].every(x => Number.isFinite(x) && x > 0)) {
    throw new RangeError('Positive finite physical parameters required');
  }
  return enthalpyJPerKg * exposedToHeatAreaRatio
    * saturationPressureSlopePaPerK / heatTransferCoefficientWPerM2K;
}

/**
 * Harvest Right geometry: the cylindrical chamber's refrigerated inner wall is
 * the ice-collecting surface. Product water enters the SAME gas volume before
 * depositing on the wall. Only the external pump exhaust leaves the chamber.
 *
 * This deliberately does not model a separate downstream condenser vessel.
 * Rates are locally linearized molar conductances, not manufacturer ratings.
 * During deposition, wall flux is positive only above ice equilibrium pressure.
 * Resublimation of accumulated frost is outside this steady accumulation model.
 */
export interface InternalColdWallChamberInput {
  readonly zones: readonly WetZone[];
  readonly wallDepositionConductanceMolPerSecPa: number;
  readonly wallIceSaturationPressurePa: number;
  /** Water-vapor throughput through the external vacuum pump, if any. */
  readonly pumpWaterVaporConductanceMolPerSecPa: number;
  readonly molarMassKgPerMol?: number;
}

export interface InternalColdWallChamberResult {
  readonly waterVaporPressurePa: number;
  readonly zoneMassFluxesKgM2s: readonly number[];
  readonly productWaterLossKgPerSec: number;
  readonly wallIceGainKgPerSec: number;
  readonly externallyPumpedWaterKgPerSec: number;
  readonly vaporGenerationMolPerSec: number;
  readonly wallDepositionMolPerSec: number;
  readonly pumpWaterVaporMolPerSec: number;
  readonly molarBalanceResidualPerSec: number;
}

/** One shared-vapor-pressure steady-state solution, wall and pump kept apart. */
export function solveInternalColdWallChamber(
  input: InternalColdWallChamberInput,
): InternalColdWallChamberResult {
  const { zones, wallDepositionConductanceMolPerSecPa: wallC,
    wallIceSaturationPressurePa: wallSat,
    pumpWaterVaporConductanceMolPerSecPa: pumpC } = input;
  const M = input.molarMassKgPerMol ?? WATER_MOLAR_MASS_KG_PER_MOL;
  if (!zones.length || ![wallC, wallSat, pumpC, M].every(Number.isFinite)
    || wallC < 0 || wallSat < 0 || pumpC < 0 || M <= 0) {
    throw new RangeError('Invalid internal cold-wall parameters');
  }
  const coefficients = zones.map(zone => {
    if (!zone.id || !Number.isFinite(zone.sublimationAreaM2) || zone.sublimationAreaM2 <= 0
      || !Number.isFinite(zone.saturationPressureAtHeatBoundaryPa) || zone.saturationPressureAtHeatBoundaryPa < 0
      || !Number.isFinite(zone.productResistancePaM2sPerKg) || zone.productResistancePaM2sPerKg < 0
      || !Number.isFinite(zone.thermalResistancePaM2sPerKg) || zone.thermalResistancePaM2sPerKg < 0
      || zone.productResistancePaM2sPerKg + zone.thermalResistancePaM2sPerKg <= 0) {
      throw new RangeError(`Invalid wet zone: ${zone.id}`);
    }
    return {
      drivingPressurePa: zone.saturationPressureAtHeatBoundaryPa,
      conductanceKgPerM2sPa: 1 / (zone.productResistancePaM2sPerKg + zone.thermalResistancePaM2sPerKg),
      areaM2: zone.sublimationAreaM2,
    };
  });
  const totalGenerationAt = (p: number) => coefficients.reduce((sum, zone) =>
    sum + zone.areaM2 * Math.max(0, zone.drivingPressurePa - p)
      * zone.conductanceKgPerM2sPa / M, 0);
  const wallDepositionAt = (p: number) => wallC * Math.max(0, p - wallSat);
  const pumpExhaustAt = (p: number) => pumpC * p;
  const residual = (p: number) => totalGenerationAt(p) - wallDepositionAt(p) - pumpExhaustAt(p);
  const high = Math.max(0, ...coefficients.map(zone => zone.drivingPressurePa));
  let p = 0;
  if (high > 0) {
    let lo = 0;
    let hi = high;
    // Both sink functions are nondecreasing; sources are nonincreasing.
    // With no sink, this selects the zero-flux equilibrium at max source Psat.
    for (let i = 0; i < 85; i++) {
      const mid = lo + (hi - lo) / 2;
      if (residual(mid) > 0) lo = mid;
      else hi = mid;
    }
    p = (lo + hi) / 2;
  }
  const zoneMassFluxesKgM2s = coefficients.map(zone =>
    Math.max(0, zone.drivingPressurePa - p) * zone.conductanceKgPerM2sPa);
  const productWaterLossKgPerSec = zoneMassFluxesKgM2s.reduce(
    (sum, flux, index) => sum + flux * coefficients[index].areaM2, 0);
  const vaporGenerationMolPerSec = productWaterLossKgPerSec / M;
  const wallDepositionMolPerSec = wallDepositionAt(p);
  const pumpWaterVaporMolPerSec = pumpExhaustAt(p);
  return {
    waterVaporPressurePa: p,
    zoneMassFluxesKgM2s,
    productWaterLossKgPerSec,
    wallIceGainKgPerSec: M * wallDepositionMolPerSec,
    externallyPumpedWaterKgPerSec: M * pumpWaterVaporMolPerSec,
    vaporGenerationMolPerSec,
    wallDepositionMolPerSec,
    pumpWaterVaporMolPerSec,
    molarBalanceResidualPerSec: vaporGenerationMolPerSec
      - wallDepositionMolPerSec - pumpWaterVaporMolPerSec,
  };
}
