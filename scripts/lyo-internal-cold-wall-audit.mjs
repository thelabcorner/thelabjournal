import assert from 'node:assert/strict';
import {
  solveInternalColdWallChamber,
  WATER_MOLAR_MASS_KG_PER_MOL as M,
} from '../src/manuscript-runtime/data/papers/sublimation/chamberCoupling.ts';

function near(actual, expected, rel=1e-9) {
  assert(Number.isFinite(actual) && Number.isFinite(expected));
  assert(Math.abs(actual-expected) <= Math.max(1e-15,rel * Math.max(Math.abs(actual),Math.abs(expected))),
    `expected ${actual} approximately ${expected}`);
}
const zone = (id, psat=160, area=.1, rp=1e6, rh=4e5) => ({
  id, sublimationAreaM2:area, saturationPressureAtHeatBoundaryPa:psat,
  productResistancePaM2sPerKg:rp, thermalResistancePaM2sPerKg:rh,
});
const one = zone('wet');
const solve = (overrides={}) => solveInternalColdWallChamber({
  zones:[one],
  wallDepositionConductanceMolPerSecPa:1e-5,
  wallIceSaturationPressurePa:20,
  pumpWaterVaporConductanceMolPerSecPa:0,
  ...overrides,
});

// No vapor crosses an external condenser duct. Product loss becomes wall ice.
const wallOnly=solve();
near(wallOnly.productWaterLossKgPerSec,wallOnly.wallIceGainKgPerSec);
near(wallOnly.externallyPumpedWaterKgPerSec,0);
near(wallOnly.molarBalanceResidualPerSec,0);
assert(wallOnly.waterVaporPressurePa>20 && wallOnly.waterVaporPressurePa<160);

// Closed-form one-zone transfer: Rp+Rh plus equivalent wall resistance.
const rwall=.1/(M*1e-5);
const expectedJ=(160-20)/(1e6+4e5+rwall);
near(wallOnly.zoneMassFluxesKgM2s[0],expectedJ);
near(wallOnly.waterVaporPressurePa,20+rwall*expectedJ);

// Cold-wall deposition directly lowers gas-phase pressure, not NCG pressure.
const colder=solve({wallIceSaturationPressurePa:5});
const warmer=solve({wallIceSaturationPressurePa:60});
assert(colder.waterVaporPressurePa < wallOnly.waterVaporPressurePa);
assert(warmer.waterVaporPressurePa > wallOnly.waterVaporPressurePa);
assert(colder.productWaterLossKgPerSec > warmer.productWaterLossKgPerSec);

// Wall accumulation is a distinct conservation pathway from pump exhaust.
const mixed=solve({pumpWaterVaporConductanceMolPerSecPa:2e-6});
near(mixed.productWaterLossKgPerSec,
  mixed.wallIceGainKgPerSec+mixed.externallyPumpedWaterKgPerSec);
assert(mixed.wallIceGainKgPerSec>0 && mixed.externallyPumpedWaterKgPerSec>0);
near(mixed.molarBalanceResidualPerSec,0);
assert(mixed.waterVaporPressurePa<wallOnly.waterVaporPressurePa);

// When wall is warmer than vapor's saturation state, pump is the only sink.
const warmWall=solve({
  wallIceSaturationPressurePa:300,
  pumpWaterVaporConductanceMolPerSecPa:3e-6,
});
near(warmWall.wallIceGainKgPerSec,0);
near(warmWall.productWaterLossKgPerSec,warmWall.externallyPumpedWaterKgPerSec);
assert(warmWall.waterVaporPressurePa < 160);

// With no sink, steady gas pressure builds until net sublimation stops.
const sealed=solve({
  wallDepositionConductanceMolPerSecPa:0,
  pumpWaterVaporConductanceMolPerSecPa:0,
});
near(sealed.productWaterLossKgPerSec,0);
near(sealed.waterVaporPressurePa,160);

// Seven shelves share vapor pressure, but capture is on one common chamber wall.
const seven=Array.from({length:7},(_,i)=>zone(`zone-${i}`,110+i*12,.09,8e5+1e5*i,3e5));
const shared=solve({zones:seven,pumpWaterVaporConductanceMolPerSecPa:1e-6});
near(shared.productWaterLossKgPerSec,shared.wallIceGainKgPerSec+shared.externallyPumpedWaterKgPerSec);
near(shared.molarBalanceResidualPerSec,0);
assert(shared.zoneMassFluxesKgM2s.every(f=>f>=0));
const reversed=solve({zones:[...seven].reverse(),pumpWaterVaporConductanceMolPerSecPa:1e-6});
near(reversed.waterVaporPressurePa,shared.waterVaporPressurePa);
shared.zoneMassFluxesKgM2s.forEach((flux,i)=>near(flux,reversed.zoneMassFluxesKgM2s[6-i]));

assert.throws(()=>solve({wallDepositionConductanceMolPerSecPa:-1}),RangeError);
assert.throws(()=>solve({wallIceSaturationPressurePa:-1}),RangeError);
assert.throws(()=>solve({pumpWaterVaporConductanceMolPerSecPa:-1}),RangeError);
assert.throws(()=>solve({zones:[]}),RangeError);

console.log(JSON.stringify({
  suite:'single chamber, internal cold-wall deposition, separate pump exhaust',
  checks:'wall-only capture, independent pump sink, analytical one-zone limit, cold-wall temperature sensitivity, warm-wall cutoff, closed chamber, 7-zone conservation, permutation, input rejection',
  wallOnlyWaterPressurePa:wallOnly.waterVaporPressurePa,
  wallOnlyInternalIceFraction:wallOnly.wallIceGainKgPerSec/wallOnly.productWaterLossKgPerSec,
  mixedInternalIceFraction:mixed.wallIceGainKgPerSec/mixed.productWaterLossKgPerSec,
  sevenZoneResidualMolPerSec:shared.molarBalanceResidualPerSec,
  result:'PASS'
}));
