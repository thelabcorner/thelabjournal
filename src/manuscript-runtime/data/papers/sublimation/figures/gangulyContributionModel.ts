/**
 * Transparent reconstruction of Ganguly-inspired four-path contributions.
 *
 * The 100 mTorr anchor (radiation 43%, contact 13%, gas 30%, flow 14%)
 * and reported low-pressure component shares (gas 6%, flow 8% at 10 mTorr)
 * come from archival September research notes, not independent digitization
 * of the paper's figures. These are MODEL ASSUMPTIONS, not experimental data.
 *
 * For 10 to 100 mTorr only, the model keeps absolute radiation/contact
 * heat paths fixed and interpolates gas/flow by individual power laws, then
 * renormalizes to 100%. It makes no claim for larger pressures.
 */
export interface ContributionShare {
  readonly pressure: number;
  readonly radiation: number;
  readonly contact: number;
  readonly gas: number;
  readonly flow: number;
}
const anchor100 = { radiation: .43, contact: .13, gas: .30, flow: .14 } as const;
const reference10 = {gas: .06, flow: .08} as const;
const total10 = (anchor100.radiation+anchor100.contact) /
  (1-reference10.gas-reference10.flow);
const gas10 = reference10.gas*total10;
const flow10 = reference10.flow*total10;
const gasExponent = Math.log(anchor100.gas/gas10)/Math.log(10);
const flowExponent = Math.log(anchor100.flow/flow10)/Math.log(10);

export function reconstructedGangulyContributions(pressureMTorr:number): ContributionShare {
  if (!Number.isFinite(pressureMTorr) || pressureMTorr<10 || pressureMTorr>100) {
    throw new RangeError('Reconstruction defined only over 10 to 100 mTorr');
  }
  const normalized=pressureMTorr/100;
  const raw={
    radiation:anchor100.radiation,
    contact:anchor100.contact,
    gas:anchor100.gas*normalized**gasExponent,
    flow:anchor100.flow*normalized**flowExponent,
  };
  const sum=raw.radiation+raw.contact+raw.gas+raw.flow;
  return {
    pressure:pressureMTorr,
    radiation:100*raw.radiation/sum,
    contact:100*raw.contact/sum,
    gas:100*raw.gas/sum,
    flow:100*raw.flow/sum,
  };
}
export const RECONSTRUCTED_GANGULY_PRESSURES = [10,20,60,100] as const;
export const RECONSTRUCTED_GANGULY_DATA =
  RECONSTRUCTED_GANGULY_PRESSURES.map(reconstructedGangulyContributions);
