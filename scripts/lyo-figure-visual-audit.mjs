import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';

const base = process.env.LYO_BASE_URL || 'http://127.0.0.1:4137';
const chrome = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const route = '/research/low-temp-lyophilization-three-theses/';
const figures = [
  'lyo-process-figure', 'lyo-gas-analogy', 'lyo-evidence-figure',
  'lyo-controller-figure', 'lyo-model-transfer', 'lyo-pressure-explorer',
  'lyo-window-figure',
];
const browser = await chromium.launch({
  executablePath:chrome,headless:true,args:['--no-sandbox'],
});
const results = [];
let failed = false;
try {
  for (const width of [320,360,390,430,768,1280]) {
    const page = await browser.newPage({
      viewport:{width,height:844},hasTouch:width<=430,
      deviceScaleFactor:1,
    });
    const errors = [];
    page.on('pageerror',err=>errors.push(err.message));
    page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text())});
    try {
      await page.goto(base+route,{waitUntil:'networkidle',timeout:30000});
      const widths = [];
      for (const name of figures) {
        const item=page.locator('.'+name);
        assert.equal(await item.count(),1,'Missing '+name);
        await item.scrollIntoViewIfNeeded();
        assert(await item.isVisible(),'Invisible '+name);
        widths.push(await item.evaluate(el=>el.getBoundingClientRect().width));
      }
      const process = page.locator('.lyo-loop-figure');
      assert.equal(await process.locator('.lyo-loop-row').count(), 3, 'Thermal, vapor and inventory stages required');
      assert.equal(await process.locator('.lyo-loop-sink').count(), 2, 'Two distinct gas-removal pathways');
      assert.equal(await process.locator('.lyo-loop-cycle-row').count(), 4, 'Four-step return loop');
      assert.equal(await process.locator('.lyo-loop-return').count(), 1, 'Visible recursive return');
      assert.equal(await process.locator('.lyo-loop-threshold .katex').count(), 1, 'Source-removal inequality must render');
      assert.equal(await process.locator('.lyo-loop-chip').count(), 4, 'Neutral WebSeal-style chips');
      assert.equal(await process.locator('[class*=eyebrow]').count(), 0, 'No eyebrow decoration in the figure');
      const zincContract = await process.evaluate(el => {
        const chip = el.querySelector('.lyo-loop-chip');
        const panel = el.querySelector('.lyo-loop-panel');
        const head = el.querySelector('.lyo-loop-panel-head strong');
        return {
          chipHeight: chip.getBoundingClientRect().height,
          chipBorder: getComputedStyle(chip).borderLeftWidth,
          panelBorder: getComputedStyle(panel).borderLeftWidth,
          caseStyle: getComputedStyle(head).textTransform,
          tracking: getComputedStyle(head).letterSpacing,
        };
      });
      assert.equal(zincContract.chipHeight, 18, 'WebSeal chip height');
      assert.equal(zincContract.chipBorder, '0px', 'Chips use fill, not outlines');
      assert.equal(zincContract.panelBorder, '1px', 'Panels use zinc hairlines');
      assert.equal(zincContract.caseStyle, 'none', 'Sentence-case panel titles');
      const processWidths = await process.evaluate(el => ({
        main: el.querySelector('.lyo-loop-layout').getBoundingClientRect().width,
        feedback: el.querySelector('.lyo-loop-feedback').getBoundingClientRect().width,
        sinks: [...el.querySelectorAll('.lyo-loop-sink')].map(x => x.getBoundingClientRect().width),
        layout: getComputedStyle(el.querySelector('.lyo-loop-layout')).gridTemplateColumns.split(' ').length,
        scroll: el.scrollWidth,
        client: el.clientWidth,
      }));
      assert(processWidths.scroll <= processWidths.client + 1, 'Abstract figure overflows horizontally');
      assert(processWidths.feedback >= 220, 'Feedback loop too narrow to read');
      assert(processWidths.sinks.every(w => w >= 90), 'Gas-removal labels too narrow');
      assert(processWidths.layout === 1 || processWidths.layout === 2, 'Valid container-driven layout');
      const chartLocators = [
        '.lyo-evidence-figure .lyo-mini-science-plot > svg',
        '.lyo-model-transfer .lyo-mini-science-plot > svg',
        '.lyo-window-figure .lyo-mini-science-plot > svg',
      ];
      for (const selector of chartLocators) {
        const element=page.locator(selector);
        assert.equal(await element.count(),1, 'Missing full-width chart '+selector);
        const bounds=await element.boundingBox();
        assert(bounds && bounds.width >= 245, 'Mobile chart too narrow '+selector+' '+bounds?.width);
        assert(bounds.height >= 175,'Chart too short '+selector);
      }
      assert.equal(await page.locator('.lyo-pressure-explorer .lyo-mini-science-plot > svg').count(),3);
      assert.equal(await page.locator('.lyo-evidence-figure .lyo-evidence-plot-scroll').count(),0,'Legacy 720px pan-plot remains');
      assert.equal(await page.locator('.lyo-model-transfer canvas').count(),0,'Legacy Canvas remains');
      assert.equal(await page.locator('input[type=range]').count(),6);
      const viewport=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
      assert(viewport.scroll<=viewport.width+1,'Horizontal overflow '+JSON.stringify(viewport));
      await page.locator('.lyo-evidence-source-table > summary').click();
      assert.equal(await page.locator('.lyo-evidence-source-table tbody tr').count(),36);
      await page.locator('.lyo-mobile-data-disclosure > summary').click();
      assert.equal(await page.locator('.lyo-mobile-data-disclosure tbody tr').count(),10);
      if(width<740) {
        const cards = await page.evaluate(() => {
          const row=document.querySelector('.lyo-mobile-data-disclosure tbody tr');
          const source=document.querySelector('.lyo-evidence-dataset tbody tr');
          const td=document.querySelector('.lyo-mobile-data-disclosure tbody td');
          return {row:getComputedStyle(row).display,source:getComputedStyle(source).display,
            cell:getComputedStyle(td).display,label:td.getAttribute('data-label')};
        });
        assert.equal(cards.row,'block','Table rows need full-width mobile card format');
        assert.equal(cards.source,'block','Published source rows need full-width mobile cards');
        assert.equal(cards.cell,'flex','Mobile numeric values need inline descriptive labels');
        assert.equal(cards.label,'Pressure (mTorr)');
      }
      const isCompact=width<740;
      const visiblePanels=await page.locator('.lyo-pressure-panel:visible').count();
      const visibleController=await page.locator('.lyo-control-lane:visible').count();
      assert.equal(visiblePanels,isCompact?1:3,'Pressure panels must be one on mobile, all on desktop');
      assert.equal(visibleController,isCompact?1:2,'Firmware control lanes must use mobile switching');
      if (isCompact) {
        const tabs=page.locator('.lyo-mobile-lens-tabs button');
        for(let i=0;i<3;i++){
          await tabs.nth(i).click();
          assert.equal(await page.locator('.lyo-pressure-panel:visible').count(),1);
          assert.equal(await tabs.nth(i).getAttribute('aria-pressed'),'true');
          const key=['heat','vapor','response'][i];
          assert(await page.locator('.lyo-pressure-panel[data-active="true"]').getAttribute('aria-label'));
          assert.equal(await page.locator(`.lyo-pressure-panel[data-active="true"]`).count(),1);
          assert.equal(await page.locator(`.lyo-pressure-panel[data-active="true"] .lyo-mini-science-plot > svg`).count(),1);
        }
        const buttons=page.locator('.lyo-mobile-controller-tabs button');
        await buttons.nth(1).click();
        assert.equal(await page.locator('.lyo-control-lane--temperature:visible').count(),1);
        await buttons.nth(0).click();
        assert.equal(await page.locator('.lyo-control-lane--pressure:visible').count(),1);
        const p500=page.locator('.lyo-mobile-pressure-picks button').filter({hasText:'500'});
        await p500.click();
        assert.equal(await p500.getAttribute('aria-pressed'),'true');
        const smallTargets=await page.locator('.lyo-mobile-lens-tabs button, .lyo-mobile-controller-tabs button, .lyo-mobile-pressure-picks button').evaluateAll(els=>els.filter(e=>e.getBoundingClientRect().height<44).map(e=>e.textContent));
        assert.deepEqual(smallTargets,[],'Touch targets <44px');
      }
      const before=await page.locator('.lyo-pressure-metrics').innerText();
      await page.locator('.lyo-pressure-controls input[type=range]').first().fill('-30');
      const after=await page.locator('.lyo-pressure-metrics').innerText();
      assert.notEqual(before,after);
      assert(after.includes('178.0 mTorr'),'IAPWS ice equilibrium at -30 F');
      const wb=await page.locator('.lyo-window-metrics').innerText();
      await page.locator('.lyo-window-controls input[type=range]').nth(1).fill('-30');
      const wa=await page.locator('.lyo-window-metrics').innerText();
      assert.notEqual(wb,wa);
      assert.equal(errors.length,0,JSON.stringify(errors));
      results.push({width,figures:figures.length,plots:6,mobileTabs:isCompact,
        visiblePressurePanels:visiblePanels,controllerLanes:visibleController,
        minFigureWidth:+Math.min(...widths).toFixed(0),overflow:false,errors:0});
    } catch(e) {
      failed=true;
      results.push({width,error:String(e),pageErrors:errors});
    } finally {await page.close()}
  }
} finally {await browser.close()}
console.log(JSON.stringify({suite:'Lyophilization mobile-first figure layout',results}));
if(failed) process.exitCode=1;
