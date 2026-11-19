/**
 * Structural NCM typography regression for manuscript figures and headings.
 *
 * Covers the original "physicsStatic" inline-caption regression and the
 * freeze-drying chapter numeral alignment without moving subsection labels.
 *
 * JOURNAL_TEST_ORIGIN=http://127.0.0.1:4207 node scripts/manuscript-heading-caption-audit.mjs
 */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium } from 'playwright-core';

const root = resolve(import.meta.dirname, '..');
const output = resolve(root, 'artifacts/manuscript-heading-caption-qa');
await mkdir(output, { recursive: true });
const origin = process.env.JOURNAL_TEST_ORIGIN || 'http://127.0.0.1:4207';
const slugs = {
  lyo: 'low-temp-lyophilization-three-theses',
  grav: 'gravimetric-decarboxylation-co2-progress',
  thca: 'thca-limonene-cosmo-rs',
};
const browser = await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox']});
const results = [];

function assertNear(actual, expected, tolerance, context) {
  assert(Math.abs(actual - expected) <= tolerance, context + ': expected ' + expected + '±' + tolerance + ', got ' + actual);
}

try {
  for (const theme of ['light', 'dark']) {
    for (const width of [320, 390, 768, 1440]) {
      for (const [kind, slug] of Object.entries(slugs)) {
        const page = await browser.newPage({
          viewport:{width,height:900},
          deviceScaleFactor:1,
          colorScheme:theme,
        });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        try {
          await page.goto(origin+'/research/'+slug+'/',{waitUntil:'domcontentloaded',timeout:30000});
          await page.locator('.research-body #title').waitFor({state:'attached',timeout:25000});
          await page.evaluate(() => document.fonts.ready);
          const data = await page.evaluate(() => {
            const root = document.querySelector('.research-body');
            const r = el => {
              const b=el.getBoundingClientRect();
              return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};
            };
            const style = el => {
              const s=getComputedStyle(el);
              return {display:s.display,position:s.position,gap:s.gap,align:s.alignItems,fontSize:s.fontSize,
                fontFamily:s.fontFamily,transform:s.textTransform,marginTop:s.marginTop,lineHeight:s.lineHeight,paddingTop:s.paddingTop};
            };
            const headings=[...root.querySelectorAll('.research-chapter-label,.research-section-label')]
              .map(el=>{
                const num=el.querySelector(':scope > .research-heading-number');
                const title=el.querySelector(':scope > h2,:scope > h3');
                if(!num||!title)return null;
                const nr=r(num),tr=r(title),wr=r(el);
                return {kind:el.classList.contains('research-chapter-label')?'chapter':'subsection',
                  number:num.textContent.trim(),title:title.textContent.trim(),numberRect:nr,titleRect:tr,wrapperRect:wr,
                  deltaTop:+(nr.y-tr.y).toFixed(3),numberStyle:style(num),wrapperStyle:style(el),titleStyle:style(title),
                  anchor:title.id,
                };
              }).filter(Boolean);
            const captions=[...root.querySelectorAll('.research-scientific-figure > figcaption.research-figure-caption')].map(el=>{
              const title=el.querySelector(':scope > .research-figure-caption__title');
              const detail=el.querySelector(':scope > .research-figure-caption__detail');
              const titleRect=r(title),detailRect=r(detail);
              return {figure:el.parentElement.className,display:style(el).display,gap:style(el).gap,
                title:title.textContent.trim(),detail:detail.textContent.trim(),
                titleStyle:style(title),detailStyle:style(detail),
                titleRect,detailRect,visualGap:+(detailRect.y-titleRect.bottom).toFixed(3),
                captionRect:r(el),figureRect:r(el.parentElement),
              };
            });
            const custom=[...root.querySelectorAll('.lyo-loop-figure > figcaption.lyo-loop-caption')].map(el=>{
              const children=el.querySelectorAll(':scope > span');return {
                title:children[0]?.textContent.trim(),detail:children[1]?.textContent.trim(),
                first:r(children[0]),second:r(children[1]),display:style(el).display,
              };
            });
            const aria=[...root.querySelectorAll('section[aria-labelledby]')].filter(
              s=>s.querySelector(':scope > .research-chapter-label')
            ).map(el=>({id:el.id,heading:el.getAttribute('aria-labelledby'),
              valid:!!el.querySelector('#'+CSS.escape(el.getAttribute('aria-labelledby')))}));
            return {headings,captions,custom,aria,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
          });

          const label = kind+'/'+theme+'/'+width;
          assert.equal(data.overflow, 0, 'Document horizontal overflow: '+label);
          assert.deepEqual(errors, [], 'Runtime errors: '+label);
          assert(data.aria.every(x=>x.valid), 'Chapter heading accessible IDs changed: '+label);

          // All existing subsection numbering systems must remain stable,
          // including independent SectionLabel consumers in the other papers.
          for(const h of data.headings.filter(x=>x.kind==='subsection')){
            if(width>=768){
              assertNear(h.deltaTop,1.875,.5,'Subsection baseline moved: '+h.number+' '+label);
            } else {
              assertNear(h.deltaTop,-19,1,'Mobile subsection hierarchy changed: '+h.number+' '+label);
              assertNear(h.numberRect.x,h.titleRect.x,1,
                'Mobile subsection number lost left alignment: '+h.number+' '+label);
            }
          }

          for (const c of data.captions) {
            assert.equal(c.display, 'grid', 'ScientificFigureCaption must be structural: '+label);
            assert.equal(c.gap, '4px', 'Caption CSS spacing token changed: '+label);
            assert.equal(c.titleStyle.transform, 'none', 'Title case changed: '+label);
            assert.equal(c.detailStyle.transform, 'none', 'Detail case changed: '+label);
            assert.equal(c.titleStyle.fontFamily, c.detailStyle.fontFamily, 'Font mismatch: '+label);
            assert(c.titleRect.width>0&&c.detailRect.width>0, 'Caption width collapsed: '+label);
            assert(c.titleRect.x>=c.figureRect.x-1&&c.detailRect.right<=c.figureRect.right+1,'Caption escaped figure: '+label);
            assertNear(c.visualGap,4,.1,'Unexpected spacing or overlap '+label+' '+c.title);
            assert(c.detailRect.bottom<=c.captionRect.bottom+1,'Detail text clipped: '+label+' '+c.title);
          }

          if(kind==='lyo'){
            assert.equal(data.captions.length,6,'All six lyo two-line figure headers must use one component: '+label);
            assert.equal(data.custom.length,1,'Authored process-loop caption must remain independent: '+label);
            const chapters=data.headings.filter(h=>h.kind==='chapter');
            assert.deepEqual(chapters.map(x=>x.number),['1','2','3','4','5','6','Ref'],'Chapter labels disappeared: '+label);
            const discussion=chapters.find(h=>h.number==='5');
            const subsection=data.headings.find(h=>h.number==='5.1');
            assert(discussion && subsection,'Discussion or subsection 5.1 missing: '+label);
            assert.equal(discussion.anchor,'discussion-heading','Discussion heading anchor changed');
            if(width>=768) {
              assert.equal(discussion.wrapperStyle.display,'grid','Chapter no longer baseline-grid-aligned: '+label);
              for(const h of chapters){
                assert.equal(h.numberStyle.position,'static','Chapter reverted to absolute positioning: '+label);
                assertNear(h.deltaTop,6,1,'Chapter baseline '+h.number+' '+label);
                assertNear(h.titleRect.x,h.wrapperRect.x,1,'Chapter heading moved off prose left edge: '+label);
                assertNear(h.titleRect.x-h.numberRect.right,width<1024?6:10,1,
                  'Chapter gutter width changed: '+h.number+' '+label);
                assert(h.numberRect.right<=h.titleRect.x-5,'Number overlaps chapter title: '+label);
              }
              assertNear(subsection.deltaTop,1.875,.5,'Section 5.1 position changed: '+label);
            } else {
              // Mobile's deliberately stacked index/title design was not part of the desktop regression.
              assert.equal(discussion.wrapperStyle.display,'block','Mobile chapter changed to side-gutter: '+label);
              assertNear(discussion.deltaTop,-19,1,'Mobile chapter title spacing changed: '+label);
              assertNear(subsection.deltaTop,-19,1,'Mobile 5.1 layout changed: '+label);
              assertNear(discussion.numberRect.x,discussion.titleRect.x,1,
                'Mobile chapter index floated to the right: '+label);
              assertNear(subsection.numberRect.x,subsection.titleRect.x,1,
                'Existing mobile 5.1 left alignment changed: '+label);
            }
            if((width===390||width===1440)){
              // Element screenshots crop the deliberately outside-the-prose
              // number gutter, so capture a little of the surrounding viewport.
              const screenshotGutter = async (selector, name) => {
                const locator=page.locator(selector);
                await locator.scrollIntoViewIfNeeded();
                const b=await locator.boundingBox();
                assert(b,'Missing screenshot target: '+selector);
                const x=Math.max(0,b.x-46), y=Math.max(0,b.y-8);
                const w=Math.min(width-x,b.width+b.x-x+8);
                const h=Math.min(900-y,b.height+16);
                assert(w>10&&h>5,'Invalid screenshot geometry');
                await page.screenshot({path:resolve(output,name+'-'+theme+'-'+width+'.png'),
                  clip:{x,y,width:w,height:h}});
              };
              await screenshotGutter('#discussion > .research-chapter-label','chapter-5');
              await screenshotGutter('#discussion-synthesis > .research-section-label','subsection-5-1');
              await page.locator('.lyo-controller-figure > .research-figure-caption').screenshot({
                path:resolve(output,'controller-caption-'+theme+'-'+width+'.png'),
              });
            }
          } else if(kind==='grav') {
            assert.equal(data.captions.length,3,'All three gravimetric figure headers must use one component: '+label);
            if(width===1440){
              const one=data.headings.find(h=>h.number==='1.1');
              assertNear(one?.deltaTop,1.875,.5,'Existing gravimetric subsection alignment changed');
            }
          } else {
            assert.equal(data.captions.length,0,'THCA caption hierarchy should not be altered without migrating its distinct figures: '+label);
          }
          results.push({kind,width,theme,captions:data.captions.length,chapterHeadings:data.headings.filter(h=>h.kind==='chapter').length,documentOverflow:0});
        } finally { await page.close(); }
      }
    }
  }

  // Browser's print mode and dedicated publication surface are separate; both
  // need a chapter-number/title relationship without mobile gutters.
  for (const kind of ['lyo','grav']) {
    const page=await browser.newPage({viewport:{width:1200,height:900}});
    try {
      await page.emulateMedia({media:'print'});
      await page.goto(origin+'/research/'+slugs[kind]+'/',{waitUntil:'domcontentloaded',timeout:30000});
      await page.locator('.research-body #title').waitFor({state:'attached',timeout:25000});
      const print=await page.evaluate(()=>{
        return [...document.querySelectorAll('.research-body .research-chapter-label')].map(el=>{
          const n=el.querySelector(':scope > .research-heading-number'),h=el.querySelector(':scope > h2');
          return {number:n.textContent.trim(),display:getComputedStyle(el).display,
            pos:getComputedStyle(n).position,x:n.getBoundingClientRect().x,
            numberRight:n.getBoundingClientRect().right,titleLeft:h.getBoundingClientRect().left,
            numY:n.getBoundingClientRect().y,titleY:h.getBoundingClientRect().y};
        });
      });
      if(kind==='lyo'){
        assert.equal(print.length,7,'Print heading count differs from manuscript');
        for(const h of print){
          assert.equal(h.display,'flex','Printed chapter must be an inline number/title pair');
          assert.equal(h.pos,'static','Printed chapter number must stay in document flow');
          assert(h.numberRight<=h.titleLeft,'Printed chapter index overlaps title');
          assert(Math.abs(h.numY-h.titleY)<=8,'Printed chapter label no longer shares baseline');
        }
      }
      results.push({kind,theme:'print',width:1200,chapters:print.length});
    }finally{await page.close();}
  }
} finally {await browser.close();}
console.log(JSON.stringify({passed:results.length,results},null,2));
