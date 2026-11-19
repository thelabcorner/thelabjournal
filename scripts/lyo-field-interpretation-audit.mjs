import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { sublimationPressure } from '../src/manuscript-runtime/utils/iapws-sublimation.ts';

const base = resolve('src/manuscript-runtime/data/papers/sublimation');
const read = file => readFileSync(resolve(base,file),'utf8');
const intro=read('sections/IntroductionSection.tsx');
const abstract=read('FullAbstract.tsx');
const literature=read('sections/LiteratureReviewSection.tsx');
const methodology=read('sections/MethodologySection.tsx');
const results=read('sections/ResultsSection.tsx');
const discussion=read('sections/DiscussionSection.tsx');
const conclusion=read('sections/ConclusionSection.tsx');
const nav=read('nav.ts');

function contains(text, phrase) {
  assert(text.includes(phrase), 'Expected grounded field interpretation: '+phrase);
}
contains(abstract,'sublimative cooling');
contains(abstract,'not a measured');
contains(intro,'vapor-pressure driving potential');
contains(intro,'sublimative cooling');
contains(intro,'without additional heater input');
contains(literature,'hrpatent2016');
contains(literature,'hrpatent2022');
contains(literature,'hansen1992tcgauge');
assert(!literature.includes('45%</td>'), 'Unsupported Ganguly percentages cannot return');
assert(!literature.includes('Data source clarification'));
contains(methodology,'not a mass-removal rate');
contains(results,'Harvest Right v5.5.25');
contains(results,'Blue Alpine v3.3.4');
contains(literature,'GangulyExperimentalEvidenceFigure');
contains(literature,'16 monitored vials');
contains(literature,'radiative contribution is');
contains(literature,'growing denominator');
const gangulyFigure=read('figures/GangulyExperimentalEvidenceFigure.tsx');
const gangulySource=read('figures/gangulyFigureData.ts');
contains(gangulySource,'GANGULY_2010_FIG_13_RADIATION_W_M2 = 2666');
contains(gangulySource,'GANGULY_2014_FIG_2_1');
contains(gangulySource,'GANGULY_2010_FIG_14');
contains(gangulyFigure,'q_{\\mathrm{rad}}\\approx\\mathrm{constant}');
contains(gangulyFigure,'f_{\\mathrm{rad}}=\\frac{q_{\\mathrm{rad}}}{q_{\\mathrm{total}}}');
contains(gangulyFigure,"Ganguly (2014), Figure 2.1");
contains(gangulyFigure,'2010 Figure 13');
const qDirectAt10=21.2*10+3200;
const qDirectAt100=21.2*100+3200;
assert.equal(qDirectAt10,3412);
assert.equal(qDirectAt100,5320);
assert(Math.abs(100*2666/qDirectAt10-78.14)<0.02);
assert(Math.abs(100*2666/qDirectAt100-50.11)<0.02);
assert(!results.includes('Existing (Temp-PID)'), 'Do not claim unverified firmware');
assert(!results.includes('150°F gapped source'), 'Do not present unverified high-heat settings');
assert(!results.includes('Stefan-diffusion bounding model shifts'), 'Do not prescribe mixture');
contains(results,'500 mTorr');
contains(results,'−20°C');
contains(results,'−40°C');
contains(results,'524 mTorr');
contains(results,'sublimative cooling');
contains(discussion,'stable chamber-pressure reading');
contains(discussion,'slowest verified');
contains(conclusion,'not a universal objective');
contains(nav,'4. Interpreting Operating Behavior');
assert(!/\b(?:Thesis 1|Thesis 2|Thesis 3)\b/.test(abstract+literature+methodology+results+discussion+conclusion),
  'The field paper should not be organized as formal theses');

const PA_PER_TORR=101325/760;
const mtorr=C=>sublimationPressure(C+273.15).p_Pa*1000/PA_PER_TORR;
const minus20=mtorr(-20);
const minus40=mtorr(-40);
const pv=250;
const potential20=minus20-pv, potential40=minus40-pv;
assert(Math.abs(minus20-774.4)<0.1, 'Ice pressure -20C: '+minus20);
assert(Math.abs(minus40-96.3)<0.1, 'Ice pressure -40C: '+minus40);
assert(Math.abs(potential20-524.4)<0.1 && potential20>0);
assert(potential40<0);
for (const c of [-40,-30,-20,-10,-7]) {
  const value=mtorr(c);
  const rounded=value.toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
  const ceiling=(2*value).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
  assert(results.includes('>'+rounded+'</td>'), 'Incorrect ice pressure for '+c+' Celsius: '+rounded);
  assert(results.includes('>'+ceiling+'</td>'), 'Incorrect modeled 50% vapor fraction ceiling for '+c+' Celsius: '+ceiling);
}
for (const stale of ['>93.8</td>','>765.4</td>','>1,938.6</td>']) {
  assert(!results.includes(stale), 'Stale thermodynamic value: '+stale);
}
console.log(JSON.stringify({
  suite:'Applied field interpretation',
  example:{totalMTorr:500,waterPartialMTorr:pv,iceMinus20MTorr:minus20,
    potentialMinus20MTorr:potential20,iceMinus40MTorr:minus40,
    potentialMinus40MTorr:potential40},
  assertions:'passed'
}));
