import assert from 'node:assert/strict'
import { chromium } from 'playwright-core'
import { mkdir } from 'node:fs/promises'

const base = process.env.JOURNAL_ORIGIN ?? 'http://localhost:11266/'
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH??'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']})
await mkdir('artifacts/atlas-review',{recursive:true})
const rect=e=>{const r=e.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,width:r.width,height:r.height}}
try {
  for (const size of [
   {width:320,height:568}, {width:360,height:640},
   {width:375,height:667}, {width:375,height:812},
   {width:390,height:844}, {width:430,height:932},
   {width:667,height:375}, {width:740,height:360},
   {width:767,height:600},
  ].filter(item=>!process.env.ATLAS_ONLY||String(item.width)===process.env.ATLAS_ONLY)) {
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
     const figure=panel.querySelector('.quotes-fingerprint--portrait')
     const idle=panel.querySelector('.quotes-atlas-inspector')
     const zoom=panel.querySelector('.quotes-atlas-camera-controls')
    const svg=panel.querySelector('svg.quotes-atlas-svg')
    const tabs=document.querySelector('.mobile-tabbar')
    const header=document.querySelector('.site-header')
    const probe=document.elementFromPoint(innerWidth/2,tabs.getBoundingClientRect().top+20)
     const r=e=>{const a=e.getBoundingClientRect();return {top:a.top,bottom:a.bottom,left:a.left,right:a.right,width:a.width,height:a.height}}
     return {panel:r(panel),atlasHeader:r(atlasHeader),viewport:r(vp),figure:r(figure),
       idle:r(idle),zoom:r(zoom),header:r(header),tabs:r(tabs),bottomInteractive:!!probe?.closest('.mobile-tabbar'),
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
   assert(info.figure.height-info.viewport.height<2,'graph must occupy the entire portrait figure; inspector may not reserve flex height')
   assert(info.idle.height<65,'unselected hint must not reserve a giant inspector panel')
   assert(info.idle.bottom<=info.figure.bottom+.5,'unselected hint stays within graph bounds')
   assert(info.idle.right+7<=info.zoom.left,'unselected hint must not obstruct zoom controls')
  assert.equal(info.backgroundOverflow,'hidden')
  assert(info.cameraViewBox!==null,'native SVG ZoomPort camera initialized')
  assert.deepEqual(info.controls,['Zoom in','Zoom out','Fit entire atlas'])
  await page.screenshot({path:'artifacts/atlas-review/zoomport-expanded-'+size.width+'x'+size.height+'.png',fullPage:false})
   // Use a truly hit-testable node. In short landscape layouts some SVG
   // circles legitimately sit underneath the floating inspector or controls.
   const accessibleNode=await overlay.locator('.quotes-atlas-node').evaluateAll(nodes=>nodes.findIndex(node=>{
     const hit=node.querySelector('.quotes-atlas-hit')
     const box=hit?.getBoundingClientRect()
     if(!box||box.width<2||box.height<2) return false
     const at=document.elementFromPoint(box.left+box.width/2,box.top+box.height/2)
     return at?.closest('[data-quote-id]')===node
   }))
   assert(accessibleNode>=0,'at least one graph node must be directly tappable')
   const node=overlay.locator('.quotes-atlas-node').nth(accessibleNode)
  const nodeId=await node.getAttribute('data-quote-id')
  await node.click({force:true})
  assert.equal(new URL(page.url()).pathname,'/quotes/','tap must not navigate to quote')
   assert.equal(await overlay.locator('.quotes-atlas-inspector-read').count(),1,'selected node opens inspector')
   const card=await page.evaluate(()=>{
     const panel=document.querySelector('.quotes-atlas-viewport')
     const figure=panel.querySelector('.quotes-fingerprint--portrait')
     const inspector=panel.querySelector('.quotes-atlas-inspector')
     const zoom=panel.querySelector('.quotes-atlas-camera-controls')
     const camera=panel.querySelector('.quotes-atlas-camera')
     const rect=e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right,top:b.top,bottom:b.bottom,width:b.width,height:b.height}}
     return {selected:rect(inspector),figure:rect(figure),camera:rect(camera),zoom:rect(zoom),
       textVisible:!!inspector.querySelector('p')?.getBoundingClientRect().height}
   })
   assert(card.selected.height<=113,'selected inspector should remain compact, not a fixed 145px shelf')
   assert(card.selected.top>=card.figure.top-.5&&card.selected.bottom<=card.figure.bottom+.5,'selected quote stays inside graph bounds')
   assert(card.selected.right+7<=card.zoom.left,'quote card must not overlap zoom controls')
   assert(card.figure.height-card.camera.height<2,'selection must not resize/compress the graph')
   assert(card.textVisible,'selected quotation text must remain readable')
   await page.screenshot({path:'artifacts/atlas-review/zoomport-selected-'+size.width+'x'+size.height+'.png',fullPage:false})
  const selected=overlay.locator('.quotes-atlas-node.is-selected')
  assert.equal(await selected.count(),1)
   assert(await selected.getAttribute('data-quote-id'),'tap must select a rendered node even when nodes overlap')
   await overlay.getByRole('button',{name:'Clear selected quotation'}).click()
   assert.equal(await overlay.locator('.quotes-atlas-inspector.has-selection').count(),0,'clear returns to compact idle hint')
   await node.click({force:true})
   assert.equal(await overlay.locator('.quotes-atlas-inspector.has-selection').count(),1,'reselect opens compact quote again')
   if(size.width===390) {
     // Emulate browser chrome expanding/collapsing while fullscreen is open.
     await page.setViewportSize({width:size.width,height:size.height-130})
     await page.waitForTimeout(100)
     const resized=await page.evaluate(()=>{
       const panel=document.querySelector('.quotes-atlas-viewport').getBoundingClientRect()
       const camera=document.querySelector('.quotes-atlas-camera').getBoundingClientRect()
       const nav=document.querySelector('.mobile-tabbar').getBoundingClientRect()
       const quote=document.querySelector('.quotes-atlas-inspector').getBoundingClientRect()
       return {panelBottom:panel.bottom,cameraBottom:camera.bottom,navTop:nav.top,quoteBottom:quote.bottom,quoteHeight:quote.height}
     })
     assert(resized.panelBottom<=resized.navTop+.5,'browser viewport shrink must leave tabbar available')
     assert(resized.cameraBottom<=resized.panelBottom+.5,'camera must remain inside overlay')
     assert(resized.quoteBottom<=resized.cameraBottom+.5,'inspector must remain visible after toolbar resize')
     assert(resized.quoteHeight<=113,'inspector must remain compact after toolbar resize')
     await page.setViewportSize(size)
     await page.waitForTimeout(100)
     const beforeRotation=await overlay.locator('svg.quotes-atlas-svg').getAttribute('viewBox')
     await page.setViewportSize({width:667,height:375})
     await page.waitForTimeout(170)
     const afterRotation=await overlay.locator('svg.quotes-atlas-svg').getAttribute('viewBox')
     assert.notEqual(afterRotation,beforeRotation,'landscape should reproject atlas rather than flatten portrait nodes')
     assert.equal(await overlay.locator('.quotes-atlas-node').count(),83,'rotation preserves graph contents')
     assert.equal(await overlay.locator('.quotes-atlas-node.is-selected').count(),1,'rotation preserves selection')
     const rotated=await page.evaluate(()=>{
       const panel=document.querySelector('.quotes-atlas-viewport').getBoundingClientRect()
       const nav=document.querySelector('.mobile-tabbar').getBoundingClientRect()
       const card=document.querySelector('.quotes-atlas-inspector').getBoundingClientRect()
       return {panelBottom:panel.bottom,navTop:nav.top,cardHeight:card.height,cardBottom:card.bottom}
     })
     assert(rotated.panelBottom<=rotated.navTop+.5,'landscape tabbar must remain interactive')
     assert(rotated.cardBottom<=rotated.panelBottom+.5&&rotated.cardHeight<=113,'landscape inspector remains compact')
     await page.setViewportSize(size)
     await page.waitForTimeout(170)
     assert.equal(await overlay.locator('.quotes-atlas-node.is-selected').count(),1,'returning to portrait preserves selection')
   }
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
   console.log('MOBILE_ATLAS_PASS',size.width,size.height,JSON.stringify({cameraViewBox:info.cameraViewBox,stage:info.viewport,idleHeight:info.idle.height,selectedHeight:card.selected.height,bottomHit:info.bottomInteractive,selectedNode:nodeId,buttonIcon:icon.width}))
  await page.close()
 }
 const page=await browser.newPage({viewport:{width:1440,height:900},serviceWorkers:'block'})
 await page.goto(base+'quotes/',{waitUntil:'domcontentloaded'})
 assert.equal(await page.getByRole('button',{name:'Expand thought atlas to portrait view'}).isVisible(),false)
 assert.equal(await page.locator('svg.quotes-atlas-svg').getAttribute('viewBox'),'0 0 1080 365')
 console.log('DESKTOP_GRAPH_UNCHANGED')
 await page.close()
} finally {await browser.close()}
