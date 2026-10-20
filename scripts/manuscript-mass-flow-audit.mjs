import assert from 'node:assert/strict';
import {readFileSync,mkdirSync} from 'node:fs';
import {chromium} from 'playwright-core';

const root='src/manuscript-runtime/data/papers/gravimetric-decarboxylation/';
const body=readFileSync(root+'index.tsx','utf8');
const nav=readFileSync(root+'nav.ts','utf8');
const references=readFileSync(root+'references.ts','utf8');
assert(body.includes('In the documented V3 procedure, each interval reading is the total mass of the vessel and its contents.'));
assert(body.includes('The balance is zeroed without applying the vessel tare'));
assert(!body.includes('Ex situ weighing requires consistent cooling'));
assert(!body.includes('Repeated removal for weighing disrupts'));
assert(!body.includes('Cooling or transferring the sample is not a prescribed measurement step'));
const samplingNote=body.match(/<Sub id="manual-limitations" n="2\.4"[^>]+\/>\s*<ScientificParagraph className=\{prose\}>([^<]+)<\/ScientificParagraph>/)?.[1];
assert(samplingNote, 'Section 2.4 sampling note missing');
assert(samplingNote.includes('More frequent, regularly spaced mass readings'));
assert(samplingNote.includes('cooling can alter reaction kinetics'));
assert(samplingNote.includes('without compromising safety'));
assert(samplingNote.includes('Decarboxulator accepts the empty-vessel mass separately'));
assert(samplingNote.includes('balance tare that may reset'));
assert(samplingNote.split(/\s+/).length <= 90, 'Section 2.4 should remain a compact note');
assert(nav.includes("label:'2.4 Sampling Cadence'"));
assert(references.includes('/blob/decarboxulator/pages/progress-tracker.html'));
const chapters=['motivation','manual','model','heat','automation','volume','validation','limitations','implementation'];
const sourceChapters=[...body.matchAll(/<Chapter id="([^"]+)" n="(\d+)"/g)].map(m=>({id:m[1],number:+m[2]}));
const navChapters=[...nav.matchAll(/\{id:'([^']+)',label:'(\d+)\. [^']+',level:'chapter'/g)].map(m=>({id:m[1],number:+m[2]}));
assert.deepEqual(sourceChapters,chapters.map((id,i)=>({id,number:i+1})));
assert.deepEqual(navChapters,sourceChapters);
const equations=[...body.matchAll(/<MathBlock[^>]*\blabel="\((\d+)\)"/g)].map(m=>+m[1]);
assert.deepEqual(equations,Array.from({length:28},(_,i)=>i+1));
const subsections=[...nav.matchAll(/\{id:'([^']+)',label:'(\d+)\.(\d+) [^']+',level:'section'/g)];
assert(subsections.length>35);
for(const m of subsections){
  const found=body.match(new RegExp('<Sub id="'+m[1]+'" n="([0-9.]+)"'));
  assert.equal(found?.[1],m[2]+'.'+m[3],'navigation numbering mismatch '+m[1]);
}
assert(body.indexOf('<Chapter id="volume"')>body.indexOf('<Chapter id="automation"'));
assert(body.indexOf('id="volume-collection"')<body.indexOf('id="volume-pulses"'));
assert(body.includes('vacuum improves gas attribution rather than the pressure sensor'));
assert(body.includes('An initial vacuum is particularly useful for vent accounting.'));
console.log('Static order, equation sequence, subsection navigation, and vacuum text passed.');

const origin=process.env.JOURNAL_ORIGIN??'http://127.0.0.1:11264/';
const url=new URL('research/gravimetric-decarboxylation-co2-progress/',origin).href;
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
mkdirSync('artifacts/manuscript-mass-flow',{recursive:true});
let passed=0;
try{
  for(const width of [320,390,768,1440]){
    for(const theme of ['light','dark']){
      const page=await browser.newPage({viewport:{width,height:840},reducedMotion:'reduce',serviceWorkers:'block'});
      const failures=[];
      page.on('pageerror',e=>failures.push(e.message));
      try{
        await page.addInitScript(t=>localStorage.setItem('thelabcorner.journal.preferences.v2',JSON.stringify({theme:t})),theme);
        await page.goto(url,{waitUntil:'domcontentloaded'});
        await page.locator('.research-mass-pipeline-steps li').last().waitFor();
        const state=await page.evaluate(()=>{
          const all=s=>[...document.querySelectorAll(s)];
          const rect=document.querySelector('.research-mass-pipeline').getBoundingClientRect();
          const pMath=all('.research-body .prose-heading p .katex-inline');
          return {
            scrollWidth:document.documentElement.scrollWidth,
            rect:{left:rect.left,right:rect.right},
            chapterIds:all('.research-body section.prose-heading[id]').map(el=>el.id),
            stages:all('.research-mass-pipeline-steps > li').length,
            captions:all('.research-body .research-scientific-figure figcaption').map(el=>Number(el.textContent.match(/^Figure (\d+)\./)?.[1])).filter(Boolean),
            equations:all('.research-body .math-block').length,
            variables:all('.research-variable-badge').length,
            sub:!!document.querySelector('.research-variable-badge[aria-label="r_eff"] sub'),
            thermal:!!document.querySelector('.research-variable-badge[aria-label="T_0"] sub'),
            formula:!!document.querySelector('.research-chemical-formula[aria-label="CO2"] sub'),
            katexStyled:pMath.length>0&&parseFloat(getComputedStyle(pMath[0]).borderTopWidth)>=1,
            abstract:document.querySelector('#abstract .research-abstract-card')?.textContent
          };
        });
        assert.deepEqual(state.chapterIds.filter(id=>chapters.includes(id)),chapters);
        assert.deepEqual(state.captions,[1,2,3,4,5]);
        assert.equal(state.stages,5);
        assert(state.equations>=28);
        assert(state.variables>=25);
        assert(state.sub&&state.thermal&&state.formula&&state.katexStyled);
        assert(state.rect.left>=-1&&state.rect.right<=width+1);
        assert(state.scrollWidth<=width+1,'horizontal page overflow');
        assert.match(state.abstract,/formal publication of Decarboxulator/);
        assert.deepEqual(failures,[]);
        if(width===390||width===1440){
          await page.locator('.research-mass-pipeline').screenshot({path:'artifacts/manuscript-mass-flow/mass-'+width+'-'+theme+'.png'});
        }
        passed++;
        console.log(JSON.stringify({width,theme,stages:state.stages,figures:state.captions,equations:state.equations,variables:state.variables,passed:true}));
      }finally{await page.close();}
    }
  }
}finally{await browser.close();}
assert.equal(passed,8);
console.log('8 browser/document-layout checks passed.');