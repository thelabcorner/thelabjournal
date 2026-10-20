import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']});
const origins=[
 ['lyophilization','low-temp-lyophilization-three-theses',104],
 ['decarboxylation','gravimetric-decarboxylation-co2-progress',122],
];
if(!process.argv.includes('--print-only')) for(const [name,slug,expected] of origins){
 for(const width of [320,390,768,1440]){
  for(const theme of ['light','dark']){
   const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce',serviceWorkers:'block'});
   await page.addInitScript(t=>localStorage.setItem('thelabcorner.journal.preferences.v2',JSON.stringify({theme:t})),theme);
   try{
    await page.goto('http://127.0.0.1:11264/research/'+slug+'/',{waitUntil:'domcontentloaded'});
    await page.locator('.research-body .katex-inline').first().waitFor();
    const info=await page.evaluate(()=>{
      const formulas=[...document.querySelectorAll('.research-body .katex-inline')];
      const misses=[];const overflow=[];const geometry=[];
      formulas.forEach((e,i)=>{
        const left=e.previousSibling,right=e.nextSibling;
        const pre=left?.nodeType===3?left.textContent:'';
        const post=right?.nodeType===3?right.textContent:'';
        if(pre.length&&!/\s$/.test(pre)&&/[\w]$/.test(pre))misses.push({i,side:'before',sample:pre.slice(-30)});
        if(post.length&&!/^\s/.test(post)&&/^\w/.test(post))misses.push({i,side:'after',sample:post.slice(0,30)});
        const s=getComputedStyle(e),r=e.getBoundingClientRect(),p=e.parentElement.getBoundingClientRect();
        if(r.right>document.documentElement.clientWidth+3 || r.left<0 || e.scrollWidth>e.clientWidth+3)
          overflow.push({i,form:e.getAttribute('aria-label'),right:r.right,sc:e.scrollWidth,c:e.clientWidth,p:p.width});
        geometry.push({display:s.display,left:parseFloat(s.marginLeft),right:parseFloat(s.marginRight),vertical:s.verticalAlign,rects:e.getClientRects().length,height:r.height});
      });
      return {count:formulas.length,misses,overflow,notAtomic:geometry.filter(g=>g.display!=='inline-block'||g.rects!==1).slice(0,10),
      tooClose:geometry.filter(g=>g.left<.7||g.right<.7).slice(0,10), docOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      worstHeight:Math.max(...geometry.map(g=>g.height))};
    });
    assert.equal(info.count,expected,name+' inline formula count drift');
    assert.deepEqual(info.misses,[],name+' missing text boundaries');
    assert.deepEqual(info.notAtomic,[],name+' broken inline formula boxes');
    assert.deepEqual(info.tooClose,[],name+' insufficient spacing');
    assert(info.docOverflow<=1,name+' viewport overflow');
    assert.deepEqual(info.overflow,[],name+' overflowing inline formula');
    console.log(JSON.stringify({name,width,theme,count:info.count,worstHeight:info.worstHeight,status:'PASS'}));
   }finally{await page.close();}
  }
 }
}
// Print CSS must retain the same inline-math baseline and avoid clipping or
// artificial split lines, independently of screen-only layout rules.
for (const [name,slug,expected] of origins) {
  const page=await browser.newPage({viewport:{width:1024,height:1320},reducedMotion:'reduce'});
  try {
    await page.emulateMedia({media:'print'});
    await page.goto('http://127.0.0.1:11264/research/'+slug+'/',{waitUntil:'domcontentloaded'});
    await page.locator('.research-body .katex-inline').first().waitFor();
    const info=await page.evaluate(()=>{
      const all=[...document.querySelectorAll('.research-body .katex-inline')];
      return {count:all.length,unatomic:all.filter(e=>getComputedStyle(e).display!=='inline-block' || e.getClientRects().length!==1).length,
        overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        inlineOutOfParent:all.filter(e=>e.getBoundingClientRect().width>e.parentElement.getBoundingClientRect().width+2).length};
    });
    assert.equal(info.count,expected,name+' print count');
    assert.equal(info.unatomic,0,name+' print math wrap');
    assert.equal(info.inlineOutOfParent,0,name+' print inline equation exceeds text container');
    console.log(JSON.stringify({name,media:'print',count:info.count,documentOverflow:info.overflow,status:'PASS'}));
  } finally {await page.close();}
}
await browser.close();
