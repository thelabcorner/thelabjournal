import {chromium} from 'playwright-core'
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']})
const page=await browser.newPage({viewport:{width:1440,height:900}})
let failed=0
try{
 await page.goto('http://127.0.0.1:11264/virtual-fixture.html',{waitUntil:'networkidle'})
 await page.getByRole('button',{name:'Toggle layout'}).click()
 await page.evaluate(()=>{const a=document.querySelector('[data-virtualized="archive"]');scrollTo({top:a.getBoundingClientRect().top+scrollY+28000,behavior:'instant'})})
 await page.waitForTimeout(150)
 const check=async width=>{
  const a=await page.locator('[data-virtualized="archive"]').evaluate(node=>{
   const rows=[...node.querySelectorAll('.windowed-archive-row--cards')]
   const cellCounts=rows.map(r=>r.querySelectorAll('.windowed-archive-cell').length)
   const listItems=node.querySelectorAll('.journal-row').length
   return {viewport:innerWidth,document:document.documentElement.scrollWidth,rows:rows.length,listItems,counts:cellCounts}
  })
  if(a.viewport!==width||a.document>width+1||!a.rows||a.listItems>42||a.counts.some(c=>c!== (width<768?1:2)))throw Error('resize failed '+JSON.stringify(a))
  return a
 }
 const desktop=await check(1440)
 await page.setViewportSize({width:375,height:812})
 await page.waitForTimeout(280)
 const mobile=await check(375)
 await page.setViewportSize({width:1440,height:900})
 await page.waitForTimeout(280)
 const rebound=await check(1440)
 console.log(JSON.stringify({pass:true,desktop:{rows:desktop.rows},mobile:{rows:mobile.rows},rebound:{rows:rebound.rows}}))
}catch(e){failed++;console.log(JSON.stringify({pass:false,error:String(e)}))}
await page.close()
await browser.close()
if(failed)process.exit(1)
