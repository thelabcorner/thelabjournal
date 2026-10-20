import assert from 'node:assert/strict';
import {
  reconstructedGangulyContributions,
  RECONSTRUCTED_GANGULY_DATA,
} from '../src/manuscript-runtime/data/papers/sublimation/figures/gangulyContributionModel.ts';
const near=(actual,expected,tol=1e-9)=>
  assert(Math.abs(actual-expected)<tol,`expected ${actual} ≈ ${expected}`);
near(RECONSTRUCTED_GANGULY_DATA.length,4);
let previousGas=-Infinity;
for(const row of RECONSTRUCTED_GANGULY_DATA){
  near(row.radiation+row.contact+row.gas+row.flow,100);
  assert(row.gas>previousGas);
  previousGas=row.gas;
}
const low=reconstructedGangulyContributions(10);
near(low.gas,6);near(low.flow,8);near(low.radiation/low.contact,43/13);
const high=reconstructedGangulyContributions(100);
near(high.radiation,43);near(high.contact,13);near(high.gas,30);near(high.flow,14);
for(const p of [0,9,101,200,1500,Number.NaN])assert.throws(()=>reconstructedGangulyContributions(p),RangeError);
console.log(JSON.stringify({suite:'provenance-bounded four-path reconstruction',pressures:RECONSTRUCTED_GANGULY_DATA.map(x=>x.pressure), anchor10:[low.gas,low.flow],anchor100:[high.radiation,high.contact,high.gas,high.flow],result:'PASS'}));
