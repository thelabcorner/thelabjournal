/**
 * End-to-end NCM manuscript copy-anchor contract.
 * Auto-starts an isolated Vite server when no origin is supplied.
 * Also run against a built production preview:
 * JOURNAL_TEST_ORIGIN=http://127.0.0.1:4212 node scripts/manuscript-anchor-links-audit.mjs
 */
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer as createPortProbe } from 'node:net';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright-core';

const repo=resolve(import.meta.dirname,'..');
let origin=process.env.JOURNAL_TEST_ORIGIN;
let ownedServer;
if(!origin) {
  // Allocate an ephemeral port, avoiding conflicts with the user's own
  // development sessions or preview server. The audit owns only this process.
  const port=await new Promise((resolvePort,reject)=>{
    const probe=createPortProbe();
    probe.on('error',reject);
    probe.listen(0,'127.0.0.1',()=>{
      const value=probe.address().port;
      probe.close(()=>resolvePort(value));
    });
  });
  origin='http://127.0.0.1:'+port;
  ownedServer=spawn(process.execPath,[
    resolve(repo,'node_modules/vite/bin/vite.js'),
    '--host','127.0.0.1','--port',String(port),'--strictPort',
  ],{cwd:repo,stdio:['ignore','pipe','pipe']});
  let serverLog='';
  for(const stream of [ownedServer.stdout,ownedServer.stderr]){
    stream.on('data',chunk=>{serverLog=(serverLog+chunk.toString()).slice(-3000);});
  }
  let ready=false;
  for(let i=0;i<90;i++){
    if(ownedServer.exitCode!==null) break;
    try{
      const response=await fetch(origin+'/');
      if(response.ok){ready=true;break;}
    }catch{}
    await delay(110);
  }
  if(!ready){
    ownedServer.kill();
    throw new Error('Manuscript audit Vite server did not start: '+serverLog);
  }
}
const slugs={
  lyo:'low-temp-lyophilization-three-theses',
  grav:'gravimetric-decarboxylation-co2-progress',
  thca:'thca-limonene-cosmo-rs',
};
const output=resolve(import.meta.dirname,'../artifacts/manuscript-anchor-links-qa');
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,channel:'chrome',args:['--no-sandbox']});
const results=[];
try {
 for(const [kind,slug] of Object.entries(slugs)) {
  for(const theme of ['dark','light']) {
   for(const width of [390,768,1440]) {
    const touch=width===390;
    const context=await browser.newContext({
      viewport:{width,height:900},
      deviceScaleFactor:1,
      colorScheme:theme,
      hasTouch:touch,
      isMobile:touch,
    });
    await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const route=origin+'/research/'+slug+'/';
    try {
      await page.goto(route,{waitUntil:'domcontentloaded',timeout:30000});
      await page.locator('.research-body #title h1').waitFor({state:'attached',timeout:20000});
      await page.locator('.research-body .research-heading-permalink').first().waitFor({state:'attached'});
      await page.evaluate(()=>document.fonts.ready);
      const all=await page.locator('.research-body .research-heading-permalink').evaluateAll(buttons =>
        buttons.map(b=>{
          const heading=b.closest('h1,h2,h3,h4');
          const container=b.parentElement?.closest('section[id],article[id],div[id]');
          const css=getComputedStyle(b);
          return {
            title:heading?.getAttribute('aria-label'),
            headingText:heading?.textContent?.trim(),
            headingId:heading?.id,
            anchor:b.dataset.anchorId || container?.id,
            fallback:b.dataset.fallbackId,
            status:b.querySelector('[role=status]')?.textContent,
            type:b.getAttribute('type'),
            buttonLabel:b.getAttribute('aria-label'),
            fontSize:css.fontSize,
            lastWordGeometry:(()=>{
              const word=heading?.querySelector('.research-heading-last-word')?.firstChild;
              if(!word||word.nodeType!==Node.TEXT_NODE||!word.textContent?.length)return null;
              const range=document.createRange();
              range.setStart(word,word.textContent.length-1);
              range.setEnd(word,word.textContent.length);
              const last=range.getBoundingClientRect(),button=b.getBoundingClientRect(),headingRect=heading.getBoundingClientRect();
              return {
                dy:+(button.y-last.y).toFixed(2),
                dx:+(button.x-last.right).toFixed(2),
                inBounds:button.right<=headingRect.right+1,
              };
            })(),
          };
        })
      );
      assert(all.length>12,'Expected permalink coverage throughout '+kind);
      assert(all.every(c=>c.anchor&&c.title&&c.type==='button'),
        'Heading missing canonical navigation ancestor/accessible title in '+kind);
      assert(all.every(c=>c.headingText===c.title),
        'Anchor decoration polluted heading source text in '+kind);
      assert.equal(new Set(all.map(c=>c.anchor)).size, all.length,
        'Duplicate target on one paper: '+kind);
      assert(all.every(c=>c.lastWordGeometry&&
        Math.abs(c.lastWordGeometry.dy)<=12&&c.lastWordGeometry.inBounds),
        'Orphaned link on its own heading line: '+kind+'/'+width);
      const numbered=all.filter(c=>/^\d+(?:\.\d+)?$/.test(c.headingId??''));
      assert.equal(numbered.length,0,'Heading IDs unexpectedly overwritten');
      await page.getByRole('heading',{name:'Abstract',exact:true}).waitFor();
      // The title and abstract provide links as well as numbered headings.
      assert(all.some(c=>c.anchor==='title'),'Missing title-page anchor');
      assert(all.some(c=>c.anchor==='abstract'),'Missing abstract anchor');
      if(kind==='lyo') assert(all.some(c=>c.anchor==='lyo-loop-feedback-title'),
        'Missing interactive scientific-figure heading link');
      if(kind==='grav') assert(all.some(c=>c.anchor==='research-controller-fault-heading'),
        'Missing controller fault-response heading link');
      const local=kind==='lyo'?'discussion-synthesis':kind==='grav'?'measurement-basics':'framework-sle';
      const active=all.some(c=>c.anchor===local) ? local : all.find(c=>c.anchor&&!['title','abstract'].includes(c.anchor))?.anchor;
      assert(active,'No section anchor for '+kind);
      // Directly select the button with the canonical enclosing section ID.
      const matching=page.locator('#'+active+' .research-heading-permalink').first();
      assert.equal(await matching.count(),1,'Missing target button for '+active);
      const heading=matching.locator('xpath=..');
      await heading.scrollIntoViewIfNeeded();
      await page.waitForTimeout(160);
      const before=await page.evaluate(()=>{
        const headings=[...document.querySelectorAll('.research-body .research-heading-number')];
        const sub=headings.find(n=>n.textContent.trim()==='5.1');
        const sr=sub?.parentElement?.querySelector('h3');
        return {
          url:location.href,
          history:history.length,
          y:scrollY,
          difference:sub&&sr?sub.getBoundingClientRect().y-sr.getBoundingClientRect().y:null,
          scrollWidth:document.documentElement.scrollWidth,
          viewportWidth:document.documentElement.clientWidth,
        };
      });
      assert(before.scrollWidth<=before.viewportWidth+1,'Unexpected page overflow at '+width);
      if(!touch){
        await page.mouse.move(0,0);
        await page.waitForTimeout(140);
        const hidden=await matching.evaluate(el=>getComputedStyle(el).opacity);
        assert.equal(hidden,'0','Non-hover control must be visually absent: '+kind+'/'+width);
        await heading.hover();
        await page.waitForTimeout(145);
        const visible=await matching.evaluate(el=>+getComputedStyle(el).opacity);
        assert(visible>=.7,'Hover must reveal muted control: '+kind+'/'+width);
      }else{
        const visible=await matching.evaluate(el=>+getComputedStyle(el).opacity);
        assert(visible>=.6,'Touch users need visible link control: '+kind);
      }
      if(theme==='dark'&&(width===390||width===1440)){
        await heading.screenshot({path:resolve(output,kind+'-'+width+'-hover.png')});
      }
      if(touch) await matching.tap();
      else await matching.click();
      await page.waitForTimeout(70);
      assert.equal(await matching.getAttribute('data-copy-state'),'copied',
        'Clipboard operation did not report real success: '+kind+'/'+theme+'/'+width);
      assert.equal(await matching.getAttribute('aria-label'),'Link copied');
      const copied=await page.evaluate(()=>navigator.clipboard.readText());
      const expected=route+'#'+encodeURIComponent(active);
      assert.equal(copied,expected,'Copied link points to incorrect section');
      const after=await page.evaluate(()=>({
        url:location.href,
        history:history.length,
        y:scrollY,
        width:document.documentElement.scrollWidth,
        viewport:document.documentElement.clientWidth,
      }));
      assert.equal(after.url,before.url,'Copy action navigated manuscript');
      assert.equal(after.history,before.history,'Copy action modified history');
      assert(Math.abs(after.y-before.y)<2,
        'Copy action changed reader position by '+(after.y-before.y));
      assert(after.width<=after.viewport+1,'Page overflow after adding copy affordance');
      if(kind==='lyo'&&width===1440){
        assert(before.difference!==null,'5.1 regression measurement unavailable');
        assert(Math.abs(before.difference-1.875)<=.5,'Subsection 5.1 alignment changed');
      }
      assert.deepEqual(errors,[],'Page errors in '+kind+'/'+theme+'/'+width);
      results.push({kind,theme,width,anchors:all.length,target:active,clipboard:true,scrollStable:true,errors:0});
    } finally {
      await context.close();
    }
   }
  }
 }

 // Keyboard discovery and Enter activation work even though the icon is
 // invisible until heading hover or focus. Reset is feedback, not navigation.
 {
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
  const page=await context.newPage();
  try {
   await page.goto(origin+'/research/'+slugs.lyo+'/',{waitUntil:'domcontentloaded'});
   const b=page.locator('#discussion-heading .research-heading-permalink');
   await b.waitFor();
   await b.scrollIntoViewIfNeeded();
   await page.mouse.move(0,0);
   await page.waitForTimeout(140);
   assert.equal(await b.evaluate(el=>getComputedStyle(el).opacity),'0');
   await b.focus();
   await page.waitForTimeout(150);
   assert((await b.evaluate(el=>+getComputedStyle(el).opacity))>.98,
    'Focused link must become visible');
   assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('aria-label')),
    'Copy link to Discussion','Keyboard control missing accessible label');
   await page.keyboard.press('Enter');
   await page.waitForTimeout(60);
   assert.equal(await b.getAttribute('data-copy-state'),'copied');
   assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),
    origin+'/research/'+slugs.lyo+'/#discussion');
   await page.waitForTimeout(1880);
   assert.equal(await b.getAttribute('data-copy-state'),'idle','Transient success feedback did not reset');
   results.push({kind:'lyo',theme:'keyboard',width:1440,enter:true,focusVisible:true});
  } finally {await context.close();}
 }

 // On LAN/insecure/embedded origins, clipboard.writeText can fail. The app's
 // safe selection-copy fallback must report success only when it really worked.
 for(const forcedFailure of [false,true]){
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.grantPermissions(['clipboard-read','clipboard-write'],{origin});
  await context.addInitScript({content:`
   (() => {
     const native = navigator.clipboard;
     Object.defineProperty(navigator,'clipboard',{
       configurable:true,
       value:{writeText:async()=>{throw Error('Synthetic permission denial')},
         readText:()=>native.readText()},
     });
     ${forcedFailure ? 'document.execCommand = () => false;' : ''}
   })();
  `});
  const page=await context.newPage();
  try{
   await page.goto(origin+'/research/'+slugs.lyo+'/',{waitUntil:'domcontentloaded'});
   const b=page.locator('#discussion-heading .research-heading-permalink');
   await b.waitFor();
   await b.scrollIntoViewIfNeeded();
   await b.focus();
   await page.keyboard.press('Enter');
   await page.waitForTimeout(70);
   const expectedState=forcedFailure?'error':'copied';
   assert.equal(await b.getAttribute('data-copy-state'),expectedState,
     'Clipboard fallback returned false-success');
   if(!forcedFailure){
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),
      origin+'/research/'+slugs.lyo+'/#discussion',
      'Legacy fallback did not copy the actual URL');
   }else{
    assert.equal(await b.getAttribute('aria-label'),'Unable to copy link');
   }
   results.push({kind:'lyo',theme:forcedFailure?'clipboard-unavailable':'clipboard-fallback',
     width:1440,state:expectedState});
  }finally{await context.close();}
 }

 // Clean-context deep links must actually arrive at the intended manuscript
 // section, not merely copy a correctly formatted URL.
 const directTargets=[
   [slugs.lyo,'discussion-synthesis'],
   [slugs.lyo,'lyo-loop-feedback-title'],
   [slugs.grav,'research-controller-fault-heading'],
   [slugs.thca,'framework-sle'],
 ];
 const deep=await browser.newContext({viewport:{width:1440,height:900}});
 await deep.grantPermissions(['clipboard-read','clipboard-write'],{origin});
 try {
   for(const [slug,id] of directTargets){
     const page=await deep.newPage();
     try{
       const expected=origin+'/research/'+slug+'/#'+id;
       await page.goto(expected,{waitUntil:'domcontentloaded',timeout:30000});
       await page.locator('#'+id).waitFor({state:'attached',timeout:20000});
       await page.waitForTimeout(700);
       const rect=await page.locator('#'+id).boundingBox();
       assert(rect&&rect.y>=90&&rect.y<210,
         'Copied deep link did not settle at target after async figures: '+id+' y='+rect?.y);
       if(id.endsWith('-title')||id.endsWith('-heading')){
         const b=page.locator('#'+id+' .research-heading-permalink');
         await b.focus();
         await page.keyboard.press('Enter');
         await page.waitForTimeout(60);
         assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),expected,
           'Custom scientific-figure anchor copied a parent chapter instead');
       }
       results.push({kind:slug,theme:'direct-link',width:1440,anchor:id,landingY:rect.y});
     }finally{await page.close();}
   }
 }finally{await deep.close();}

 // Print and publication export should never contain decorative link buttons.
 for(const slug of Object.values(slugs)){
   const page=await browser.newPage();
   try{
    await page.emulateMedia({media:'print'});
    await page.goto(origin+'/research/'+slug+'/',{waitUntil:'domcontentloaded',timeout:30000});
    await page.locator('.research-body #title h1').waitFor({state:'attached',timeout:20000});
    const visible=await page.locator('.research-body .research-heading-permalink').first().evaluate(el=>getComputedStyle(el).display);
    assert.equal(visible,'none','Printed heading must omit permalink controls');
    results.push({kind:slug,theme:'print',width:1280,hidden:true});
   }finally{await page.close();}
 }
}finally{
  await browser.close();
  ownedServer?.kill();
}
console.log(JSON.stringify({passed:results.length,results},null,2));
