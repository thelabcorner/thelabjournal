import {chromium} from 'playwright-core'
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--no-sandbox']})
let failed=0
for(const width of [375,1440]){
 const page=await browser.newPage({viewport:{width,height:width<768?812:900},isMobile:width<768,hasTouch:width<768})
 try{
  await page.goto('http://127.0.0.1:11264/virtual-fixture.html',{waitUntil:'networkidle'})
  const pane=page.locator('[aria-label="Fixture search results"]')
  const browse=page.locator('[aria-label="Fixture recent writing"]')
  await pane.scrollIntoViewIfNeeded()
  await page.getByRole('button',{name:'Advance selection'}).click()
  await page.waitForTimeout(120)
  const search=await pane.evaluate(el=>({scrollTop:el.scrollTop,visible:[...el.querySelectorAll('[data-pane-index]')].map(n=>Number(n.getAttribute('data-pane-index')))}))
  if(search.scrollTop<2000||!search.visible.includes(80))throw Error('activeIndex did not bring 80 into view '+JSON.stringify(search))
  // A far jump must retain a bounded number of mounted options.
  await pane.evaluate(el=>{el.scrollTop=el.scrollHeight*.86;el.dispatchEvent(new Event('scroll'))})
  await page.waitForTimeout(180)
  const farSearch=await pane.evaluate(el=>({count:el.querySelectorAll('[data-pane-index]').length,largest:Math.max(...[...el.querySelectorAll('[data-pane-index]')].map(n=>Number(n.getAttribute('data-pane-index'))))}))
  if(farSearch.count>30||farSearch.largest<1200)throw Error('search far-scroll failure '+JSON.stringify(farSearch))
  await browse.scrollIntoViewIfNeeded()
  await browse.evaluate(el=>{el.scrollTop=el.scrollHeight*.94;el.dispatchEvent(new Event('scroll'))})
  await page.waitForTimeout(180)
  const farBrowse=await browse.evaluate(el=>({count:el.querySelectorAll('[data-browse-index]').length,largest:Math.max(...[...el.querySelectorAll('[data-browse-index]')].map(n=>Number(n.getAttribute('data-browse-index'))))}))
  if(farBrowse.count>30||farBrowse.largest<1350)throw Error('browse far-scroll failure '+JSON.stringify(farBrowse))
  console.log(JSON.stringify({width,pass:true,activeIndex:search.visible,searchScroll:search.scrollTop,farSearch,farBrowse}))
 }catch(e){failed++;console.log(JSON.stringify({width,pass:false,error:String(e)}))}
 await page.close()
}
await browser.close()
if(failed)process.exit(1)
