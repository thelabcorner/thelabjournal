/**
 * Transcribed values from printed Ganguly source figures, distinct from raw
 * sublimation mass-loss measurements. Original lab measurement files were not
 * supplied; these arrays reproduce the numerical pie labels and Figure 13 fits.
 *
 * - 2014 dissertation Figure 2.1: 20 pressure/geometry conditions
 * - 2010 conference Figure 14: 16 pressure/geometry conditions (different labels)
 * - 2010 conference Figure 13: 4 reported 10–100 mTorr linear regressions
 * - 2010 Figure 13 estimated radiation baseline: 2,666 W/m²
 *
 * Do not pool the two pie datasets as one experimental series.
 */
export interface GangulyFigureLabel {
  readonly configuration: 'Direct contact' | '1 mm' | '2 mm' | '3 mm';
  readonly pressure: number;
  readonly radiation: number;
  readonly contact: number;
  readonly gas: number;
  readonly flow: number;
}
export interface GangulyFluxFit {
  readonly name: string;
  readonly slope: number;
  readonly intercept: number;
}
export const GANGULY_2014_FIG_2_1: readonly GangulyFigureLabel[] = [
  { configuration: '3 mm', pressure: 10, radiation: 86, contact: 0, gas: 4, flow: 10 },
  { configuration: '3 mm', pressure: 20, radiation: 76, contact: 0, gas: 5, flow: 18 },
  { configuration: '3 mm', pressure: 60, radiation: 71, contact: 0, gas: 7, flow: 22 },
  { configuration: '3 mm', pressure: 100, radiation: 68, contact: 0, gas: 9, flow: 23 },
  { configuration: '3 mm', pressure: 200, radiation: 68, contact: 0, gas: 9, flow: 23 },
  { configuration: '2 mm', pressure: 10, radiation: 86, contact: 0, gas: 5, flow: 10 },
  { configuration: '2 mm', pressure: 20, radiation: 76, contact: 0, gas: 7, flow: 17 },
  { configuration: '2 mm', pressure: 60, radiation: 67, contact: 0, gas: 9, flow: 23 },
  { configuration: '2 mm', pressure: 100, radiation: 64, contact: 0, gas: 13, flow: 23 },
  { configuration: '2 mm', pressure: 200, radiation: 63, contact: 0, gas: 13, flow: 24 },
  { configuration: '1 mm', pressure: 10, radiation: 87, contact: 0, gas: 7, flow: 6 },
  { configuration: '1 mm', pressure: 20, radiation: 73, contact: 0, gas: 8, flow: 19 },
  { configuration: '1 mm', pressure: 60, radiation: 63, contact: 0, gas: 13, flow: 24 },
  { configuration: '1 mm', pressure: 100, radiation: 61, contact: 0, gas: 16, flow: 23 },
  { configuration: '1 mm', pressure: 200, radiation: 58, contact: 0, gas: 24, flow: 18 },
  { configuration: 'Direct contact', pressure: 10, radiation: 69, contact: 17, gas: 5, flow: 8 },
  { configuration: 'Direct contact', pressure: 20, radiation: 61, contact: 15, gas: 10, flow: 14 },
  { configuration: 'Direct contact', pressure: 60, radiation: 45, contact: 11, gas: 14, flow: 30 },
  { configuration: 'Direct contact', pressure: 100, radiation: 45, contact: 11, gas: 19, flow: 25 },
  { configuration: 'Direct contact', pressure: 200, radiation: 43, contact: 11, gas: 26, flow: 20 },
] as const;
export const GANGULY_2010_FIG_14: readonly GangulyFigureLabel[] = [
  { configuration: '3 mm', pressure: 10, radiation: 95, contact: 0, gas: 5, flow: 0 },
  { configuration: '3 mm', pressure: 40, radiation: 84, contact: 0, gas: 13, flow: 3 },
  { configuration: '3 mm', pressure: 100, radiation: 66, contact: 0, gas: 15, flow: 19 },
  { configuration: '3 mm', pressure: 200, radiation: 66, contact: 0, gas: 18, flow: 16 },
  { configuration: '2 mm', pressure: 10, radiation: 94, contact: 0, gas: 5, flow: 1 },
  { configuration: '2 mm', pressure: 40, radiation: 84, contact: 0, gas: 10, flow: 6 },
  { configuration: '2 mm', pressure: 100, radiation: 70, contact: 0, gas: 11, flow: 19 },
  { configuration: '2 mm', pressure: 200, radiation: 73, contact: 0, gas: 12, flow: 15 },
  { configuration: '1 mm', pressure: 10, radiation: 95, contact: 0, gas: 4, flow: 1 },
  { configuration: '1 mm', pressure: 40, radiation: 87, contact: 0, gas: 8, flow: 5 },
  { configuration: '1 mm', pressure: 100, radiation: 82, contact: 0, gas: 9, flow: 9 },
  { configuration: '1 mm', pressure: 200, radiation: 78, contact: 0, gas: 9, flow: 13 },
  { configuration: 'Direct contact', pressure: 10, radiation: 76, contact: 17, gas: 5, flow: 2 },
  { configuration: 'Direct contact', pressure: 40, radiation: 65, contact: 15, gas: 13, flow: 7 },
  { configuration: 'Direct contact', pressure: 100, radiation: 49, contact: 11, gas: 16, flow: 24 },
  { configuration: 'Direct contact', pressure: 200, radiation: 47, contact: 10, gas: 22, flow: 21 },
] as const;
export const GANGULY_2010_FIG_13_FITS: readonly GangulyFluxFit[] = [
  { name: 'Direct contact', slope: 21.2, intercept: 3200 },
  { name: '1 mm', slope: 13.8, intercept: 2600 },
  { name: '2 mm', slope: 10.5, intercept: 2700 },
  { name: '3 mm', slope: 7.8, intercept: 2700 },
] as const;
export const GANGULY_2010_FIG_13_RADIATION_W_M2 = 2666;
export const fittedTotalHeatFlux = (fit: GangulyFluxFit, pressureMTorr: number) =>
  fit.slope * pressureMTorr + fit.intercept;
