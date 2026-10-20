import assert from 'node:assert/strict';
import { SATURATING_PARAMS } from '../src/manuscript-runtime/data/papers/sublimation/pressureModel.ts';

/**
 * Conditional parallel-plate scaling. These examples are NOT machine
 * measurements: k, accommodation, T, and effective gap remain unknown.
 *
 * For K_g = C2*P/(P+C3): continuum plateau K_inf = k_g/L,
 * free-molecular slope dK/dP|0 = beta (gap independent),
 * hence C3 = K_inf/beta, so BOTH C2 and C3 scale as 1/L.
 */
const {c2,c3}=SATURATING_PARAMS;
const paPerMTorr=101325/760000;
const kAssumedWmK=.024;
const effectiveGapM=kAssumedWmK/c2;
const betaObservedSlope=c2/(c3*paPerMTorr);
const alpha1Beta= ((1.4+1)/(1.4-1))*Math.sqrt(
  8.314462618/(8*Math.PI*.0280134*260)
);
const alphaImplied=betaObservedSlope/alpha1Beta;
assert(alphaImplied>0 && alphaImplied<1);
assert(effectiveGapM>0 && effectiveGapM<.01);
const reference=({L,c2,c3})=>({L,c2,c3,
  saturated:c2,
  freeSlope:c2/(c3*paPerMTorr)
});
function scaledGap(L){
  const scale=effectiveGapM/L;
  return reference({L,c2:c2*scale,c3:c3*scale});
}
const ref=scaledGap(effectiveGapM);
const long=scaledGap(.035);
const twice=scaledGap(2*effectiveGapM);
const nearly=(a,b)=>assert(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(a),Math.abs(b)));
nearly(twice.c2/ref.c2,.5);
nearly(twice.c3/ref.c3,.5);
nearly(twice.freeSlope,ref.freeSlope);
nearly(long.freeSlope,ref.freeSlope);
nearly(long.c2,kAssumedWmK/.035);
assert(long.c3<c3/10);
console.log(JSON.stringify({
  scope:'ideal parallel plates only; not a physical gap identification',
  c2Observed:c2,c3ObservedMTorr:c3,
  assumedGasConductivityWmK:kAssumedWmK,
  impliedGapMM:effectiveGapM*1000,
  impliedAccommodationAt260K:alphaImplied,
  hypotheticalGapMM:35,
  hypotheticalC2Wm2K:long.c2,
  hypotheticalC3MTorr:long.c3,
  lowPressureSlopeInvariant:long.freeSlope,
  result:'PASS',
}));
