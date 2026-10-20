import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const origin=process.env.JOURNAL_ORIGIN ?? 'http://127.0.0.1:11264/';
const url=new URL('research/low-temp-lyophilization-three-theses/',origin).href;
const browser=await chromium.launch({
  executablePath:process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless:true,args:['--no-sandbox']
});
let count=0;
try {
  for(const width of [320,390,1440]){
    for(const theme of ['light','dark']){
      const page=await browser.newPage({viewport:{width,height:880},reducedMotion:'reduce',serviceWorkers:'block'});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(t=>localStorage.setItem('thelabcorner.journal.preferences.v2',JSON.stringify({theme:t})),theme);
      try{
        await page.goto(url,{waitUntil:'domcontentloaded'});
        await page.locator('#methodology-vapor-removal').waitFor();
        assert.equal(await page.locator('.research-body .math-block').count(),23);
        assert.equal(await page.locator('.math-block__view-toggle').count(),23);
        assert.equal(await page.locator('#methodology-vapor-removal').count(),1);
        const gaugeParagraphs=page.locator('#literature-instrumentation p');
        assert.equal(await gaugeParagraphs.count(), 4, 'Gauges should be explained as four coherent paragraphs without duplicate callouts');
        const gaugeText=await page.locator('#literature-instrumentation').innerText();
        assert(!/Consequence for control:|P_apparent|P_total/.test(gaugeText), 'No editorial lead-ins or raw pressure variables');
        assert((await page.locator('#literature-instrumentation .katex').count())>=3, 'Gauge pressure variables render with KaTeX');
        assert.equal(await page.locator('#methodology-assumptions').count(),1);
        const bellJar = page.locator('#literature-instrumentation a[href="https://www.belljar.net/tcgauge.htm"]');
        assert.equal(await bellJar.count(), 1, 'Bell Jar source link in vacuum gauge section');
        assert.match(await bellJar.textContent(), /Building a Thermocouple Vacuum Gauge/);
        assert.equal(await page.locator('#ref-hansen1992tcgauge').count(), 1, 'Bell Jar bibliography entry');
        assert.equal(
          await page.locator('#ref-hansen1992tcgauge a[href="https://www.belljar.net/tcgauge.htm"]').count(),
          1,
          'Bell Jar bibliography URL'
        );
        for(const label of ['3.11','3.12','3.13']){
          const block=page.locator('figure.math-block').filter({hasText:`(${label})`});
          assert.equal(await block.count(),1,`missing displayed equation ${label}`);
          await block.locator('.math-block__view-toggle').click();
          await page.waitForFunction(value=>{
            const nodes=[...document.querySelectorAll('figure.math-block')];
            const el=nodes.find(n=>n.querySelector('.math-block__eyebrow')?.textContent?.includes(`(${value})`));
            const renderer=el?.querySelector('diffs-container');
            const shadow=renderer?.shadowRoot;
            return el?.getAttribute('data-equation-view')==='python'
              && (shadow?.querySelectorAll('[data-line]')?.length ?? 0)>0
              && shadow?.querySelector('code')?.textContent?.includes('sympy');
          },label,{timeout:12000});
          const result=await block.evaluate(el=>{
            const host=el.querySelector('diffs-container');
            return {
              height:host.getBoundingClientRect().height,
              colorScheme:getComputedStyle(host).colorScheme,
              lineCount:host.shadowRoot.querySelectorAll('[data-line]').length,
              highlighted:host.shadowRoot.querySelectorAll('[data-line] span').length,
            };
          });
          assert(result.height>20 && result.lineCount>=4 && result.highlighted>0);
          assert.equal(result.colorScheme,theme);
          await block.locator('.math-block__view-toggle').click();
          assert.equal(await block.getAttribute('data-equation-view'),'math');
        }
        const dims=await page.evaluate(()=>({
          overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
          theme:document.documentElement.dataset.theme,
          mathError:[...document.querySelectorAll('.katex-error')].length,
        }));
        assert(dims.overflow<=1,`document overflow: ${dims.overflow}`);
        assert.equal(dims.theme,theme);
        assert.equal(dims.mathError,0,'KaTeX parse errors');
        assert.deepEqual(errors,[]);
        count++;
        console.log(JSON.stringify({width,theme,equations:23,coupledPythonViews:3,firstToggle:'PASS'}));
      } finally {await page.close();}
    }
  }
} finally {await browser.close();}
assert.equal(count,6);
console.log('Lyophilization coupling browser checks: 6 scenarios PASS');
