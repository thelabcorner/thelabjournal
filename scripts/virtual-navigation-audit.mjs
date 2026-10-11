import {chromium} from 'playwright-core'
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']})
let errors=0
for(const width of [375,1440]){
 const page=await browser.newPage({viewport:{width,height:width<768?812:900},isMobile:width<768,hasTouch:width<768})
 const pageerrors=[]
 page.on('pageerror',e=>pageerrors.push(e.message))
 try{
  await page.goto('http://127.0.0.1:11264/virtual-fixture.html',{waitUntil:'networkidle'})
  const archive=page.locator('[data-virtualized="archive"]')
  for(const layout of ['list','cards']){
   if(layout==='cards') await page.getByRole('button',{name:'Toggle layout'}).click()
   await archive.waitFor()
   await page.evaluate(()=>{
     const a=document.querySelector('[data-virtualized="archive"]')
     scrollTo({top:a.getBoundingClientRect().top+scrollY+26000,behavior:'instant'})
   })
   await page.waitForTimeout(160)
   const clicked=await page.evaluate(()=>{
     const nodes=[...document.querySelectorAll('[data-fixture-index]')]
     const visible=nodes.find(x=>{const r=x.getBoundingClientRect();return r.top>=80&&r.bottom<=innerHeight-70})
     if(!visible)throw Error('no focusable item in deep-scrolled viewport')
     const y=scrollY
     const id=Number(visible.getAttribute('data-fixture-index'))
     const link=visible.querySelector('a')
     if(!link)throw Error('no article link')
     link.click()
     return {y,id}
   })
   await page.locator('.fixture-article').waitFor()
   const openY=await page.evaluate(()=>scrollY)
   if(openY>2)throw Error('open did not reset '+openY)
   await page.getByRole('button',{name:'Return to archive'}).click()
   await archive.waitFor()
   await page.waitForTimeout(180)
   const restored=await page.evaluate(()=>scrollY)
   if(Math.abs(restored-clicked.y)>(layout==='cards'?200:110))throw Error(layout+' restore failed '+JSON.stringify({clicked,restored}))
   const visible=await page.evaluate(()=>[...document.querySelectorAll('[data-fixture-index]')].filter(x=>{const r=x.getBoundingClientRect();return r.top>=0&&r.top<innerHeight}).map(x=>Number(x.getAttribute('data-fixture-index'))))
   if(!visible.length || !visible.some(i=>Math.abs(i-clicked.id)<8))throw Error('returned to wrong virtual window '+JSON.stringify({clicked,visible}))
   console.log(JSON.stringify({width,layout,passed:true,opened:clicked.id,scrollBefore:clicked.y,scrollAfter:restored,firstVisible:visible[0]}))
  }
  const end=await page.evaluate(()=>{
   const el=document.querySelector('[data-virtualized="archive"]')
   const target=el.getBoundingClientRect().top+scrollY+el.getBoundingClientRect().height-innerHeight*.75
   scrollTo({top:target,behavior:'instant'})
   return target
  })
  await page.waitForTimeout(220)
  const bottom=await page.evaluate(()=>({
   y:scrollY,indices:[...document.querySelectorAll('[data-fixture-index]')].map(x=>Number(x.getAttribute('data-fixture-index'))),
  }))
  if(!bottom.indices.some(i=>i>=1497))throw Error('cannot reach end '+JSON.stringify({end,bottom:bottom.indices.slice(-5)}))
  if(pageerrors.length)throw Error('JS errors '+JSON.stringify(pageerrors))
  console.log(JSON.stringify({width,end:true,pass:true,last:Math.max(...bottom.indices)}))
 }catch(e){errors++;console.log(JSON.stringify({width,pass:false,error:String(e),pageerrors}))}
 await page.close()
}
await browser.close()
if(errors)process.exit(1)
