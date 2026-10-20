import assert from 'node:assert/strict';
import {
  WATER_MOLAR_MASS_KG_PER_MOL as M,
  effectiveChamberResistancePaM2sPerKg,
  linearizedThermalResistancePaM2sPerKg,
  latentTemperatureSensitivityKPerWm2,
  solveWellMixedChamber,
} from '../src/manuscript-runtime/data/papers/sublimation/chamberCoupling.ts';

function near(a, b, rel = 1e-10) {
  assert(Number.isFinite(a) && Number.isFinite(b), `nonfinite: ${a}, ${b}`);
  assert(Math.abs(a-b) <= rel*Math.max(1e-10,Math.abs(a),Math.abs(b)),
    `expected ${a} to be close to ${b}`);
}
const zone = (id, saturation=180, area=0.1, rp=1e6, rh=4e5) => ({
  id, sublimationAreaM2:area,
  saturationPressureAtHeatBoundaryPa:saturation,
  productResistancePaM2sPerKg:rp,
  thermalResistancePaM2sPerKg:rh,
});
const C = 1e-5, background=10, z=zone('one');
const single = solveWellMixedChamber({
  zones:[z], sinkConductanceMolPerSecPa:C,
  backgroundVaporPressurePa:background,
});
const rch = effectiveChamberResistancePaM2sPerKg(z.sublimationAreaM2,C);
const directJ = (z.saturationPressureAtHeatBoundaryPa-background) /
  (z.productResistancePaM2sPerKg+z.thermalResistancePaM2sPerKg+rch);
near(single.zoneMassFluxesKgM2s[0], directJ);
near(single.excessPressurePa, rch*directJ);
near(single.molarBalanceResidualPerSec,0,1e-10);
assert(single.excessPressurePa>0 && single.excessPressurePa<170);
const ideal = solveWellMixedChamber({zones:[z],sinkConductanceMolPerSecPa:1e9,backgroundVaporPressurePa:background});
near(ideal.zoneMassFluxesKgM2s[0],170/1.4e6,1e-8);
const closed=solveWellMixedChamber({zones:[z],sinkConductanceMolPerSecPa:0,backgroundVaporPressurePa:background});
near(closed.zoneMassFluxesKgM2s[0],0);
near(closed.waterVaporPressurePa,180);
assert.equal(effectiveChamberResistancePaM2sPerKg(0.1,0),Infinity);

const seven=Array.from({length:7},(_,i)=>zone('shelf-'+i,100+20*i,0.095,7e5+1e5*i,3e5));
const shared = solveWellMixedChamber({zones:seven,sinkConductanceMolPerSecPa:7e-6,backgroundVaporPressurePa:12});
assert(shared.zoneMassFluxesKgM2s.every(j=>j>=0));
near(shared.molarVaporGenerationPerSec,shared.molarVaporRemovalPerSec,1e-9);
assert(shared.molarBalanceResidualPerSec<1e-10);
assert(shared.excessPressurePa>0);
const reversed=solveWellMixedChamber({zones:[...seven].reverse(),sinkConductanceMolPerSecPa:7e-6,backgroundVaporPressurePa:12});
near(shared.excessPressurePa,reversed.excessPressurePa,1e-12);
for(let i=0;i<7;i++) near(shared.zoneMassFluxesKgM2s[i],reversed.zoneMassFluxesKgM2s[6-i],1e-12);
const fastSink=solveWellMixedChamber({zones:seven,sinkConductanceMolPerSecPa:7e-5,backgroundVaporPressurePa:12});
assert(fastSink.totalMassRemovalKgPerSec > shared.totalMassRemovalKgPerSec);
assert(fastSink.excessPressurePa < shared.excessPressurePa);
const twiceHeat=solveWellMixedChamber({
  zones:seven.map(z=>({...z,thermalResistancePaM2sPerKg:z.thermalResistancePaM2sPerKg/2})),
  sinkConductanceMolPerSecPa:7e-6,backgroundVaporPressurePa:12
});
assert(twiceHeat.totalMassRemovalKgPerSec>shared.totalMassRemovalKgPerSec);
// The chamber feedback reduces the naive isolated-shelf prediction.
const uncoupled=seven.reduce((sum,z)=>sum+
  z.sublimationAreaM2*Math.max(0,z.saturationPressureAtHeatBoundaryPa-12)/
  (z.productResistancePaM2sPerKg+z.thermalResistancePaM2sPerKg),0);
assert(shared.totalMassRemovalKgPerSec<uncoupled);

const pausedZone=zone('cold',15,.1,1e6,4e5);
const heterogeneous=solveWellMixedChamber({
  zones:[z,pausedZone],sinkConductanceMolPerSecPa:C,backgroundVaporPressurePa:background
});
assert.equal(heterogeneous.zoneMassFluxesKgM2s[1],0,'common vapor backpressure deactivates cold zone');
assert(heterogeneous.zoneMassFluxesKgM2s[0]>0);
const noDrive=solveWellMixedChamber({zones:[zone('dry',5)],sinkConductanceMolPerSecPa:C,backgroundVaporPressurePa:10});
near(noDrive.totalMassRemovalKgPerSec,0);
near(noDrive.waterVaporPressurePa,10);

near(linearizedThermalResistancePaM2sPerKg(2.83e6,1,10,3),849000);
// Temperature response is amplified by condenser-limited vapor backpressure.
const dT_fixed=100*latentTemperatureSensitivityKPerWm2(2.83e6,32.8842,1e6);
const dT_limited=100*latentTemperatureSensitivityKPerWm2(2.83e6,32.8842,1e6,rch);
near(dT_limited/dT_fixed,1+rch/1e6);
assert(dT_limited>dT_fixed);
assert(100*latentTemperatureSensitivityKPerWm2(2.83e6,32.8842,1e6,rch,100)<dT_limited);
assert.throws(()=>latentTemperatureSensitivityKPerWm2(2.83e6,32.8842,1e6,-1),RangeError);
assert.throws(()=>solveWellMixedChamber({zones:[z],sinkConductanceMolPerSecPa:-1,backgroundVaporPressurePa:10}),RangeError);
assert.throws(()=>solveWellMixedChamber({zones:[],sinkConductanceMolPerSecPa:C,backgroundVaporPressurePa:10}),RangeError);
assert.throws(()=>linearizedThermalResistancePaM2sPerKg(1,1,0,1),RangeError);
assert.throws(()=>effectiveChamberResistancePaM2sPerKg(0,C),RangeError);
console.log(JSON.stringify({
  suite:'well-mixed chamber-vapor conservation',
  checks:'single-zone closed form, strong/weak/zero removal, seven-zone conservation, permutation, sink sensitivity, heat sensitivity, inactive zone, no drive, dimension, rejection',
  sevenShelfBackpressurePa:shared.excessPressurePa,
  sevenShelfMolarBalanceResidual:shared.molarBalanceResidualPerSec,
  singleZoneChamberShare:rch/(1.4e6+rch),
  fixedChamberDeltaKPer100Wm2:dT_fixed,
  removalLimitedDeltaKPer100Wm2:dT_limited,
  result:'PASS',
}));
