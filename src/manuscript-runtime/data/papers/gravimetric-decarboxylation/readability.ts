/**
 * Readability planning models used by the gravimetric thesis illustrations.
 * These are idealized screen-quantization thresholds, not measurement limits
 * of detection, calibrated uncertainty, or assertions of experimental fidelity.
 */
export const CO2_G_PER_MOL = 44.0094;
export const THCA_G_PER_MOL = 358.47005;
export const THCA_CO2_RATIO = CO2_G_PER_MOL / THCA_G_PER_MOL;
export const R_SI = 8.31446261815324;
export const PA_PER_PSI = 6894.757293168;
export const M3_PER_US_FLOZ = 0.0000295735295625;

export type ReadabilityStatus = 'below' | 'marginal' | 'clear';
export interface ReadabilityAssessment {
  status: ReadabilityStatus;
  steps: number;
  minimumMassG: number;
  clearMassG: number;
  signal: number;
  step: number;
}

export function readabilityStatus(steps: number): ReadabilityStatus {
  return steps < 2 ? 'below' : steps < 5 ? 'marginal' : 'clear';
}
export function scaleReadability(input: {
  sampleG: number;
  acidPercent: number;
  observedPercent: number;
  scaleStepG: number;
}): ReadabilityAssessment | null {
  const { sampleG, acidPercent, observedPercent, scaleStepG } = input;
  if (![sampleG, acidPercent, observedPercent, scaleStepG].every(Number.isFinite)
      || sampleG <= 0 || sampleG > 1e6 || acidPercent <= 0 || acidPercent > 100
      || observedPercent <= 0 || observedPercent > 100 || scaleStepG <= 0 || scaleStepG > 1000) return null;
  const signalPerG = (acidPercent / 100) * THCA_CO2_RATIO * (observedPercent / 100);
  const signal = sampleG * signalPerG;
  const steps = signal / scaleStepG;
  return {
    status: readabilityStatus(steps),
    steps,
    minimumMassG: 2 * scaleStepG / signalPerG,
    clearMassG: 5 * scaleStepG / signalPerG,
    signal,
    step: scaleStepG,
  };
}
export function gaugeReadability(input: {
  sampleG: number;
  acidPercent: number;
  observedPercent: number;
  headspaceFloz: number;
  gaugeStepPsi: number;
  initialTempC: number;
  currentTempC: number;
}): ReadabilityAssessment | null {
  const { sampleG, acidPercent, observedPercent, headspaceFloz,
    gaugeStepPsi, initialTempC, currentTempC } = input;
  if (![sampleG, acidPercent, observedPercent, headspaceFloz, gaugeStepPsi,
    initialTempC, currentTempC].every(Number.isFinite)
      || sampleG <= 0 || sampleG > 1e6 || acidPercent <= 0 || acidPercent > 100
      || observedPercent <= 0 || observedPercent > 100
      || headspaceFloz <= 0 || headspaceFloz > 1e6
      || gaugeStepPsi <= 0 || gaugeStepPsi > 1000
      || initialTempC <= -273.15 || initialTempC > 1000
      || currentTempC <= -273.15 || currentTempC > 1000) return null;
  const t0 = initialTempC + 273.15, t1 = currentTempC + 273.15;
  const headspaceM3 = headspaceFloz * M3_PER_US_FLOZ;
  const pressurePerFeedG = (acidPercent / 100) * (observedPercent / 100)
    / THCA_G_PER_MOL * R_SI * t1 / headspaceM3 / PA_PER_PSI;
  // Two independent pressure readings, each rounded to +/- one half-step,
  // normalized to the current temperature, yield this worst-case bound in PSI.
  const twoReadingBoundPsi = (gaugeStepPsi / 2) * (1 + t1 / t0);
  const signal = sampleG * pressurePerFeedG;
  const steps = signal / twoReadingBoundPsi;
  return {
    status: readabilityStatus(steps),
    steps,
    minimumMassG: 2 * twoReadingBoundPsi / pressurePerFeedG,
    clearMassG: 5 * twoReadingBoundPsi / pressurePerFeedG,
    signal,
    step: twoReadingBoundPsi,
  };
}

/** Round upwards to avoid putting a user fractionally below a stated cutoff. */
export function conservativeMassG(value: number): number {
  if (!(value > 0) || !Number.isFinite(value)) return value;
  const magnitude = Math.floor(Math.log10(value));
  const quantum = 10 ** (magnitude - 4);
  return Math.ceil((value / quantum) - 1e-11) * quantum;
}
