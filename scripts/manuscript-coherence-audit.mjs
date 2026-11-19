import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { chromium } from 'playwright-core';
const dir='src/manuscript-runtime/data/papers/gravimetric-decarboxylation/';
const source=readFileSync(dir+'index.tsx','utf8');
const nav=readFileSync(dir+'nav.ts','utf8');
const entry=readFileSync(dir+'entry.ts','utf8');
const refs=readFileSync(dir+'references.ts','utf8');
const chapters=[...source.matchAll(/<Chapter id="([^"]+)" n="(\d+)"/g)].map(x=>x[1]);
assert.deepEqual(chapters,['motivation','manual','model','heat','automation','volume','validation','limitations','implementation']);
assert(!source.includes('<Sub id="model-enzymatic" n="3.6"'));
assert(source.includes('<Sub id="model-enzymatic" n="8.4"'));
assert(source.indexOf('<Sub id="model-enzymatic"')>source.indexOf('<Chapter id="limitations"'));
assert(source.indexOf('<Sub id="model-enzymatic"')<source.indexOf('<Chapter id="implementation"'));
assert(nav.includes("label:'8.4 Enzymatic Systems'"));
assert(nav.includes("label:'1.2 Measurement Scope'"));
assert(!nav.includes('3.6 Enzyme-Catalyzed'));
assert(!source.includes('Section 3.6'));
assert(source.includes('an incubated gravimetric bioreactor'));
assert(entry.includes('subject to different gas-transfer, dissolved-carbon, and measurement-boundary conditions'));
assert(source.includes('Two load paths are considered:'));
assert(source.includes('Manual stoichiometric tracking and pressure-inventory calculation exist in V4'));
const eq=[...source.matchAll(/<MathBlock[^>]*\blabel="\((\d+)\)"/g)].map(x=>+x[1]);
assert.deepEqual(eq,Array.from({length:28},(_,i)=>i+1));
const ids=[...nav.matchAll(/\{id:'([^']+)',label:'\d+\.\d+ [^']+',level:'section'/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length);
for(const id of ids) assert(source.includes('<Sub id="'+id+'"'),'Missing manuscript anchor '+id);
for(const cited of source.matchAll(/<InlineCite refs=\{\[([^\]]+)\]\}/g)){
  for(const name of cited[1].match(/'[^']+'/g)??[]){
    assert(refs.includes('id:'+name),'Missing source reference '+name);
  }
}
console.log('Source chapters, TOC, reference IDs, 28 numbered equations, and thermal content passed.');
const origin=process.env.JOURNAL_ORIGIN??'http://127.0.0.1:11364/';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
let passed=0;
try {
 for(const width of [320,390,1440]){
  for(const theme of ['light','dark']){
   const page=await browser.newPage({viewport:{width,height:840},reducedMotion:'reduce',serviceWorkers:'block'});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   try {
    await page.addInitScript(t=>localStorage.setItem('thelabcorner.journal.preferences.v2',JSON.stringify({theme:t})),theme);
    await page.goto(new URL('research/gravimetric-decarboxylation-co2-progress/',origin).href,{waitUntil:'domcontentloaded'});
    await page.locator('#model-enzymatic').waitFor();
    const state=await page.evaluate(()=>{
      const heading=document.querySelector('#model-enzymatic');
      const discussion=document.querySelector('#limitations');
      const model=document.querySelector('#model');
      const text=document.querySelector('.research-body')?.textContent??'';
      return {overflow:document.documentElement.scrollWidth-innerWidth,
        count:document.querySelectorAll('#model-enzymatic').length,
        inDiscussion:!!(heading&&discussion?.contains(heading)),
        inModel:!!(heading&&model?.contains(heading)),
        examples:!!(discussion?.textContent?.includes('Glutamate decarboxylase')&&discussion?.textContent?.includes('Pyruvate decarboxylase')),
        bioreactor:text.includes('incubated gravimetric bioreactor'),
        thermal:text.includes('Heater geometry and the weighing load path')&&text.includes('Control states and faults'),
        mathErrors:discussion?.querySelectorAll('.katex-error').length??0};
    });
    assert(state.overflow<=1,'Page overflow '+width+' '+theme+': '+state.overflow);
    assert.equal(state.count,1);
    assert(state.inDiscussion&&!state.inModel);
    assert(state.examples&&state.bioreactor&&state.thermal);
    assert.equal(state.mathErrors,0,'Discussion math errors at '+width+' '+theme);
    assert.deepEqual(errors,[]);
    passed++;
    console.log(JSON.stringify({width,theme,overflow:state.overflow,inDiscussion:state.inDiscussion,mathErrors:state.mathErrors,passed:true}));
   } finally {await page.close();}
  }
 }
} finally {await browser.close();}
assert.equal(passed,6);
console.log('6/6 manuscript coherence browser scenarios passed.');
