import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const base = process.env.JOURNAL_ORIGIN ?? 'http://localhost:11266/'
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']})
await mkdir('artifacts/atlas-review',{recursive:true})
const rect=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}}
try {
 for (const size of [{width:320,height:568},{width:375,height:667},{width:375,height:812},{width:430,height:932}]) {
  const page=await browser.newPage({viewport:size,deviceScaleFactor:1,serviceWorkers:'block',hasTouch:true,isMobile:true})
  const errors=[]
  page.on('pageerror',e=>errors.push(e.message))
  await page.goto(base+'quotes/',{waitUntil:'domcontentloaded'})
  const trigger=page.getByRole('button',{name:'Expand thought atlas to portrait view'})
  await trigger.waitFor()
  assert(await trigger.isVisible())
  const icon=await trigger.locator('svg').evaluate(e=>{const r=e.getBoundingClientRect();return {width:r.width,height:r.height}})
  assert(icon.width<=16&&icon.height<=16,'expand icon must be small')
  await trigger.click()
  const overlay=page.getByRole('dialog',{name:'Expanded thought atlas'})
  await overlay.waitFor({state:'visible'})
  const viewport=overlay.locator('.quotes-atlas-camera')
  await viewport.waitFor({state:'visible'})
  await page.waitForTimeout(130)
  assert.equal(await overlay.locator('.quotes-atlas-node').count(),83)
  assert.equal(await overlay.locator('.quotes-atlas-links path').count(),118)
  assert.equal(await overlay.locator('.quotes-atlas-portrait-scroll').count(),0)
  const info=await page.evaluate(()=>{
    const panel=document.querySelector('.quotes-atlas-viewport')
    const atlasHeader=panel.querySelector('.quotes-atlas-viewport-header')
    const vp=panel.querySelector('.quotes-atlas-camera')
    const svg=panel.querySelector('svg.quotes-atlas-svg')
    const tabs=document.querySelector('.mobile-tabbar')
    const header=document.querySelector('.site-header')
    const probe=document.elementFromPoint(innerWidth/2,tabs.getBoundingClientRect().top+20)
    const r=e=>{const a=e.getBoundingClientRect();return {top:a.top,bottom:a.bottom,width:a.width,height:a.height}}
    return {panel:r(panel),atlasHeader:r(atlasHeader),viewport:r(vp),header:r(header),tabs:r(tabs),bottomInteractive:!!probe?.closest('.mobile-tabbar'),
      redundantHeaderCount:panel.querySelectorAll('.quotes-fingerprint--portrait .quotes-fingerprint-top').length,
      title:atlasHeader.querySelector('.quotes-atlas-viewport-title')?.textContent.trim(),
      documentWidth:document.documentElement.scrollWidth,pageWidth:innerWidth,
      touchAction:getComputedStyle(vp).touchAction,viewportOverflowY:getComputedStyle(vp).overflowY,
      cameraViewBox:svg.getAttribute('viewBox'),backgroundOverflow:document.body.style.overflow,
      controls:[...panel.querySelectorAll('.quotes-atlas-camera-controls button')].map(e=>e.getAttribute('aria-label'))}
  })
  assert(info.panel.top >= info.header.bottom-.5,'overlay below shared header')
  assert.equal(info.atlasHeader.height,42,'atlas secondary header must match blog mobile reading-bar height (42px)')
  assert.equal(info.redundantHeaderCount,0,'no second metadata header above portrait graph')
  assert(info.viewport.top-info.atlasHeader.bottom<=5,'graph should begin directly beneath compact header')
  assert(info.title?.includes('Thought atlas') && info.title?.includes('83'),'title and count consolidated in one header')
  assert(info.panel.bottom <= info.tabs.top+.5,'bottom tabbar remains above overlay')
  assert(info.bottomInteractive,'bottom navigation must receive pointer events')
  assert.equal(info.documentWidth,info.pageWidth,'no horizontal overflow')
  assert.equal(info.touchAction,'none','camera owns pinch gestures')
  assert(info.viewportOverflowY!=='scroll'&&info.viewportOverflowY!=='auto','scrollbar replaced by camera')
  assert(info.viewport.height>100&&info.viewport.width>200,'camera stage fills available space')
  assert.equal(info.backgroundOverflow,'hidden')
  assert(info.cameraViewBox!==null,'native SVG ZoomPort camera initialized')
  assert.deepEqual(info.controls,['Zoom in','Zoom out','Fit entire atlas'])
  await page.screenshot({path:'artifacts/atlas-review/zoomport-expanded-'+size.width+'x'+size.height+'.png',fullPage:false})
  const node=overlay.locator('.quotes-atlas-node').first()
  const nodeId=await node.getAttribute('data-quote-id')
  await node.click({force:true})
  assert.equal(new URL(page.url()).pathname,'/quotes/','tap must not navigate to quote')
  assert.equal(await overlay.locator('.quotes-atlas-inspector-read').count(),1,'selected node opens inspector')
  const selected=overlay.locator('.quotes-atlas-node.is-selected')
  assert.equal(await selected.count(),1)
  assert(await selected.getAttribute('data-quote-id'),'tap must select a rendered node even when nodes overlap')
  const before=await overlay.locator('svg.quotes-atlas-svg').getAttribute('viewBox')
  await overlay.getByRole('button',{name:'Zoom in'}).click()
  await page.waitForTimeout(300)
  const after=await overlay.locator('svg.quotes-atlas-svg').getAttribute('viewBox')
  assert.notEqual(after,before,'ZoomPort zoom button must change SVG camera')
  await overlay.getByRole('button',{name:'Fit entire atlas'}).click()
  await page.waitForTimeout(80)
  const fitted=await overlay.locator('svg.quotes-atlas-svg').getAttribute('viewBox')
  assert.notEqual(fitted,after,'fit button must reset camera')
  const bar=await page.locator('.mobile-tabbar').boundingBox()
  assert(bar && bar.height>40)
  await page.getByRole('button',{name:'Close expanded atlas'}).click()
  assert.equal(await overlay.count(),0,'close button removes atlas')
  assert(await trigger.evaluate(el=>el===document.activeElement),'close returns focus to expand')
  assert(errors.length===0,'browser errors '+errors.join(' | '))
  console.log('MOBILE_ATLAS_PASS',size.width,size.height,JSON.stringify({cameraViewBox:info.cameraViewBox,stage:info.viewport,bottomHit:info.bottomInteractive,selectedNode:nodeId,buttonIcon:icon.width}))
  await page.close()
 }
 const page=await browser.newPage({viewport:{width:1440,height:900},serviceWorkers:'block'})
 await page.goto(base+'quotes/',{waitUntil:'domcontentloaded'})
 assert.equal(await page.getByRole('button',{name:'Expand thought atlas to portrait view'}).isVisible(),false)
 assert.equal(await page.locator('svg.quotes-atlas-svg').getAttribute('viewBox'),'0 0 1080 365')
 console.log('DESKTOP_GRAPH_UNCHANGED')
 await page.close()
} finally {await browser.close()}
