/**
 * Current reduced-order pressure model used by the interactive manuscript UI.
 *
 * This is deliberately the SATURATING family only:
 *   K(P) = Kc + Kr + C2 P/(P+C3)
 *
 * The fourth, flow-associated term Kf is not assigned a universal pressure law
 * here because the Harvest Right geometry has not been calibrated.  The UI must
 * therefore not resurrect the retired h_conv ~ sqrt(P) extrapolation.
 *
 * K(P) * DeltaP is a screening metric.  The normalized series-resistance score
 * below is the manuscript's linearized coupled heat/mass model:
 *
 *   J ~ K(P)(Psub-fP) / [1 + eta K(P)/Kref].
 */

export const SATURATING_PARAMS = {
  kc: 1.2,
  kr: 2.0,
  c2: 13.17,
  c3: 162.0,
  referencePressure: 500.0,
} as const;

export function kgSaturating(pressureMTorr: number): number {
  const { c2, c3 } = SATURATING_PARAMS;
  return c2 * pressureMTorr / (pressureMTorr + c3);
}

export function kSaturating(pressureMTorr: number): number {
  const { kc, kr } = SATURATING_PARAMS;
  return kc + kr + kgSaturating(pressureMTorr);
}

export function drivingForceMTorr(
  pressureMTorr: number,
  pSubMTorr: number,
  vaporFraction: number,
): number {
  return Math.max(0, pSubMTorr - vaporFraction * pressureMTorr);
}

export function screeningScore(
  pressureMTorr: number,
  pSubMTorr: number,
  vaporFraction: number,
): number {
  return kSaturating(pressureMTorr) * drivingForceMTorr(pressureMTorr, pSubMTorr, vaporFraction);
}

export function normalizedSeriesScore(
  pressureMTorr: number,
  pSubMTorr: number,
  vaporFraction: number,
  eta: number,
): number {
  const k = kSaturating(pressureMTorr);
  const kRef = kSaturating(SATURATING_PARAMS.referencePressure);
  const drive = drivingForceMTorr(pressureMTorr, pSubMTorr, vaporFraction);
  return k * drive / (1 + eta * k / kRef);
}

/** Exact stationary point of the fixed-parameter screening metric. */
export function pStarScreening(pSubMTorr: number, vaporFraction: number): number {
  if (!(vaporFraction > 0 && vaporFraction <= 1)) return Number.NaN;
  const { kc, kr, c2, c3 } = SATURATING_PARAMS;
  const a = kc + kr;
  const radicand = c2 * c3 * (c3 + pSubMTorr / vaporFraction) / (a + c2);
  return Math.sqrt(Math.max(0, radicand)) - c3;
}

/** Exact stationary point of the normalized series-resistance objective. */
export function pStarSeries(
  pSubMTorr: number,
  vaporFraction: number,
  eta: number,
): number {
  if (!(vaporFraction > 0 && vaporFraction <= 1) || eta < 0) return Number.NaN;
  const { kc, kr, c2, c3, referencePressure } = SATURATING_PARAMS;
  const kInf = kc + kr + c2;
  const c = c2 * c3;
  const kRef = kSaturating(referencePressure);
  const r = eta / kRef;
  const d = 1 + r * kInf;
  const aPress = pSubMTorr + vaporFraction * c3;
  const radicand = c / (vaporFraction * kInf) * (aPress * d - vaporFraction * r * c);
  const q = (r * c + Math.sqrt(Math.max(0, radicand))) / d;
  return q - c3;
}

export function boundedPStarSeries(
  pSubMTorr: number,
  vaporFraction: number,
  eta: number,
  minPressure = 0,
  maxPressure = 1500,
): number {
  const thermodynamicCeiling = pSubMTorr / vaporFraction;
  const p = pStarSeries(pSubMTorr, vaporFraction, eta);
  return Math.max(minPressure, Math.min(maxPressure, thermodynamicCeiling * 0.999999, p));
}
