import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  GANGULY_2010_FIG_13_FITS,
  GANGULY_2010_FIG_13_RADIATION_W_M2,
  GANGULY_2010_FIG_14,
  GANGULY_2014_FIG_2_1,
  fittedTotalHeatFlux,
} from '../src/manuscript-runtime/data/papers/sublimation/figures/gangulyFigureData.ts';
import {
  SATURATING_PARAMS, kgSaturating, kSaturating, boundedPStarSeries,
} from '../src/manuscript-runtime/data/papers/sublimation/pressureModel.ts';

const path = f => resolve('src/manuscript-runtime/data/papers/sublimation', f);
const read = f => readFileSync(path(f), 'utf8');
const eq = (a, b, tolerance = 1e-9) => assert(Math.abs(a - b) <= tolerance, `Expected ${a} ~ ${b}`);

assert.equal(GANGULY_2014_FIG_2_1.length, 20);
assert.equal(GANGULY_2010_FIG_14.length, 16);
assert.equal(GANGULY_2010_FIG_13_FITS.length, 4);
for (const [source, rows, pressures] of [
  ['2014', GANGULY_2014_FIG_2_1, [10, 20, 60, 100, 200]],
  ['2010', GANGULY_2010_FIG_14, [10, 40, 100, 200]],
]) {
  const unique = new Set();
  for (const r of rows) {
    const sum = r.radiation + r.contact + r.gas + r.flow;
    assert(sum >= 99 && sum <= 101, `${source} pie subtotal ${sum}`);
    assert(pressures.includes(r.pressure), `${source} pressure outside transcription`);
    unique.add(r.configuration + '/' + r.pressure);
  }
  assert.equal(unique.size, rows.length, 'No duplicate geometry/pressure rows');
  assert.equal(new Set(rows.map(x => x.configuration)).size, 4);
}
const contact = p => GANGULY_2014_FIG_2_1.find(x => x.configuration === 'Direct contact' && x.pressure === p);
assert.deepEqual([contact(10)?.radiation, contact(10)?.gas, contact(10)?.flow], [69, 5, 8]);
assert.deepEqual([contact(100)?.radiation, contact(100)?.gas, contact(100)?.flow], [45, 19, 25]);
assert.deepEqual([contact(200)?.radiation, contact(200)?.gas, contact(200)?.flow], [43, 26, 20]);
assert.equal(GANGULY_2010_FIG_13_RADIATION_W_M2, 2666);
assert.deepEqual(GANGULY_2010_FIG_13_FITS.map(r => r.slope), [21.2, 13.8, 10.5, 7.8]);
assert.deepEqual(GANGULY_2010_FIG_13_FITS.map(r => r.intercept), [3200, 2600, 2700, 2700]);
const fit = GANGULY_2010_FIG_13_FITS[0];
assert.equal(fittedTotalHeatFlux(fit, 10), 3412);
assert.equal(fittedTotalHeatFlux(fit, 100), 5320);
const relativeAt = p => GANGULY_2010_FIG_13_RADIATION_W_M2 / fittedTotalHeatFlux(fit,p);
assert(relativeAt(100) < relativeAt(10));
eq(relativeAt(10) * fittedTotalHeatFlux(fit,10), 2666);
eq(relativeAt(100) * fittedTotalHeatFlux(fit,100), 2666);
assert(relativeAt(10) > 0.78 && relativeAt(100) < 0.51);

for(const p of [10, 20, 50, 100, 200, 500, 1000, 1500]) {
  eq(kSaturating(p), SATURATING_PARAMS.kc + SATURATING_PARAMS.kr + kgSaturating(p));
  assert(kgSaturating(p) > 0 && kgSaturating(p) < SATURATING_PARAMS.c2);
  eq(SATURATING_PARAMS.kr, 2);
}
assert(2 / kSaturating(1500) < 2 / kSaturating(10), 'Radiation percentage must fall with larger total');
for (const eta of [0, .25, 1, 3, 5, 10]) {
  const p = boundedPStarSeries(774.356398, .5, eta, 50, 1500);
  assert(Number.isFinite(p) && p >= 50 && p <= 1500);
}

const modelFigure = read('figures/FluxContributorsChart.tsx');
const gangulyFigure = read('figures/GangulyExperimentalEvidenceFigure.tsx');
const pressureFigure = read('figures/PressureTransferChart.tsx');
const controllerFigure = read('figures/PressureTemperatureControlFigure.tsx');
const processFigure = read('LyophilizationPathFigure.tsx');
const results = read('sections/ResultsSection.tsx');

assert(modelFigure.includes('SATURATING_PARAMS'));
assert(modelFigure.includes('K<sub>radiation</sub>') || modelFigure.includes('radiation.toFixed'));
assert(!modelFigure.includes('RECONSTRUCTED_GANGULY_'), 'No stale assumed percentage anchors');
assert(gangulyFigure.includes('GANGULY_2014_FIG_2_1'));
assert(gangulyFigure.includes('GANGULY_2010_FIG_14'));
assert(gangulyFigure.includes('GANGULY_2010_FIG_13_RADIATION_W_M2'));
assert(gangulyFigure.includes('f_{\\mathrm{rad}}=\\frac{q_{\\mathrm{rad}}}{q_{\\mathrm{total}}}'));
assert(pressureFigure.includes('pIce-fH2O*pressure'), 'Vapor potential plot must preserve sign');
assert(!pressureFigure.includes('yAxisIndex: 1'), 'No deceptive dual-axis overlay');
assert(pressureFigure.includes('<PressureTransferTable tempF={tempF} fH2O={fH2O} eta={eta} />'));
assert(pressureFigure.includes('aria-pressed={active===key}'));
assert(read('figures/FluxContributorsChart.tsx').includes('xScale="log"'));
assert(!results.includes('<PressureTransferTable />'), 'No duplicate independent table controls');
assert(controllerFigure.includes('Harvest Right v5.5.25') || controllerFigure.includes('v5.5.25'));
assert(controllerFigure.includes('Blue Alpine'));
assert(processFigure.includes('Cold-wall deposition') && processFigure.includes('Vacuum-pump exhaust'), 'Both removal paths must be visible');
assert(processFigure.includes('lyo-loop-return'), 'Feedback return must remain explicit');
assert(processFigure.includes('lyo-loop-feedback'), 'Conditional stall section required');
assert(processFigure.includes('P=p_{\\mathrm{H_2O}}+p_{\\mathrm{NCG}}'), 'Partial-pressure distinction required');
assert(processFigure.includes('\\dot n_{\\mathrm{wall}}') && processFigure.includes('\\dot n_{\\mathrm{pump},w}'), 'Water-vapor source/sink balance required');
console.log(JSON.stringify({
  suite:'Lyophilization scientific figure provenance',
  conditions:{ Ganguly2014:20, Ganguly2010:16, heatFluxFits:4 },
  radiation:{
    absoluteReferenceWm2:2666,
    absoluteChangeWm2:0,
    normalizedPercentAt10:+(100*relativeAt(10)).toFixed(2),
    normalizedPercentAt100:+(100*relativeAt(100)).toFixed(2),
  },
  tests:'passed',
}));
